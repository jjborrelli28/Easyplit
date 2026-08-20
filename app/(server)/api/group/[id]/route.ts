import { NextResponse } from "next/server";

import type { Group } from "@prisma/client";
import { getServerSession } from "next-auth";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type {
    GroupUpdateFieldErrors,
    ServerErrorResponse,
    SuccessResponse,
} from "@/lib/api/types";
import AuthOptions from "@/lib/auth/options";
import { upsertContactsForRealUserIds } from "@/lib/contacts/helpers";
import prisma from "@/lib/prisma";
import {
    getGroupUpdateTitle,
    getParticipantIds,
    getSuccessMessage,
    getUpdatedGroupFields,
} from "@/lib/utils";
import { parseZodErrors } from "@/lib/validations/helpers";
import { updateGroupSchema } from "@/lib/validations/schemas";

// Get group
type GetGroupHandler = (
    req: Request,
    context: { params: Promise<{ id: string }> },
) => Promise<NextResponse<SuccessResponse<Group> | ServerErrorResponse>>;

export const GET: GetGroupHandler = async (req, context) => {
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

        const params = await context.params;
        const id = params.id;

        if (!id || typeof id !== "string" || id.length <= 1) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.INVALID_FIELD_FORMAT,
                        message: ["ID del grupo inválido."],
                        statusCode: 400,
                    },
                },
                { status: 400 },
            );
        }

        const group = await prisma.group.findUnique({
            where: { id },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                            },
                        },
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                expenses: {
                    include: {
                        createdBy: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                            },
                        },
                        paidBy: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                            },
                        },
                        participants: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        image: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!group) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.NOT_FOUND,
                        message: ["Grupo no encontrado."],
                        statusCode: 404,
                    },
                },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.DATA_FETCHED,
            message: {
                color: "success",
                icon: "CheckCircle",
                title: "Grupo obtenido con éxito!",
                content: [
                    {
                        text: "Los datos del grupo fueron obtenidos correctamente.",
                    },
                ],
            },
            data: group,
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

// Update group
type UpdateGroupHandler = (
    req: Request,
    context: { params: Promise<{ id: string }> },
) => Promise<
    NextResponse<
        SuccessResponse<Group> | ServerErrorResponse<GroupUpdateFieldErrors>
    >
>;

