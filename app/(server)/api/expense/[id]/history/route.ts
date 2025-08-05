import { NextResponse } from "next/server";

import type { ExpenseHistory } from "@prisma/client";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import { ServerErrorResponse, SuccessResponse } from "@/lib/api/types";
import prisma from "@/lib/prisma";

type GetExpenseHistoryHandler = (
    req: Request,
    context: { params: Promise<{ id: string }> },
) => Promise<
    NextResponse<SuccessResponse<ExpenseHistory[]> | ServerErrorResponse>
>;
export const GET: GetExpenseHistoryHandler = async (req, context) => {
    try {
        const params = await context.params;
        const expenseId = params.id;

        const history = await prisma.expenseHistory.findMany({
            where: { expenseId },
            orderBy: { createdAt: "desc" },
            include: {
                updatedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
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
                title: "¡Historial de gasto obtenido con éxito!",
                content: [
                    {
                        text: "El historial del gasto fue obtenido correctamente.",
                    },
                ],
            },
            data: history ?? [],
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
