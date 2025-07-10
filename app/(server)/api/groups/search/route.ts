import { NextResponse } from "next/server";

import type { Group } from "@prisma/client";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type { ServerErrorResponse, SuccessResponse } from "@/lib/api/types";
import prisma from "@/lib/prisma";

type GetSearchGroupsByUserIdHandler = (
    req: Request,
) => Promise<NextResponse<SuccessResponse<Group[]> | ServerErrorResponse>>;

// Search groups by user id
export const GET: GetSearchGroupsByUserIdHandler = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q");
        const userId = searchParams.get("userId");

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
                code: API_RESPONSE_CODE.GROUPS_FOUND,
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
