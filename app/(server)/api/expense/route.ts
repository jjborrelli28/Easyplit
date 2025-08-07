import { NextResponse } from "next/server";

import type { Expense } from "@prisma/client";
import { getServerSession } from "next-auth";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type {
  ExpenseCreationFieldErrors,
  ServerErrorResponse,
  SuccessResponse,
} from "@/lib/api/types";
import AuthOptions from "@/lib/auth/options";
import prisma from "@/lib/prisma";
import { compareMembers } from "@/lib/utils";
import { parseZodErrors } from "@/lib/validations/helpers";
import { createExpenseSchema } from "@/lib/validations/schemas";

import { EXPENSE_TYPE } from "@/components/ExpenseTypeSelect/constants";

// Create expense
type CreateExpenseHandler = (
  req: Request,
) => Promise<
  NextResponse<
    SuccessResponse<Expense> | ServerErrorResponse<ExpenseCreationFieldErrors>
  >
>;

export const POST: CreateExpenseHandler = async (req) => {
  try {
    const session = await getServerSession(AuthOptions);
    const createdById = session?.user?.id;

    if (!createdById) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_RESPONSE_CODE.UNAUTHORIZED,
            message: ["No se registro una sesión inicia."],
            statusCode: 401,
          },
        },
        { status: 401 },
      );
    }

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
