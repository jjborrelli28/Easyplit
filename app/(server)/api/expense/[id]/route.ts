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
import prisma from "@/lib/prisma";
import {
    compareMembers,
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

        if (paidById && paidById !== expense.paidById) {
            const participantsToUpdate = expense.participants.filter(
                (p) => p.userId === paidById || p.userId === expense.paidById,
            );

            await Promise.all(
                participantsToUpdate.map((participant) =>
                    prisma.expenseParticipant.update({
                        where: {
                            expenseId_userId: {
                                expenseId: id,
                                userId: participant.userId,
                            },
                        },
                        data: {
                            amount: participant.userId === paidById ? expense.amount : 0,
                        },
                    }),
                ),
            );
        }

        if (participantToRemove) {
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
            if (expense.group) {
                const { haveDifferences, differences } = compareMembers(
                    expense.participants,
                    expense.group.members,
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

            await prisma.expenseParticipant.createMany({
                data: participantsToAdd.map((userId) => ({
                    expenseId: id,
                    userId,
                    amount: 0,
                })),
                skipDuplicates: true,
            });
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

            const newAmount = existingParticipant.amount + participantPayment.amount;

            await prisma.expenseParticipant.update({
                where: {
                    expenseId_userId: {
                        expenseId: id,
                        userId: participantPayment.userId,
                    },
                },
                data: {
                    amount: newAmount,
                },
            });
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

        if (amount) {
            await prisma.expenseParticipant.update({
                where: {
                    expenseId_userId: {
                        expenseId: id,
                        userId: expense.paidById,
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

        if (changedFields.length > 0) {
            await prisma.expenseHistory.createMany({
                data: changedFields.map((fieldChange) => ({
                    expenseId: id,
                    field: fieldChange.field,
                    oldValue: fieldChange.oldValue,
                    newValue: fieldChange.newValue,
                    updatedById,
                })),
            });
        }

        const updatedExpense = await prisma.expense.update({
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
        });

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
                title: "Gasto eliminado",
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
