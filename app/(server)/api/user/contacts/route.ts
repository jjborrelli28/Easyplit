import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type {
    ContactsResponse,
    ServerErrorResponse,
    SuccessResponse,
} from "@/lib/api/types";
import AuthOptions from "@/lib/auth/options";
import prisma from "@/lib/prisma";

// List the logged-in user's real contacts and the virtual users they created.
type GetContactsHandler = (
    req: Request,
) => Promise<
    NextResponse<SuccessResponse<ContactsResponse> | ServerErrorResponse>
>;

export const GET: GetContactsHandler = async () => {
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

        const [contactRows, virtualUsers] = await Promise.all([
            prisma.contact.findMany({
                where: { userId, removed: false },
                include: {
                    contactUser: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                            isVirtual: true,
                            contactEmail: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.user.findMany({
                where: { isVirtual: true, virtualCreatedById: userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    isVirtual: true,
                    contactEmail: true,
                    createdAt: true,
                    pendingRealUserId: true,
                },
                orderBy: { createdAt: "desc" },
            }),
        ]);

        const data: ContactsResponse = {
            contacts: contactRows.map((row) => ({
                ...row.contactUser,
                connectedAt: row.createdAt,
            })),
            virtualUsers: virtualUsers.map((user) => ({
                ...user,
                connectedAt: user.createdAt,
                pending: !!user.pendingRealUserId,
            })),
        };

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
