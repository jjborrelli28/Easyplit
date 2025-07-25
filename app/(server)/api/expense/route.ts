import { NextResponse } from "next/server";

import type { Expense } from "@prisma/client";

import { EXPENSE_TYPE } from "@/components/ExpenseTypeSelect/constants";
import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type {
  DeleteExpenseGroupFields,
  ExpenseCreationFieldErrors,
  ExpenseUpdateFieldErrors,
  ServerErrorResponse,
  SuccessResponse,
} from "@/lib/api/types";
import prisma from "@/lib/prisma";
import { compareMembers } from "@/lib/utils";
import { parseZodErrors } from "@/lib/validations/helpers";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "@/lib/validations/schemas";

type CreateExpenseHandler = (
  req: Request,
) => Promise<
  NextResponse<
    SuccessResponse<Expense> | ServerErrorResponse<ExpenseCreationFieldErrors>
  >
>;

// Create expense
export const POST: CreateExpenseHandler = async (req: Request) => {
  try {
    const body = await req.json();

    const parsedPaymentDateString = new Date(body.paymentDate);
    const data = { ...body, paymentDate: parsedPaymentDateString };

    const res = createExpenseSchema.safeParse(data);

    if (!res.success) {
      const fields = parseZodErrors(res.error) as ExpenseCreationFieldErrors;

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
      amount,
      participantIds,
      paidById,
      paymentDate,
      groupId,
      createdById,
    } = res.data;

    if (groupId) {
      const group = await prisma.group.findUnique({
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

      const pickedParticipants = participantIds.map((id) => ({ id }));
      const { haveDifferences, differences } = compareMembers(
        pickedParticipants,
        group.members,
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

    const expense = await prisma.expense.create({
      data: {
        name,
        type: type ?? EXPENSE_TYPE.UNCATEGORIZED,
        amount,
        participants: {
          create: participantIds.map((participantId) => ({
            userId: participantId,
            amount: participantId === paidById ? amount : 0,
          })),
        },
        paidBy: {
          connect: { id: paidById },
        },
        paymentDate,
        ...(groupId && {
          group: {
            connect: { id: groupId },
          },
        }),
        createdBy: {
          connect: { id: createdById },
        },
      },
    });

    return NextResponse.json({
      success: true,
      code: API_RESPONSE_CODE.DATA_CREATED,
      message: {
        color: "success",
        icon: "CheckCircle",
        title: "¡Gasto creado con éxito!",
        content: [
          {
            text: "Ya puedes ver el detalle del gasto en tu grupo.",
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

type DeleteExpenseHandler = (
  req: Request,
) => Promise<
  NextResponse<
    SuccessResponse<Expense> | ServerErrorResponse<DeleteExpenseGroupFields>
  >
>;

// Delete expense
export const DELETE: DeleteExpenseHandler = async (req) => {
  try {
    const { id } = await req.json();

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

type GetExpenseByIdHandler = (
  req: Request,
) => Promise<
  NextResponse<SuccessResponse<Expense> | ServerErrorResponse<Expense>>
>;

// Get expense
export const GET: GetExpenseByIdHandler = async (req) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

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

  try {
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
        paidBy: true,
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
        icon: "Trash",
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

const successMessages = {
  name: {
    text: "El nombre del gasto fue actualizado correctamente.",
  },
  type: {
    text: "La categoría del gasto fue actualizada correctamente.",
  },
  participantsToAdd: {
    text: "El/los participantes fueron agregados al gasto correctamente.",
  },
  participantToRemove: {
    text: "El participante fue eliminado del gasto correctamente.",
  },
  paidById: {
    text: "Quien pago el gasto fue actualizado correctamente.",
  },
  paymentDate: {
    text: "La fecha de pago del gasto fue actualizada correctamente.",
  },
  paymentData: {
    text: "Los datos del pago fueron actualizados correctamente.",
  },
  groupId: {
    text: "El gasto fue añadido al grupo correctamente.",
  },
  amount: {
    text: "El monto del gasto fue actualizado correctamente.",
  },
};

// Update expense
export const PATCH = async (
  req: Request,
): Promise<
  NextResponse<
    SuccessResponse<Expense> | ServerErrorResponse<ExpenseUpdateFieldErrors>
  >
> => {
  try {
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
      id,
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
        participants: true,
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
      await prisma.expenseParticipant.update({
        where: {
          expenseId_userId: {
            expenseId: id,
            userId: participantPayment.userId,
          },
        },
        data: {
          amount: participantPayment.amount,
        },
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
          ...(name ? [successMessages.name] : []),
          ...(type ? [successMessages.type] : []),
          ...(participantsToAdd ? [successMessages.participantsToAdd] : []),
          ...(participantToRemove ? [successMessages.participantToRemove] : []),
          ...(paidById && paymentDate
            ? [successMessages.paymentData]
            : paidById
              ? [successMessages.paidById]
              : paymentDate
                ? [successMessages.paymentDate]
                : []),
          ...(groupId ? [successMessages.groupId] : []),
          ...(amount ? [successMessages.amount] : []),
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
