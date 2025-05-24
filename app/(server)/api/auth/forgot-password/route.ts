import { NextResponse } from "next/server";

import { randomBytes } from "crypto";
import { addHours } from "date-fns";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type { ErrorResponse, SuccessResponse } from "@/lib/api/types";
import { sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { parseZodErrors } from "@/lib/validations/helpers";
import { forgotPasswordSchema } from "@/lib/validations/schemas";

type ForgotPasswordHandler = (
    req: Request,
) => Promise<
    NextResponse<ErrorResponse<Record<string, string>> | SuccessResponse>
>;

export const POST: ForgotPasswordHandler = async (req: Request) => {
    try {
        // 1. Validate fields format using Zod schema
        const body = await req.json();
        const result = forgotPasswordSchema.safeParse(body);

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

        const { email } = result.data;

        // 2. Check if user with the given email exists
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.USER_NOT_FOUND,
                        message: ["El correo electrónico no se encuentra registrado."],
                        statusCode: 404,
                    },
                },
                { status: 404 },
            );
        }

        // 3. If user already has a valid reset token
        if (user?.resetToken) {
            // 3.1. Token still valid -> notify user
            if (user.resetTokenExp && user.resetTokenExp > new Date()) {
                console.log(user)
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: API_RESPONSE_CODE.EMAIL_VERIFICATION_SENT,
                            message: [
                                "Ya se ha enviado un correo electrónico para restablecer la contraseña.",
                                "Compruebe su bandeja de entrada.",
                            ],
                            statusCode: 409,
                        },
                    },
                    { status: 409 },
                );
            } else {
                // 3.2. Token expired -> reset token values
                await prisma.user.update({
                    where: { email },
                    data: {
                        resetToken: null,
                        resetTokenExp: null,
                    },
                });
            }
        }

        // 4. Generate a reset token and its expiration time (1 hour from now)
        const resetToken = randomBytes(32).toString("hex");
        const resetTokenExp = addHours(new Date(), 1);

        // 5. Save the token and expiration time to the user's record
        await prisma.user.update({
            where: { email },
            data: {
                resetToken,
                resetTokenExp,
            },
        });

        // 6. Build the password reset link including the token
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

        // 7. Send reset email with the link to the user
        await sendMail({
            to: email,
            subject: "Restablecer contraseña en Easyplit",
            html: `<p>Hacé clic en el siguiente enlace para restablecer tu contraseña: <a href="${resetLink}">¡Restablecer Ahora!</a></p>`,
        });

        // 8. Return success message
        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.EMAIL_VERIFICATION_SENT,
            message: {
                color: "primary",
                icon: "MailCheck",
                title: "Correo enviado",
                content: [
                    {
                        text: "Te enviamos un correo electrónico con instrucciones para restablecer tu contraseña.",
                    },
                    {
                        text: "Si no lo encontrás en tu bandeja de entrada, revisá la carpeta de spam o correo no deseado.",
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
