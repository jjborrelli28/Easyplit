import { NextResponse } from "next/server";

import type { Expense } from "@prisma/client";
import { getServerSession } from "next-auth";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type {
    ExpenseUpdateFieldErrors,
    ServerErrorResponse,
    SuccessResponse,
} from "@/lib/api/types";
import AuthOptions from "@/lib/auth/options";
import { upsertContactsForRealUserIds } from "@/lib/contacts/helpers";
import prisma from "@/lib/prisma";
import {
    compareMembers,
    getParticipantIds,
    getPersonalBalance,
    getPositiveTruncatedNumber,
    getSuccessMessage,
    getUpdatedExpenseFields,
} from "@/lib/utils";
import { parseZodErrors } from "@/lib/validations/helpers";
import { updateExpenseSchema } from "@/lib/validations/schemas";

// Get expense
type GetExpenseHandler = (
    req: Request,
    context: { params: Promise<{ id: string }> },
) => Promise<NextResponse<SuccessResponse<Expense> | ServerErrorResponse>>;

export const GET: GetExpenseHandler = async (req, context) => {
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
                        message: ["ID de gasto inválido."],
                        statusCode: 400,
                    },
                },
                { status: 400 },
            );
        }

        const expense = await prisma.expense.findUnique({
            where: { id },
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
                paidBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                group: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
        });

        if (!expense) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.NOT_FOUND,
                        message: ["Gasto no encontrado."],
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
                title: "¡Gasto obtenido con éxito!",
                content: [
                    {
                        text: "Los datos del gasto fueron obtenidos correctamente.",
                    },
                ],
            },
            data: expense,
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

// Update expense
type UpdateExpenseHandler = (
    req: Request,
    context: { params: Promise<{ id: string }> },
) => Promise<
    NextResponse<
        SuccessResponse<Expense> | ServerErrorResponse<ExpenseUpdateFieldErrors>
    >
>;

