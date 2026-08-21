import { NextResponse } from "next/server";

import type { GroupHistory } from "@prisma/client";
import { getServerSession } from "next-auth";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type { ServerErrorResponse, SuccessResponse } from "@/lib/api/types";
import AuthOptions from "@/lib/auth/options";
import prisma from "@/lib/prisma";

type GroupHistoryWithRemovedMember = GroupHistory & {
    removedMemberName?: string | null;
};

// Get a complete history of all groups the user belongs to
type GetAllUserGroupHistoryHandler = (
    req: Request,
) => Promise<
    NextResponse<
        SuccessResponse<GroupHistoryWithRemovedMember[]> | ServerErrorResponse
    >
>;

export const GET: GetAllUserGroupHistoryHandler = async () => {
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

        const histories = await prisma.groupHistory.findMany({
            where: {
                group: {
                    members: {
                        some: {
                            userId,
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                updatedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                group: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        // Unlike `participantToRemove` on expenses, `memberToRemove` never
        // denormalizes the removed member's name at write time — and by the
        // time this reads, they're no longer in `group.members` to resolve
        // it from. Their `User` row still exists though, so batch-resolve
        // it here instead of showing an unexplained id in the feed.
        const removedMemberIds = Array.from(
            new Set(
                histories
                    .filter((history) => history.field === "memberToRemove")
                    .map((history) => {
                        if (!history.newValue) return null;

                        try {
                            return JSON.parse(history.newValue) as string;
                        } catch {
                            return null;
                        }
                    })
                    .filter((id): id is string => !!id),
            ),
        );

        const removedMembers = removedMemberIds.length
            ? await prisma.user.findMany({
                  where: { id: { in: removedMemberIds } },
                  select: { id: true, name: true },
              })
            : [];

        const removedMemberNameById = new Map(
            removedMembers.map((member) => [member.id, member.name]),
        );

        const enrichedHistories: GroupHistoryWithRemovedMember[] =
            histories.map((history) => {
                if (history.field !== "memberToRemove" || !history.newValue) {
                    return history;
                }

                try {
                    const removedUserId = JSON.parse(
                        history.newValue,
                    ) as string;

                    return {
                        ...history,
                        removedMemberName:
                            removedMemberNameById.get(removedUserId) ?? null,
                    };
                } catch {
                    return history;
                }
            });

        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.DATA_FETCHED,
            message: {
                color: "success",
                icon: "CheckCircle",
                title: "Historiales de grupos obtenidos con éxito",
                content: [
                    {
                        text: "Se obtuvieron los historiales de los grupos a los que pertenecés.",
                    },
                ],
            },
            data: enrichedHistories ?? [],
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
