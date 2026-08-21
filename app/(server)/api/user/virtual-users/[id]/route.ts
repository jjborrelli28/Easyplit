import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type { ServerErrorResponse, SuccessResponse } from "@/lib/api/types";
import AuthOptions from "@/lib/auth/options";
import prisma from "@/lib/prisma";

class BlockedDeletionError extends Error {}

// Hard-deletes a virtual user placeholder the logged-in user created.
// ExpenseParticipant/GroupMember cascade automatically (schema.prisma), so
// this removes them from every group/expense they're in — the same
// "redistribute their share among who's left" consequence the app already
// accepts for manually removing a single participant, just applied across
// everything at once. What's NOT already covered by that precedent, and
// must be blocked instead, is anything that would corrupt data rather than
// just redistribute a balance: being the recorded payer of an expense, or
// dropping a shared expense/group below its minimum participant/member
// count. All reads + the delete run in one transaction so a concurrent
// participant/member removal elsewhere can't slip through the gap between
// "we checked it's safe" and "we deleted it".
type DeleteVirtualUserHandler = (
    req: Request,
    context: { params: Promise<{ id: string }> },
) => Promise<NextResponse<SuccessResponse | ServerErrorResponse>>;

export const DELETE: DeleteVirtualUserHandler = async (req, context) => {
    try {
        const session = await getServerSession(AuthOptions);
        const loggedUserId = session?.user?.id;

        if (!loggedUserId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.UNAUTHORIZED,
                        message: ["No se registró una sesión iniciada."],
                        statusCode: 401,
                    },
                },
                { status: 401 },
            );
        }

        const { id } = await context.params;

        await prisma.$transaction(async (tx) => {
            const virtualUser = await tx.user.findUnique({ where: { id } });

            if (
                !virtualUser ||
                !virtualUser.isVirtual ||
                virtualUser.virtualCreatedById !== loggedUserId
            ) {
                throw new BlockedDeletionError(
                    "No se encontró el usuario virtual.",
                );
            }

            const paidExpenseCount = await tx.expense.count({
                where: { paidById: id },
            });

            if (paidExpenseCount > 0) {
                throw new BlockedDeletionError(
                    "Es quien pagó en al menos un gasto. Reasigná el pagador antes de eliminarlo.",
                );
            }

            // Defensive only: virtual users never hold sessions, so nothing
            // should ever have authored these as the acting user. Guards
            // against a raw FK-violation 500 if that assumption is ever
            // wrong, instead of a clean, explained error.
            const [
                createdExpenseCount,
                createdGroupCount,
                expenseHistoryCount,
                groupHistoryCount,
                createdVirtualUserCount,
            ] = await Promise.all([
                tx.expense.count({ where: { createdById: id } }),
                tx.group.count({ where: { createdById: id } }),
                tx.expenseHistory.count({ where: { updatedById: id } }),
                tx.groupHistory.count({ where: { updatedById: id } }),
                tx.user.count({ where: { virtualCreatedById: id } }),
            ]);

            if (
                createdExpenseCount > 0 ||
                createdGroupCount > 0 ||
                expenseHistoryCount > 0 ||
                groupHistoryCount > 0 ||
                createdVirtualUserCount > 0
            ) {
                throw new BlockedDeletionError(
                    "No se puede eliminar este usuario virtual en este momento.",
                );
            }

            const participations = await tx.expenseParticipant.findMany({
                where: { userId: id },
                select: {
                    expenseId: true,
                    amount: true,
                    expense: { select: { participants: { select: { id: true } } } },
                },
            });

            // Mirrors the ≥2-participants-after-removal floor already
            // enforced for manually removing a single participant.
            if (
                participations.some(
                    (p) => p.expense.participants.length <= 2,
                )
            ) {
                throw new BlockedDeletionError(
                    "Es participante único junto a otra persona en al menos un gasto. Ese gasto quedaría con un solo participante.",
                );
            }

            const memberships = await tx.groupMember.findMany({
                where: { userId: id },
                select: {
                    groupId: true,
                    group: { select: { members: { select: { id: true } } } },
                },
            });

            // Groups only require ≥1 member after removal (unlike expenses'
            // ≥2 floor) — matches the existing remove-member gate.
            if (memberships.some((m) => m.group.members.length <= 1)) {
                throw new BlockedDeletionError(
                    "Es el único miembro de al menos un grupo.",
                );
            }

            // ExpenseParticipant/GroupMember cascade silently — nothing else
            // in that path writes history for us, unlike the manual
            // "remove participant"/"remove member" actions (which log a
            // participantToRemove/memberToRemove entry themselves). Without
            // this, everyone else sharing that expense/group would just see
            // this person vanish with no explanation. Denormalize name +
            // isVirtual now, before the row disappears — mirrors the shape
            // `getUpdatedExpenseFields`'s participantToRemove resolver
            // already writes, and the shape group-histories' enrichment
            // (see /api/user/group-histories) now also understands.
            await Promise.all([
                participations.length > 0
                    ? tx.expenseHistory.createMany({
                          data: participations.map((p) => ({
                              expenseId: p.expenseId,
                              field: "participantToRemove",
                              oldValue: "null",
                              newValue: JSON.stringify({
                                  userId: id,
                                  name: virtualUser.name,
                                  amount: p.amount,
                                  isVirtual: true,
                              }),
                              updatedById: loggedUserId,
                          })),
                      })
                    : Promise.resolve(),
                memberships.length > 0
                    ? tx.groupHistory.createMany({
                          data: memberships.map((m) => ({
                              groupId: m.groupId,
                              field: "memberToRemove",
                              oldValue: "null",
                              newValue: JSON.stringify({
                                  userId: id,
                                  name: virtualUser.name,
                                  isVirtual: true,
                              }),
                              updatedById: loggedUserId,
                          })),
                      })
                    : Promise.resolve(),
            ]);

            await tx.user.delete({ where: { id } });
        });

        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.DATA_DELETED,
            message: {
                color: "success",
                icon: "Trash",
                title: "¡Usuario virtual eliminado!",
                content: [
                    {
                        text: "Fue eliminado de todos los grupos y gastos en los que participaba.",
                    },
                ],
            },
        });
    } catch (error) {
        if (error instanceof BlockedDeletionError) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.NO_CHANGES_PROVIDED,
                        message: [error.message],
                        statusCode: 400,
                    },
                },
                { status: 400 },
            );
        }

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: API_RESPONSE_CODE.INTERNAL_SERVER_ERROR,
                    message: ["Error interno del servidor."],
                    details: error,
                    statusCode: 500,
                },
            },
            { status: 500 },
        );
    }
};
