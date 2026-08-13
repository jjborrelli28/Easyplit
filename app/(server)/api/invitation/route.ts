import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type {
    PendingInvitation,
    ServerErrorResponse,
    SuccessResponse,
} from "@/lib/api/types";
import AuthOptions from "@/lib/auth/options";
import prisma from "@/lib/prisma";

// List invitations awaiting the logged-in user's acceptance.
type GetPendingInvitationsHandler = (
    req: Request,
) => Promise<
    NextResponse<SuccessResponse<PendingInvitation[]> | ServerErrorResponse>
>;

export const GET: GetPendingInvitationsHandler = async () => {
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

        const placeholders = await prisma.user.findMany({
            where: {
                isVirtual: true,
                pendingRealUserId: userId,
                contactRejected: false,
            },
            include: {
                virtualCreatedBy: { select: { id: true, name: true, image: true } },
                GroupMember: { include: { group: { select: { id: true, name: true } } } },
                ExpenseParticipant: {
                    include: { expense: { select: { id: true, name: true } } },
                },
            },
        });

        const data: PendingInvitation[] = placeholders
            .filter((p) => p.virtualCreatedBy)
            .map((p) => ({
                id: p.id,
                name: p.name,
                contactEmail: p.contactEmail,
                inviter: {
                    id: p.virtualCreatedBy!.id,
                    name: p.virtualCreatedBy!.name,
                    image: p.virtualCreatedBy!.image,
                },
                groups: p.GroupMember.map((m) => m.group),
                expenses: p.ExpenseParticipant.map((e) => e.expense),
            }));

        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.DATA_FETCHED,
            data,
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
