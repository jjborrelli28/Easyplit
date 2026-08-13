import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type { ServerErrorResponse, SuccessResponse } from "@/lib/api/types";
import AuthOptions from "@/lib/auth/options";
import prisma from "@/lib/prisma";

// Reject a pending invitation: the placeholder stays exactly as it is
// (still in whatever groups/expenses it was added to), just no longer
// linked to this real account, so no contact ever forms.
type RejectInvitationHandler = (
    req: Request,
    context: { params: Promise<{ id: string }> },
) => Promise<NextResponse<SuccessResponse | ServerErrorResponse>>;

export const POST: RejectInvitationHandler = async (req, context) => {
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

        const { id } = await context.params;

        const placeholder = await prisma.user.findUnique({ where: { id } });

        if (!placeholder || placeholder.pendingRealUserId !== userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.NOT_FOUND,
                        message: ["No se encontró la invitación."],
                        statusCode: 404,
                    },
                },
                { status: 404 },
            );
        }

        await prisma.user.update({
            where: { id },
            data: { pendingRealUserId: null },
        });

        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.INVITATION_REJECTED,
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
