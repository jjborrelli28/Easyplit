import { NextResponse } from "next/server";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type {
    Expense,
    GetUserField,
    Group,
    ServerErrorResponse,
    SuccessResponse,
} from "@/lib/api/types";
import prisma from "@/lib/prisma";
import { parseZodErrors } from "@/lib/validations/helpers";
import { getUserSchema } from "@/lib/validations/schemas";

type GetMyGroupsAndExpensesHandler = (
    req: Request,
) => Promise<
    NextResponse<
        | SuccessResponse<{ groups: Group[]; expenses: Expense[] }>
        | ServerErrorResponse<GetUserField>
    >
>;

// Get linked groups
export const GET: GetMyGroupsAndExpensesHandler = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("userId");

        // Field format validation
        const res = getUserSchema.safeParse({ id });

        if (!res.success) {
            const fields = parseZodErrors(res.error) as unknown as GetUserField;

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

        // Search user by id
        const user = await prisma.user.findFirst({ where: { id: userId } });

        // User not found
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

        // Search all expenses where the user is a participant
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

        // Search all groups where the user is a member
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
