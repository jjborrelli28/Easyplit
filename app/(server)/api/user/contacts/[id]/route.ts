import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type { ServerErrorResponse, SuccessResponse } from "@/lib/api/types";
import AuthOptions from "@/lib/auth/options";
import prisma from "@/lib/prisma";

// Remove a contact: soft-deletes both directed Contact rows so a future
// re-invite between these two users needs consent again. Never touches
// either User row — the other person's account, and everything already
// shared with them, stays exactly as it is.
type DeleteContactHandler = (
    req: Request,
    context: { params: Promise<{ id: string }> },
) => Promise<NextResponse<SuccessResponse | ServerErrorResponse>>;

export const DELETE: DeleteContactHandler = async (req, context) => {
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
                { status: 401 },
            );
        }

        const { id: contactUserId } = await context.params;

        await prisma.$transaction([
            prisma.contact.updateMany({
                where: { userId, contactUserId },
                data: { removed: true },
            }),
            prisma.contact.updateMany({
                where: { userId: contactUserId, contactUserId: userId },
                data: { removed: true },
            }),
        ]);

        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.DATA_DELETED,
            message: {
                color: "success",
                icon: "Trash",
                title: "¡Contacto eliminado!",
                content: [
                    {
                        text: "Ya no van a figurar como contactos. Si querés agregarlo de nuevo a algo, vas a tener que volver a enviarle una solicitud.",
                    },
                ],
            },
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
