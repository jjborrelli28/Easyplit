import { NextResponse } from "next/server";

import type { Group } from "@prisma/client";
import { getServerSession } from "next-auth";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type {
  GroupCreationFieldErrors,
  ServerErrorResponse,
  SuccessResponse
} from "@/lib/api/types";
import AuthOptions from "@/lib/auth/options";
import prisma from "@/lib/prisma";
import { parseZodErrors } from "@/lib/validations/helpers";
import { createGroupSchema } from "@/lib/validations/schemas";

// Create group
type CreateGroupHandler = (
  req: Request,
) => Promise<
  NextResponse<
    SuccessResponse<Group> | ServerErrorResponse<GroupCreationFieldErrors>
  >
>;

export const POST: CreateGroupHandler = async (req) => {
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

    const body = await req.json();

    const res = createGroupSchema.safeParse(body);

    if (!res.success) {
      const fields = parseZodErrors(res.error) as GroupCreationFieldErrors;

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

    const { name, type, memberIds } = res.data;

    const group = await prisma.group.create({
      data: {
        name,
        type,
        createdById,
        members: {
          create: memberIds.map((userId: string) => ({
            userId,
          })),
        },
      },
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

    return NextResponse.json({
      success: true,
      code: API_RESPONSE_CODE.DATA_CREATED,
      message: {
        color: "success",
        icon: "CheckCircle",
        title: "¡Grupo creado con éxito!",
        content: [
          {
            text: "Ya puedes ingresar a tu grupo y comenzar a agregar gastos.",
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
