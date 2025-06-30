import { NextResponse } from "next/server";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type {
  CreateGroupFields,
  DeleteExpenseGroupFields,
  GroupData,
  ServerErrorResponse,
  SuccessResponse,
} from "@/lib/api/types";
import prisma from "@/lib/prisma";
import { parseZodErrors } from "@/lib/validations/helpers";
import { createGroupSchema } from "@/lib/validations/schemas";

type CreateGroupHandler = (
  req: Request,
) => Promise<
  NextResponse<
    SuccessResponse<GroupData> | ServerErrorResponse<CreateGroupFields>
  >
>;

// Create group
export const POST: CreateGroupHandler = async (req: Request) => {
  const body = await req.json();

  // Format validation
  const res = createGroupSchema.safeParse(body);

  if (!res.success) {
    const fields = parseZodErrors(res.error) as unknown as CreateGroupFields;

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

  const { name, type, createdById, memberIds } = res.data;

  try {
    // Create group
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
        members: {
          include: {
            user: true,
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
      data: group as GroupData,
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

type GetLinkedGroupsHandler = (
  req: Request,
) => Promise<
  NextResponse<
    SuccessResponse<GroupData[]> | ServerErrorResponse<CreateGroupFields>
  >
>;

// Get linked groups
export const GET: GetLinkedGroupsHandler = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  // User not found
  if (!userId) {
    return NextResponse.json({
      success: true,
      code: API_RESPONSE_CODE.USERS_FOUND,
      data: [],
    });
  }

  try {
    // Search linked group by user id
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      code: API_RESPONSE_CODE.DATA_FETCHED,
      data: groups as GroupData[],
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

type DeleteGroupHandler = (
  req: Request,
) => Promise<
  NextResponse<
    SuccessResponse<GroupData> | ServerErrorResponse<DeleteExpenseGroupFields>
  >
>;

// Delete group
export const DELETE: DeleteGroupHandler = async (req) => {
  try {
    const { id } = await req.json();

    // ID validation
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

    // Search group by id
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true,
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

    // Delete group
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
        title: "Grupo eliminado",
        content: [
          {
            text: "El grupo fue eliminado correctamente.",
          },
        ],
      },
      data: group as GroupData,
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
