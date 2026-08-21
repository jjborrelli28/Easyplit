import { NextResponse } from "next/server";

import type { GroupHistory } from "@prisma/client";
import { getServerSession } from "next-auth";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type { ServerErrorResponse, SuccessResponse } from "@/lib/api/types";
import AuthOptions from "@/lib/auth/options";
import prisma from "@/lib/prisma";

type GroupHistoryWithRemovedMember = GroupHistory & {
    removedMemberName?: string | null;
    removedMemberIsVirtual?: boolean;
};

// Get a complete history of all groups the user belongs to
type GetAllUserGroupHistoryHandler = (
    req: Request,
) => Promise<
    NextResponse<
        SuccessResponse<GroupHistoryWithRemovedMember[]> | ServerErrorResponse
    >
>;

export const GET: GetAllUserGroupHistoryHandler = async () => {
    try {
        const session = await getServerSession(AuthOptions);
        const userId = session?.user?.id;

        if (!userId) {
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

        const histories = await prisma.groupHistory.findMany({
            where: {
                group: {
                    members: {
                        some: {
                            userId,
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                updatedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                group: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        // `memberToRemove`'s `newValue` comes in two shapes: a plain
        // JSON-stringified id (the manual "remove member" action — never
        // denormalized the name at write time, and by the time this reads,
        // they're no longer in `group.members` to resolve it from either),
        // or `{ userId, name, isVirtual }` (written when a virtual user is
        // hard-deleted via /api/user/virtual-users/[id] — there the `User`
        // row is gone by the time anyone reads this, so it HAS to be
        // denormalized up front). Handle both: use the denormalized name
        // directly when present, otherwise fall back to batch-resolving the
        // (still-existing) `User` row for legacy plain-id entries.
        type RemovedMemberPayload = { userId: string; name?: string; isVirtual?: boolean };

        const parseRemovedMember = (
            newValue: string | null,
        ): RemovedMemberPayload | null => {
            if (!newValue) return null;

            try {
                const parsed = JSON.parse(newValue);

                return typeof parsed === "string"
                    ? { userId: parsed }
                    : parsed;
            } catch {
                return null;
            }
        };

        const legacyIds = Array.from(
            new Set(
                histories
                    .filter((history) => history.field === "memberToRemove")
                    .map((history) => parseRemovedMember(history.newValue))
                    .filter(
                        (payload): payload is RemovedMemberPayload =>
                            !!payload && payload.name === undefined,
                    )
                    .map((payload) => payload.userId),
            ),
        );

        const removedMembers = legacyIds.length
            ? await prisma.user.findMany({
                  where: { id: { in: legacyIds } },
                  select: { id: true, name: true },
              })
            : [];

        const removedMemberNameById = new Map(
            removedMembers.map((member) => [member.id, member.name]),
        );

        const enrichedHistories: GroupHistoryWithRemovedMember[] =
            histories.map((history) => {
                if (history.field !== "memberToRemove") return history;

                const payload = parseRemovedMember(history.newValue);

                if (!payload) return history;

                return {
                    ...history,
                    removedMemberName:
                        payload.name ??
                        removedMemberNameById.get(payload.userId) ??
                        null,
                    removedMemberIsVirtual: !!payload.isVirtual,
                };
            });

        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.DATA_FETCHED,
            message: {
                color: "success",
                icon: "CheckCircle",
                title: "Historiales de grupos obtenidos con éxito",
                content: [
                    {
                        text: "Se obtuvieron los historiales de los grupos a los que pertenecés.",
                    },
                ],
            },
            data: enrichedHistories ?? [],
        });
    } catch (error) {
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
