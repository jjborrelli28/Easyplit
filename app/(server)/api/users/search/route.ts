import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type {
    ServerErrorResponse,
    SuccessResponse,
    User,
} from "@/lib/api/types";
import AuthOptions from "@/lib/auth/options";
import prisma from "@/lib/prisma";

// Search users by name or email
type GetSearchUsersHandler = (
    req: Request,
) => Promise<NextResponse<SuccessResponse<User[]> | ServerErrorResponse>>;

export const GET: GetSearchUsersHandler = async (req) => {
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

        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q");
        const excludeUserIdsParam = searchParams.get("excludeUserIds");

        if (!q || q.length < 2) {
            return NextResponse.json({
                success: true,
                code: API_RESPONSE_CODE.DATA_FETCHED,
                data: [],
            });
        }

        const excludeUserIds = excludeUserIdsParam
            ? excludeUserIdsParam.split(",").map((id) => id.trim())
            : [];

        const users = await prisma.user.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            // Real users: only people already in my contact
                            // network (shared a group/expense before), matched
                            // by email or name. Never search the whole User
                            // table, or this becomes an account-enumeration
                            // oracle.
                            {
                                isVirtual: false,
                                contactsReceived: { some: { userId } },
                                OR: [
                                    { email: { contains: q, mode: "insensitive" } },
                                    { name: { contains: q, mode: "insensitive" } },
                                ],
                            },
                            // Virtual users created by the current user: match
                            // by name or contact email. Excludes placeholders
                            // linked to a real account (pendingRealUserId set)
                            // — those must always be re-resolved through
                            // POST /api/invite (even after being rejected),
                            // never picked directly from a search result, or
                            // the invitation/consent flow gets silently
                            // bypassed.
                            {
                                isVirtual: true,
                                virtualCreatedById: userId,
                                pendingRealUserId: null,
                                OR: [
                                    { name: { contains: q, mode: "insensitive" } },
                                    { contactEmail: { contains: q, mode: "insensitive" } },
                                ],
                            },
                        ],
                    },
                    excludeUserIds.length > 0
                        ? {
                            id: {
                                notIn: excludeUserIds,
                            },
                        }
                        : {},
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
                contactEmail: true,
                image: true,
                isVirtual: true,
            },
            take: 10,
        });

        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.DATA_FETCHED,
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
};
