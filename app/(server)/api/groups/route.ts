import { NextResponse } from "next/server";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    const body = await req.json();

    const { name, createdById, memberIds } = body;

    if (!name || !createdById || !memberIds || memberIds.length < 2) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: API_RESPONSE_CODE.GROUP_TOO_FEW_MEMBERS,
                    message: ["El grupo debe contener al menos 2 miembros."],
                    statusCode: 500,
                }
            },
            { status: 400 }
        );
    }

    try {
        const group = await prisma.group.create({
            data: {
                name,
                createdById,
                members: {
                    create: memberIds.map((userId: string) => ({
                        userId,
                    })),
                },
            },
            include: {
                members: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        return NextResponse.json({ success: true, group });
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
