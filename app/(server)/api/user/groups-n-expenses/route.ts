import { NextResponse } from "next/server";

import type { Expense, Group } from "@prisma/client";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type {
    GetUserField,
    ServerErrorResponse,
    SuccessResponse,
} from "@/lib/api/types";
import prisma from "@/lib/prisma";
import { parseZodErrors } from "@/lib/validations/helpers";
import { getUserSchema } from "@/lib/validations/schemas";

type GetMyExpensesAndGroupsHandler = (
    req: Request,
) => Promise<
    NextResponse<
        | SuccessResponse<{ groups: Group[]; expenses: Expense[] }>
        | ServerErrorResponse<GetUserField>
    >
>;

// Get expenses and groups by user id
export const GET: GetMyExpensesAndGroupsHandler = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("userId");

        const res = getUserSchema.safeParse({ id });

        if (!res.success) {
            const fields = parseZodErrors(res.error) as GetUserField;

            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.INVALID_FIELD_FORMAT,
                        message: ["El ID de usuario es incorrecto."],
                        fields,
                        statusCode: 400,
                    },
                },
                { status: 400 },
            );
        }

        const { id: userId } = res.data;

        const user = await prisma.user.findFirst({ where: { id: userId } });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.INVALID_CREDENTIALS,
                        message: ["Usuario no encontrado."],
                        statusCode: 404,
                    },
                },
                { status: 404 },
            );
        }

        const expenses: Expense[] = await prisma.expense.findMany({
            where: {
                participants: {
                    some: {
                        userId,
                    },
                },
            },
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
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const groups: Group[] = await prisma.group.findMany({
            where: {
                members: {
                    some: {
                        userId,
                    },
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
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.DATA_FETCHED,
            data: { expenses, groups },
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
