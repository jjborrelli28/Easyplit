import { NextResponse } from "next/server";

import type { Expense, Group } from "@prisma/client";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type { ServerErrorResponse, SuccessResponse } from "@/lib/api/types";
import prisma from "@/lib/prisma";

type GetMyExpensesAndGroupsHandler = (
    req: Request,
    context: { params: Promise<{ id: string }> },
) => Promise<
    NextResponse<
        | SuccessResponse<{ groups: Group[]; expenses: Expense[] }>
        | ServerErrorResponse
    >
>;

// Get expenses and groups by user id
export const GET: GetMyExpensesAndGroupsHandler = async (req, context) => {
    try {
        const params = await context.params;
        const userId = params.id;

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
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
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