export const PATCH: UpdateGroupHandler = async (req, context) => {
    try {
        const session = await getServerSession(AuthOptions);
        const updatedById = session?.user?.id;

        if (!updatedById) {
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

        const params = await context.params;
        const id = params.id;
        const body = await req.json();

        const res = updateGroupSchema.safeParse(body);

        if (!res.success) {
            const fields = parseZodErrors(res.error) as GroupUpdateFieldErrors;

            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.INVALID_FIELD_FORMAT,
                        message: ["Revisá los datos ingresados."],
                        fields,
                        statusCode: 400,
                    },
                },
                { status: 400 },
            );
        }

        const {
            name,
            type,
            membersToAdd,
            memberToRemove,
            expensesToAdd,
            expenseToRemove,
        } = res.data;

        const group = await prisma.group.findUnique({
            where: { id },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                            },
                        },
                    },
                },
                expenses: {
                    include: {
                        participants: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        image: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!group) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.NOT_FOUND,
                        message: ["Grupo no encontrado."],
                        statusCode: 404,
                    },
                },
                { status: 404 },
            );
        }

        const isAuthorized =
            updatedById === group.createdById ||
            group.members.some((m) => m.userId === updatedById);

        if (!isAuthorized) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.FORBIDDEN,
                        message: ["No tenés permisos para modificar este grupo."],
                        statusCode: 403,
                    },
                },
                { status: 403 },
            );
        }

        // Only the group's creator can rename it or manage its members —
        // mirrors `isUserEditor` in the client, which already hides these
        // actions from any other member that `isAuthorized` above still lets
        // in. Adding/removing an expense from the group stays open to any
        // member, matching the existing (ungated) client behavior for those.
        const isPrivilegedEditor = updatedById === group.createdById;

        const isSelfRemoval =
            memberToRemove !== undefined && memberToRemove === updatedById;

        const touchesRestrictedFields =
            name !== undefined ||
            type !== undefined ||
            membersToAdd !== undefined ||
            (memberToRemove !== undefined && !isSelfRemoval);

        if (touchesRestrictedFields && !isPrivilegedEditor) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.FORBIDDEN,
                        message: [
                            "Solo quien creó el grupo puede realizar esta acción.",
                        ],
                        statusCode: 403,
                    },
                },
                { status: 403 },
            );
        }

        if (memberToRemove) {
            const memberExpenses = group.expenses.filter((e) =>
                e.participants.some((p) => p.userId === memberToRemove),
            );

            const isPayerOfSomeExpense = memberExpenses.some(
                (e) => e.paidById === memberToRemove,
            );

            if (isPayerOfSomeExpense) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: API_RESPONSE_CODE.INVALID_FIELD,
                            message: [
                                "No se puede remover al miembro porque pagó uno o más gastos del grupo. Reasigná el pago primero.",
                            ],
                            statusCode: 400,
                        },
                    },
                    { status: 400 },
                );
            }

            // Any real payment they already made on the group's expenses is
            // assumed to be settled between people outside the app —
            // removing them just redistributes each expense's total among
            // whoever's left, so there's no balance-based restriction here
            // beyond not being a payer and keeping each expense's minimum.
            const wouldEmptyExpense = memberExpenses.some(
                (e) => e.participants.length <= 2,
            );

            if (wouldEmptyExpense) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: API_RESPONSE_CODE.INVALID_FIELD,
                            message: [
                                "No se puede remover al miembro porque quedaría un gasto del grupo con un solo participante. Eliminá o reorganizá ese gasto primero.",
                            ],
                            statusCode: 400,
                        },
                    },
                    { status: 400 },
                );
            }

            await prisma.expenseParticipant.deleteMany({
                where: {
                    userId: memberToRemove,
                    expenseId: { in: memberExpenses.map((e) => e.id) },
                },
            });

            await prisma.groupMember.deleteMany({
                where: {
                    groupId: id,
                    userId: memberToRemove,
                },
            });
        }

        if (membersToAdd) {
            await Promise.all([
                prisma.groupMember.createMany({
                    data: membersToAdd.map((userId) => ({
                        groupId: id,
                        userId,
                    })),
                    skipDuplicates: true,
                }),
                upsertContactsForRealUserIds([
                    ...getParticipantIds(group.members),
                    ...membersToAdd,
                ]).catch((error) => {
                    console.error("Failed to upsert contacts for group update", error);
                }),
            ]);
        }

        if (expensesToAdd) {
            const effectiveMemberIds = new Set(
                getParticipantIds(group.members),
            );

            if (memberToRemove) effectiveMemberIds.delete(memberToRemove);
            if (membersToAdd) {
                membersToAdd.forEach((userId) => effectiveMemberIds.add(userId));
            }

            const expenses = await prisma.expense.findMany({
                where: {
                    id: { in: expensesToAdd },
                },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    image: true,
                                },
                            },
                        },
                    },
                },
            });

            for (const expense of expenses) {
                const excessParticipants = expense.participants.filter(
                    (p) => !effectiveMemberIds.has(p.userId),
                );

                if (excessParticipants.length > 0) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: {
                                code: API_RESPONSE_CODE.INVALID_FIELD,
                                message: [
                                    `Los participantes del gasto "${expense.name}" deben ser miembros del grupo.`,
                                ],
                                details: { excessParticipants },
                                statusCode: 400,
                            },
                        },
                        { status: 400 },
                    );
                }
            }

            await prisma.expense.updateMany({
                where: {
                    id: { in: expensesToAdd },
                },
                data: {
                    groupId: id,
                },
            });
        }

        if (expenseToRemove) {
            const targetExpense = group.expenses.find(
                (e) => e.id === expenseToRemove,
            );

            if (!targetExpense) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: API_RESPONSE_CODE.NOT_FOUND,
                            message: ["El gasto no pertenece a este grupo."],
                            statusCode: 404,
                        },
                    },
                    { status: 404 },
                );
            }

            await prisma.expense.update({
                where: { id: expenseToRemove },
                data: { groupId: null },
            });
        }

        const changedFields = getUpdatedGroupFields(group, {
            ...(name && { name }),
            ...(type && { type }),
            ...(membersToAdd && { membersToAdd }),
            ...(memberToRemove && { memberToRemove }),
            ...(expensesToAdd && { expensesToAdd }),
            ...(expenseToRemove && { expenseToRemove }),
        });

        const [, updatedGroup] = await Promise.all([
            changedFields.length > 0
                ? prisma.groupHistory.createMany({
                    data: changedFields.map((fieldChange) => ({
                        groupId: id,
                        field: fieldChange.field,
                        oldValue: fieldChange.oldValue,
                        newValue: fieldChange.newValue,
                        updatedById,
                    })),
                })
                : Promise.resolve(null),
            prisma.group.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(type && { type }),
                },
            }),
        ]);

        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.DATA_UPDATED,
            message: {
                color: "success",
                icon: "CheckCircle",
                title: getGroupUpdateTitle({
                    name,
                    type,
                    membersToAdd,
                    memberToRemove,
                    expensesToAdd,
                    expenseToRemove,
                }),
                content: [
                    ...(name ? getSuccessMessage.name(name, "group") : []),
                    ...(type ? getSuccessMessage.type(type, "group") : []),
                    ...(membersToAdd ? getSuccessMessage.membersToAdd(membersToAdd) : []),
                    ...(memberToRemove
                        ? getSuccessMessage.memberToRemove(
                            group.members.find((p) => p.userId === memberToRemove)?.user
                                ?.name,
                        )
                        : []),
                    ...(expensesToAdd
                        ? getSuccessMessage.expensesToAdd(expensesToAdd)
                        : []),
                    ...(expenseToRemove
                        ? getSuccessMessage.expenseToRemove(
                            group.expenses.find((p) => p.id === expenseToRemove)?.name,
                        )
                        : []),
                ],
            },
            data: updatedGroup,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: API_RESPONSE_CODE.INTERNAL_SERVER_ERROR,
                    message: ["Error interno del servidor."],
                    statusCode: 500,
                },
            },
            { status: 500 },
        );
    }
};