export const PATCH: UpdateExpenseHandler = async (req, context) => {
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

        if (body?.paymentDate) {
            const parsedPaymentDateString = new Date(body.paymentDate);

            body.paymentDate = parsedPaymentDateString;
        }

        const res = updateExpenseSchema.safeParse(body);

        if (!res.success) {
            const fields = parseZodErrors(res.error) as ExpenseUpdateFieldErrors;

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
            participantsToAdd,
            participantToRemove,
            paidById,
            paymentDate,
            groupId,
            amount,
            participantPayment,
        } = res.data;

        const expense = await prisma.expense.findUnique({
            where: { id },
            include: {
                group: {
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
        });

        if (!expense) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.NOT_FOUND,
                        message: ["Gasto no encontrado."],
                        statusCode: 404,
                    },
                },
                { status: 404 },
            );
        }

        const isAuthorized =
            updatedById === expense.createdById ||
            updatedById === expense.paidById ||
            expense.participants.some((p) => p.userId === updatedById) ||
            (expense.group?.members.some((m) => m.userId === updatedById) ??
                false);

        if (!isAuthorized) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.FORBIDDEN,
                        message: ["No tenés permisos para modificar este gasto."],
                        statusCode: 403,
                    },
                },
                { status: 403 },
            );
        }

        let group = null;

        if (groupId) {
            group = await prisma.group.findUnique({
                where: { id: groupId },
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
                },
            });

            if (!group) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: API_RESPONSE_CODE.NOT_FOUND,
                            message: ["No se encontró el grupo seleccionado."],
                            statusCode: 404,
                        },
                    },
                    { status: 404 },
                );
            }
        }

        if (paidById && paidById !== expense.paidById) {
            const oldPayerParticipant = expense.participants.find(
                (p) => p.userId === expense.paidById,
            );
            const newPayerParticipant = expense.participants.find(
                (p) => p.userId === paidById,
            );

            await Promise.all(
                [
                    oldPayerParticipant &&
                        prisma.expenseParticipant.update({
                            where: {
                                expenseId_userId: {
                                    expenseId: id,
                                    userId: expense.paidById,
                                },
                            },
                            data: { amount: 0 },
                        }),
                    newPayerParticipant
                        ? prisma.expenseParticipant.update({
                            where: {
                                expenseId_userId: { expenseId: id, userId: paidById },
                            },
                            data: { amount: expense.amount },
                        })
                        : prisma.expenseParticipant.create({
                            data: {
                                expenseId: id,
                                userId: paidById,
                                amount: expense.amount,
                            },
                        }),
                ].filter(Boolean),
            );
        }

        if (participantToRemove) {
            if (participantToRemove === expense.paidById) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: API_RESPONSE_CODE.INVALID_FIELD,
                            message: [
                                "No se puede quitar al pagador del gasto. Reasigná el pago a otra persona primero.",
                            ],
                            statusCode: 400,
                        },
                    },
                    { status: 400 },
                );
            }

            if (expense.participants.length <= 2) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: API_RESPONSE_CODE.INVALID_FIELD,
                            message: [
                                "Un gasto debe tener al menos 2 participantes.",
                            ],
                            statusCode: 400,
                        },
                    },
                    { status: 400 },
                );
            }

            const targetParticipant = expense.participants.find(
                (p) => p.userId === participantToRemove,
            );

            if (targetParticipant) {
                const personalBalance = getPersonalBalance(
                    targetParticipant.amount,
                    expense.amount,
                    expense.participants.length,
                );

                if (getPositiveTruncatedNumber(personalBalance) !== 0) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: {
                                code: API_RESPONSE_CODE.INVALID_FIELD,
                                message: [
                                    "No se puede quitar a un participante con saldo pendiente en el gasto.",
                                ],
                                statusCode: 400,
                            },
                        },
                        { status: 400 },
                    );
                }
            }

            await prisma.expenseParticipant.delete({
                where: {
                    expenseId_userId: {
                        expenseId: id,
                        userId: participantToRemove,
                    },
                },
            });
        }

        if (participantsToAdd) {
            const targetGroup = group ?? expense.group;

            if (targetGroup) {
                const { haveDifferences, differences } = compareMembers(
                    participantsToAdd.map((userId) => ({ id: userId })),
                    targetGroup.members,
                );

                if (haveDifferences && differences.excessParticipants.length > 0) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: {
                                code: API_RESPONSE_CODE.INVALID_FIELD,
                                message: [
                                    "Los participantes del gasto deben ser miembros del grupo.",
                                ],
                                details: differences,
                                statusCode: 400,
                            },
                        },
                        { status: 400 },
                    );
                }
            }

            await Promise.all([
                prisma.expenseParticipant.createMany({
                    data: participantsToAdd.map((userId) => ({
                        expenseId: id,
                        userId,
                        amount: 0,
                    })),
                    skipDuplicates: true,
                }),
                upsertContactsForRealUserIds([
                    ...getParticipantIds(expense.participants),
                    ...participantsToAdd,
                    expense.paidById,
                ]).catch((error) => {
                    console.error(
                        "Failed to upsert contacts for expense update",
                        error,
                    );
                }),
            ]);
        }

        if (participantPayment) {
            const existingParticipant = await prisma.expenseParticipant.findUnique({
                where: {
                    expenseId_userId: {
                        expenseId: id,
                        userId: participantPayment.userId,
                    },
                },
            });

            if (!existingParticipant) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: API_RESPONSE_CODE.NOT_FOUND,
                            message: ["Participante no encontrado."],
                            statusCode: 404,
                        },
                    },
                    { status: 404 },
                );
            }

            await prisma.expenseParticipant.update({
                where: {
                    expenseId_userId: {
                        expenseId: id,
                        userId: participantPayment.userId,
                    },
                },
                data: {
                    amount: { increment: participantPayment.amount },
                },
            });
        }

        if (amount) {
            await prisma.expenseParticipant.update({
                where: {
                    expenseId_userId: {
                        expenseId: id,
                        userId: paidById ?? expense.paidById,
                    },
                },
                data: {
                    amount: amount,
                },
            });
        }

        const changedFields = getUpdatedExpenseFields(expense, {
            ...(name && { name }),
            ...(type && { type }),
            ...(participantsToAdd && { participantsToAdd }),
            ...(participantToRemove && { participantToRemove }),
            ...(paidById && { paidById }),
            ...(paymentDate && { paymentDate }),
            ...(groupId && { groupId }),
            ...(amount && { amount }),
            ...(participantPayment && { participantPayment }),
        });

        const [, updatedExpense] = await Promise.all([
            changedFields.length > 0
                ? prisma.expenseHistory.createMany({
                    data: changedFields.map((fieldChange) => ({
                        expenseId: id,
                        field: fieldChange.field,
                        oldValue: fieldChange.oldValue,
                        newValue: fieldChange.newValue,
                        updatedById,
                    })),
                })
                : Promise.resolve(null),
            prisma.expense.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(type && { type }),
                    ...(amount && { amount }),
                    ...(paidById && {
                        paidBy: {
                            connect: { id: paidById },
                        },
                    }),
                    ...(paymentDate && {
                        paymentDate,
                    }),
                    ...(groupId && {
                        group: {
                            connect: { id: groupId },
                        },
                    }),
                },
            }),
        ]);

        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.DATA_UPDATED,
            message: {
                color: "success",
                icon: "CheckCircle",
                title: "¡Gasto actualizado con éxito!",
                content: [
                    ...(name ? getSuccessMessage.name(name, "expense") : []),
                    ...(type ? getSuccessMessage.type(type, "expense") : []),
                    ...(participantsToAdd
                        ? getSuccessMessage.participantsToAdd(participantsToAdd)
                        : []),
                    ...(participantToRemove
                        ? getSuccessMessage.participantToRemove(
                            expense.participants.find(
                                (p) => p.userId === participantToRemove,
                            )?.user?.name,
                        )
                        : []),
                    ...(paidById && paymentDate
                        ? getSuccessMessage.paymentData(
                            expense.participants.find((p) => p.userId === paidById)?.user
                                ?.name,
                            paymentDate,
                        )
                        : paidById
                            ? getSuccessMessage.paidById(
                                expense.participants.find((p) => p.userId === paidById)?.user
                                    ?.name,
                            )
                            : paymentDate
                                ? getSuccessMessage.paymentDate(paymentDate)
                                : []),
                    ...(groupId && group ? getSuccessMessage.groupId(group?.name) : []),
                    ...(amount ? getSuccessMessage.amount(amount) : []),
                ],
            },
            data: updatedExpense,
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

// Delete expense
type DeleteExpenseHandler = (
    req: Request,
    context: { params: Promise<{ id: string }> },
) => Promise<NextResponse<SuccessResponse<Expense> | ServerErrorResponse>>;

export const DELETE: DeleteExpenseHandler = async (req, context) => {
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
                        message: ["ID de gasto inválido."],
                        statusCode: 400,
                    },
                },
                { status: 400 },
            );
        }

        const expense = await prisma.expense.findUnique({
            where: { id },
            include: {
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
                group: {
                    include: {
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
                },
            },
        });

        if (!expense) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.NOT_FOUND,
                        message: ["Gasto no encontrado."],
                        statusCode: 404,
                    },
                },
                { status: 404 },
            );
        }

        await prisma.expense.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.DATA_DELETED,
            message: {
                color: "success",
                icon: "Trash",
                title: "¡Gasto eliminado con éxito!",
                content: [
                    {
                        text: "El gasto fue eliminado correctamente.",
                    },
                ],
            },
            data: expense,
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
