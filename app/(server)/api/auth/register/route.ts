import { NextResponse } from "next/server";

import { v4 as uuidv4 } from "uuid";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type {
    RegisterFields,
    ServerErrorResponse,
    SuccessResponse,
    User,
} from "@/lib/api/types";
import {
    getRandomColorPair,
    hashPassword,
    parseNameForAvatar,
    sendVerificationEmail,
} from "@/lib/auth/helpers";
import prisma from "@/lib/prisma";
import verifyRecaptcha from "@/lib/recaptcha";
import { parseZodErrors } from "@/lib/validations/helpers";
import { registerSchema } from "@/lib/validations/schemas";

type RegisterHandler = (
    req: Request,
) => Promise<
    NextResponse<SuccessResponse<User> | ServerErrorResponse<RegisterFields>>
>;

export const POST: RegisterHandler = async (req: Request) => {
    try {
        const body = await req.json();

        const res = registerSchema.safeParse(body);

        if (!res.success) {
            const fields = parseZodErrors(res.error) as RegisterFields;

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

        const { name, email, password, recaptchaToken } = res.data;

        try {
            await verifyRecaptcha(recaptchaToken);
        } catch (error) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.INVALID_RECAPTCHA,
                        message: ["Fallo la verificación de reCAPTCHA."],
                        details: error,
                        statusCode: 400,
                    },
                },
                { status: 400 },
            );
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser?.password) {
            if (existingUser?.emailVerified) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: API_RESPONSE_CODE.EMAIL_ALREADY_REGISTERED,
                            message: [
                                "Ya existe una cuenta registrada con este correo electrónico.",
                            ],
                            statusCode: 409,
                        },
                    },
                    { status: 409 },
                );
            }

            if (
                existingUser?.verifyTokenExp &&
                existingUser.verifyTokenExp >= new Date()
            ) {
                return NextResponse.json({
                    success: true,
                    code: API_RESPONSE_CODE.EMAIL_VERIFICATION_SENT,
                    message: {
                        color: "warning",
                        icon: "MailCheck",
                        title: "Correo ya registrado",
                        content: [
                            {
                                text: "Ya existe una cuenta registrada con este correo electrónico que aún no ha sido verificada.",
                            },
                            {
                                text: "Por favor revisá tu casilla para confirmar tu cuenta.",
                                style: "small",
                            },
                        ],
                        actionLabel: "Volver al inicio",
                        actionHref: "/",
                    },
                    data: {
                        id: existingUser.id,
                        name: existingUser.name,
                        email: existingUser.email,
                        image: existingUser.image,
                    },
                });
            } else {
                const verifyToken = uuidv4();
                const verifyTokenExp = new Date(Date.now() + 30 * 60 * 1000); // valid for 30 mins

                await prisma.user.update({
                    where: { email },
                    data: {
                        verifyToken,
                        verifyTokenExp,
                    },
                });

                await sendVerificationEmail(email, verifyToken);

                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: API_RESPONSE_CODE.EMAIL_NOT_VERIFIED,
                            message: [
                                "Ya existe una cuenta registrada con este correo electrónico que aún no ha sido verificada.",
                                "Se ha enviado un nuevo correo electrónico de verificación.",
                                "Por favor revisá tu casilla para confirmar tu cuenta.",
                            ],
                            statusCode: 409,
                        },
                    },
                    { status: 409 },
                );
            }
        } else if (existingUser) {
            const hashedPassword = await hashPassword(password);

            const user = await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    emailVerified: new Date(),
                },
            });

            return NextResponse.json({
                success: true,
                code: API_RESPONSE_CODE.USER_CREATED,
                message: {
                    color: "success",
                    icon: "CheckCircle",
                    title: "¡Usuario creado!",
                    content: [
                        {
                            text: "Ya puedes iniciar sesión con tu correo electrónico y contraseña.",
                        },
                    ],
                    actionLabel: "Iniciar sesión",
                    actionHref: "/login",
                },
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                },
            });
        } else {
            const hashedPassword = await hashPassword(password);
            const verifyToken = uuidv4();
            const verifyTokenExp = new Date(Date.now() + 30 * 60 * 1000); // valid for 30 mins

            await sendVerificationEmail(email, verifyToken);

            const { background, text } = getRandomColorPair();
            const parsedName = parseNameForAvatar(name);
            const image = `https://ui-avatars.com/api/?name=${parsedName}&background=${background}&color=${text}&size=128`;

            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    image,
                    verifyToken,
                    verifyTokenExp,
                },
            });

            return NextResponse.json({
                success: true,
                code: API_RESPONSE_CODE.EMAIL_VERIFICATION_SENT,
                message: {
                    color: "primary",
                    icon: "MailCheck",
                    title: "¡Verificá tu correo!",
                    content: [
                        {
                            text: "Te enviamos un correo electrónico con un enlace para verificar tu cuenta.",
                        },
                        {
                            text: "Por favor, revisá tu bandeja de entrada (y también el correo no deseado o spam).",
                            style: "muted",
                        },
                    ],
                    actionLabel: "Volver al inicio",
                    actionHref: "/",
                },
                data: {
                    id: user.id,
                    name,
                    email,
                    image,
                },
            });
        }
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
