import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type { ServerErrorResponse, SuccessResponse } from "@/lib/api/types";
import { mergeVirtualUserInto } from "@/lib/auth/helpers";
import AuthOptions from "@/lib/auth/options";
import { syncContactsForUser } from "@/lib/contacts/helpers";
import prisma from "@/lib/prisma";

// Accept a pending invitation: merge the placeholder into the real account
// and form the mutual contact with everyone now shared.
type AcceptInvitationHandler = (
    req: Request,
    context: { params: Promise<{ id: string }> },
) => Promise<NextResponse<SuccessResponse | ServerErrorResponse>>;

export const POST: AcceptInvitationHandler = async (req, context) => {
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

        await prisma.$transaction((tx) =>
            mergeVirtualUserInto(tx, placeholder.id, userId),
        );

        try {
            await syncContactsForUser(userId);
        } catch (error) {
            console.error("Failed to sync contacts after invitation accept", error);
        }

        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.INVITATION_ACCEPTED,
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
