import { NextResponse } from "next/server";

import type { Group } from "@prisma/client";
import { getServerSession } from "next-auth";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type { ServerErrorResponse, SuccessResponse } from "@/lib/api/types";
import AuthOptions from "@/lib/auth/options";
import prisma from "@/lib/prisma";

// Search groups by user
type GetSearchGroupsByUserIdHandler = (
    req: Request,
) => Promise<NextResponse<SuccessResponse<Group[]> | ServerErrorResponse>>;

export const GET: GetSearchGroupsByUserIdHandler = async (req: Request) => {
    try {
        const session = await getServerSession(AuthOptions);
        const userId = session?.user?.id;

        if (!userId) {
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

        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q");

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.BAD_REQUEST,
                        message: ["Falta el ID del usuario."],
                        statusCode: 400,
                    },
                },
                { status: 400 },
            );
        }

        if (!q || q.length < 2) {
            return NextResponse.json({
                success: true,
                code: API_RESPONSE_CODE.DATA_FETCHED,
                data: [],
            });
        }

        const groups = await prisma.group.findMany({
            where: {
                name: {
                    contains: q,
                    mode: "insensitive",
                },
                members: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                expenses: true,
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
            code: API_RESPONSE_CODE.DATA_FETCHED,
            message: {
                color: "success",
                icon: "CheckCircle",
                title: "¡La busqueda de grupos fue exitosa!",
                content: [
                    {
                        text: `Se encontraron ${groups.length} coincidentes con la busqueda.`,
                    },
                ],
            },
            data: groups,
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
