import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type {
    CreateVirtualUserFields,
    ServerErrorResponse,
    SuccessResponse,
    User,
} from "@/lib/api/types";
import {
    getRandomColorPair,
    parseNameForAvatar,
    sendVirtualUserInvitationEmail,
} from "@/lib/auth/helpers";
import AuthOptions from "@/lib/auth/options";
import prisma from "@/lib/prisma";
import { parseZodErrors } from "@/lib/validations/helpers";
import { createVirtualUserSchema } from "@/lib/validations/schemas";

type CreateVirtualUserHandler = (
    req: Request,
) => Promise<
    NextResponse<
        SuccessResponse<User> | ServerErrorResponse<CreateVirtualUserFields>
    >
>;

export const POST: CreateVirtualUserHandler = async (req) => {
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
        const res = createVirtualUserSchema.safeParse(body);

        if (!res.success) {
            const fields = parseZodErrors(res.error) as CreateVirtualUserFields;

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

        if (email) {
            const existingRealUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingRealUser) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: API_RESPONSE_CODE.EMAIL_ALREADY_REGISTERED,
                            message: [
                                "Ya existe una cuenta con ese correo electrónico. Buscala en el buscador de usuarios.",
                            ],
                            fields: { email: "Ya existe una cuenta con ese correo." },
                            statusCode: 409,
                        },
                    },
                    { status: 409 },
                );
            }

            const existingOwnVirtualUser = await prisma.user.findFirst({
                where: {
                    isVirtual: true,
                    virtualCreatedById: creatorId,
                    contactEmail: email,
                },
            });

            if (existingOwnVirtualUser) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: API_RESPONSE_CODE.EMAIL_ALREADY_REGISTERED,
                            message: [
                                "Ya tenés un usuario virtual con ese correo. Buscalo en el buscador de usuarios.",
                            ],
                            fields: { email: "Ya tenés un usuario virtual con ese correo." },
                            statusCode: 409,
                        },
                    },
                    { status: 409 },
                );
            }
        }

        const { background, text } = getRandomColorPair();
        const parsedName = parseNameForAvatar(name);
        const image = `https://ui-avatars.com/api/?name=${parsedName}&background=${background}&color=${text}&size=128`;

        const virtualUser = await prisma.user.create({
            data: {
                name,
                contactEmail: email,
                image,
                isVirtual: true,
                virtualCreatedById: creatorId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                contactEmail: true,
                image: true,
                isVirtual: true,
            },
        });

        if (email) {
            await sendVirtualUserInvitationEmail({
                to: email,
                inviterName: session.user.name ?? "Un usuario de Easyplit",
                context,
            });
        }

        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.DATA_CREATED,
            data: virtualUser,
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
