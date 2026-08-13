import { after, NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type {
    InviteUserFields,
    ServerErrorResponse,
    SuccessResponse,
    User,
} from "@/lib/api/types";
import {
    getRandomColorPair,
    parseNameForAvatar,
    sendAddedToGroupOrExpenseEmail,
    sendPendingInvitationEmail,
    sendVirtualUserInvitationEmail,
} from "@/lib/auth/helpers";
import AuthOptions from "@/lib/auth/options";
import prisma from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit/helpers";
import { parseZodErrors } from "@/lib/validations/helpers";
import { inviteUserSchema } from "@/lib/validations/schemas";

// Invite a user by email, or create a placeholder virtual user by name.
//
// Security-critical: this endpoint must never let the inviter learn whether
// `email` belongs to an existing real account. Both branches (account
// exists / doesn't exist) return the exact same response shape, built only
// from the inviter's own input (never from the real account's data), and
// the outbound email is sent after the response via `after()` so its
// latency can't be used as a timing side-channel.
type InviteUserHandler = (
    req: Request,
) => Promise<
    NextResponse<SuccessResponse<User> | ServerErrorResponse<InviteUserFields>>
>;

export const POST: InviteUserHandler = async (req) => {
    try {
        const session = await getServerSession(AuthOptions);
        const creatorId = session?.user?.id;

        if (!creatorId) {
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

        const body = await req.json();
        const res = inviteUserSchema.safeParse(body);

        if (!res.success) {
            const fields = parseZodErrors(res.error) as InviteUserFields;

            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.INVALID_FIELD_FORMAT,
                        message: ["Revisá los datos ingresados."],
                        fields,
                        statusCode: 400,
                    },
                },
                { status: 400 },
            );
        }

        const { name, email, context } = res.data;
        const inviterName = session.user.name ?? "Un usuario de Easyplit";

        let resolvedId: string;

        if (email) {
            const allowed = await consumeRateLimit({
                actorId: creatorId,
                action: "invite_by_email",
                limit: 15,
                windowMs: 60 * 60 * 1000,
            });

            if (!allowed) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: API_RESPONSE_CODE.RATE_LIMIT_EXCEEDED,
                            message: [
                                "Hiciste demasiadas invitaciones. Probá de nuevo más tarde.",
                            ],
                            statusCode: 429,
                        },
                    },
                    { status: 429 },
                );
            }

            const realUser = await prisma.user.findUnique({
                where: { email },
                select: { id: true, email: true },
            });

            if (realUser) {
                const alreadyContact = await prisma.contact.findUnique({
                    where: {
                        userId_contactUserId: {
                            userId: creatorId,
                            contactUserId: realUser.id,
                        },
                    },
                });

                if (alreadyContact) {
                    // Already connected: no consent needed, resolve directly.
                    resolvedId = realUser.id;

                    after(() =>
                        sendAddedToGroupOrExpenseEmail({
                            to: realUser.email!,
                            inviterName,
                            context,
                        }).catch((error) => console.error(error)),
                    );
                } else {
                    // First-time interaction between two real users: park it
                    // behind a placeholder (identical to the "no account"
                    // branch below) until the real account explicitly
                    // accepts. `update` re-arms the pending flag even if this
                    // placeholder already exists from a previous invite that
                    // was rejected.
                    const { background, text } = getRandomColorPair();
                    const parsedName = parseNameForAvatar(name);
                    const image = `https://ui-avatars.com/api/?name=${parsedName}&background=${background}&color=${text}&size=128`;

                    const placeholder = await prisma.user.upsert({
                        where: {
                            contactEmail_virtualCreatedById: {
                                contactEmail: email,
                                virtualCreatedById: creatorId,
                            },
                        },
                        update: { pendingRealUserId: realUser.id },
                        create: {
                            name,
                            contactEmail: email,
                            image,
                            isVirtual: true,
                            virtualCreatedById: creatorId,
                            pendingRealUserId: realUser.id,
                        },
                        select: { id: true },
                    });

                    resolvedId = placeholder.id;

                    after(() =>
                        sendPendingInvitationEmail({
                            to: realUser.email!,
                            inviterName,
                            context,
                        }).catch((error) => console.error(error)),
                    );
                }
            } else {
                const { background, text } = getRandomColorPair();
                const parsedName = parseNameForAvatar(name);
                const image = `https://ui-avatars.com/api/?name=${parsedName}&background=${background}&color=${text}&size=128`;

                const virtualUser = await prisma.user.upsert({
                    where: {
                        contactEmail_virtualCreatedById: {
                            contactEmail: email,
                            virtualCreatedById: creatorId,
                        },
                    },
                    update: {},
                    create: {
                        name,
                        contactEmail: email,
                        image,
                        isVirtual: true,
                        virtualCreatedById: creatorId,
                    },
                    select: { id: true },
                });

                resolvedId = virtualUser.id;

                after(() =>
                    sendVirtualUserInvitationEmail({
                        to: email,
                        inviterName,
                        context,
                    }).catch((error) => console.error(error)),
                );
            }
        } else {
            const { background, text } = getRandomColorPair();
            const parsedName = parseNameForAvatar(name);
            const image = `https://ui-avatars.com/api/?name=${parsedName}&background=${background}&color=${text}&size=128`;

            const virtualUser = await prisma.user.create({
                data: { name, image, isVirtual: true, virtualCreatedById: creatorId },
                select: { id: true },
            });

            resolvedId = virtualUser.id;
        }

        // Every field below comes from the inviter's own input, never from
        // the resolved account, so the response is identical regardless of
        // which branch ran above.
        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.INVITE_PROCESSED,
            data: {
                id: resolvedId,
                name,
                email: email ?? null,
                contactEmail: email ?? null,
                image: null,
                isVirtual: true,
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
