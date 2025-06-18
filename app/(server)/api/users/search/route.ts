import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const excludeUserId = searchParams.get("excludeUserId");

    if (!q || q.length < 2) {
        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.USERS_FOUND,
            data: [],
        });
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { email: { contains: q, mode: "insensitive" } },
                            { name: { contains: q, mode: "insensitive" } },
                        ],
                    },
                    excludeUserId
                        ? {
                            id: {
                                not: excludeUserId,
                            },
                        }
                        : {},
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
            },
            take: 10,
        });

        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.USERS_FOUND,
            data: users,
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
}
