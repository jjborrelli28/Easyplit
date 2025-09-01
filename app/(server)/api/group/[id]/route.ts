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
import prisma from "@/lib/prisma";
import { getSuccessMessage, getUpdatedGroupFields } from "@/lib/utils";
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

        if (memberToRemove) {
            await prisma.groupMember.deleteMany({
                where: {
                    groupId: id,
                    userId: memberToRemove,
                },
            });
        }

        if (membersToAdd) {
            await prisma.groupMember.createMany({
                data: membersToAdd.map((userId) => ({
                    groupId: id,
                    userId,
                })),
                skipDuplicates: true,
            });
        }

        if (expensesToAdd) {
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

        // if (changedFields.length > 0) {
        //     await prisma.expenseHistory.createMany({
        //         data: changedFields.map((fieldChange) => ({
        //             expenseId: id,
        //             field: fieldChange.field,
        //             oldValue: fieldChange.oldValue,
        //             newValue: fieldChange.newValue,
        //             updatedById,
        //         })),
        //     });
        // }

        const updatedGroup = await prisma.group.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(type && { type }),
            },
        });

        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.DATA_UPDATED,
            message: {
                color: "success",
                icon: "CheckCircle",
                title: "Grupo actualizado con éxito!",
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
                title: "Grupo eliminado",
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
