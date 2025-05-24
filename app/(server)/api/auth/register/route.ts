import { NextResponse } from "next/server";

import { v4 as uuidv4 } from "uuid";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type { ErrorResponse, SuccessResponse } from "@/lib/api/types";
import { hashPassword, sendVerificationEmail } from "@/lib/auth/helpers";
import { prisma } from "@/lib/prisma";
import { parseZodErrors } from "@/lib/validations/helpers";
import { registerSchema } from "@/lib/validations/schemas";

type RegisterHandler = (
    req: Request,
) => Promise<
    NextResponse<ErrorResponse<Record<string, string>> | SuccessResponse>
>;

export const POST: RegisterHandler = async (req: Request) => {
    try {
        const body = await req.json();

        // 1. Validate fields format using Zod schema
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            const fields = parseZodErrors(result.error);
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

        const { name, email, password } = result.data;

        // 2. Check if user already exists in the database
        const existingUser = await prisma.user.findUnique({ where: { email } });

        // 3. If user exists with a password (user created with credentials)
        if (existingUser?.password) {
            // 3.1.1. User is already verified
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

            // 3.1.2a. User exists, but is not verified
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
                        email: existingUser.email,
                        name: existingUser.name,
                    },
                });
            } else {
                // 3.1.2b. User exists, not verified, still within token expiration -> resend verification email
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
        }

        // 3.2. If user exists without password (e.g., created by external auth)
        else if (existingUser) {
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
                    email: user.email,
                    name: user.name,
                },
            });
        }

        // 3.3. If a new user registration
        else {
            const hashedPassword = await hashPassword(password);
            const verifyToken = uuidv4();
            const verifyTokenExp = new Date(Date.now() + 30 * 60 * 1000); // valid for 30 mins

            await sendVerificationEmail(email, verifyToken);

            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
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
                    email: user.email,
                    name: user.name,
                },
            });
        }
    } catch (error) {
        console.log(error);

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
