import { NextResponse } from "next/server";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type {
    CreateExpenseFields,
    Expense,
    ServerErrorResponse,
    SuccessResponse,
} from "@/lib/api/types";
import prisma from "@/lib/prisma";

type GetLinkedExpensesHandler = (
    req: Request,
) => Promise<
    NextResponse<
        SuccessResponse<Expense[]> | ServerErrorResponse<CreateExpenseFields>
    >
>;

// Get linked expenses
export const GET: GetLinkedExpensesHandler = async (req: Request) => {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // User not found
    if (!userId) {
        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.DATA_FETCHED,
            data: [],
        });
    }

    try {
        // Search expenses where the user is a participant or paid the expense
        const expenses = await prisma.expense.findMany({
            where: {
                OR: [
                    {
                        participants: {
                            some: {
                                userId,
                            },
                        },
                    },
                    {
                        paidById: userId,
                    },
                ],
            },
            include: {
                participants: {
                    include: {
                        user: true,
                    },
                },
                paidBy: true,
                group: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.DATA_FETCHED,
            data: expenses as Expense[],
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
