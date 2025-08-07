import { NextResponse } from "next/server";

import type { ExpenseHistory } from "@prisma/client";
import { getServerSession } from "next-auth";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type { ServerErrorResponse, SuccessResponse } from "@/lib/api/types";
import AuthOptions from "@/lib/auth/options";
import prisma from "@/lib/prisma";

// Get a complete history of all user expenses
type GetAllUserExpenseHistoryHandler = (
    req: Request
) => Promise<
    NextResponse<SuccessResponse<ExpenseHistory[]> | ServerErrorResponse>
>;

export const GET: GetAllUserExpenseHistoryHandler = async () => {
    try {
        const session = await getServerSession(AuthOptions);
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.UNAUTHORIZED,
                        message: ["No se registró una sesión iniciada."],
                        statusCode: 401,
                    },
                },
                { status: 401 }
            );
        }

        const histories = await prisma.expenseHistory.findMany({
            where: {
                expense: {
                    participants: {
                        some: {
                            userId,
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                updatedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                expense: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.DATA_FETCHED,
            message: {
                color: "success",
                icon: "CheckCircle",
                title: "Historiales de gastos obtenidos con éxito",
                content: [
                    {
                        text: "Se obtuvieron los historiales de los gastos en los que participás.",
                    },
                ],
            },
            data: histories ?? [],
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
            { status: 500 }
        );
    }
};