// Delete group
type DeleteGroupHandler = (
    req: Request,
    context: { params: Promise<{ id: string }> },
) => Promise<NextResponse<SuccessResponse<Group> | ServerErrorResponse>>;

export const DELETE: DeleteGroupHandler = async (req, context) => {
    try {
        const session = await getServerSession(AuthOptions);
        const createdById = session?.user?.id;

        if (!createdById) {
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

        const params = await context.params;
        const id = params.id;

        if (!id || typeof id !== "string" || id.length <= 1) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.INVALID_FIELD_FORMAT,
                        message: ["ID de grupo inválido."],
                        statusCode: 400,
                    },
                },
                { status: 400 },
            );
        }

        const group = await prisma.group.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                            },
                        },
                    },
                },
            },
        });

        if (!group) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.NOT_FOUND,
                        message: ["Grupo no encontrado."],
                        statusCode: 404,
                    },
                },
                { status: 404 },
            );
        }

        await prisma.groupMember.deleteMany({
            where: { groupId: id },
        });

        await prisma.group.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.DATA_DELETED,
            message: {
                color: "success",
                icon: "Trash",
                title: "¡Grupo eliminado con éxito!",
                content: [
                    {
                        text: "El grupo fue eliminado correctamente.",
                    },
                ],
            },
            data: group,
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
