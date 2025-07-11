import { NextResponse } from "next/server";

import type { Expense } from "@prisma/client";

import { EXPENSE_TYPE } from "@/components/ExpenseTypeSelect/constants";
import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type {
  DeleteExpenseGroupFields,
  ExpenseCreationFieldErrors,
  ServerErrorResponse,
  SuccessResponse,
} from "@/lib/api/types";
import prisma from "@/lib/prisma";
import { parseZodErrors } from "@/lib/validations/helpers";
import { createExpenseSchema } from "@/lib/validations/schemas";

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
    const data = { ...body, paymentDate: parsedPaymentDateString }

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
            user: true,
          },
        },
        paidBy: true,
        group: true,
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
      data: expense as Expense,
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
