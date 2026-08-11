import { NextResponse } from "next/server";

import { randomBytes } from "crypto";
import { addHours } from "date-fns";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type {
    ForgotPasswordFields,
    ServerErrorResponse,
    SuccessResponse,
    User,
} from "@/lib/api/types";
import { renderEmailTemplate } from "@/lib/email/template";
import { sendMail } from "@/lib/mailer";
import prisma from "@/lib/prisma";
import verifyRecaptcha from "@/lib/recaptcha";
import { parseZodErrors } from "@/lib/validations/helpers";
import { forgotPasswordSchema } from "@/lib/validations/schemas";

type ForgotPasswordHandler = (
    req: Request,
) => Promise<
    NextResponse<
        SuccessResponse<User> | ServerErrorResponse<ForgotPasswordFields>
    >
>;

export const POST: ForgotPasswordHandler = async (req: Request) => {
    try {
        const body = await req.json();

        const res = forgotPasswordSchema.safeParse(body);

        if (!res.success) {
            const fields = parseZodErrors(res.error) as ForgotPasswordFields;

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

        const { email, recaptchaToken } = res.data;

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

        if (user?.resetToken) {
            if (user.resetTokenExp && user.resetTokenExp > new Date()) {
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
                await prisma.user.update({
                    where: { email },
                    data: {
                        resetToken: null,
                        resetTokenExp: null,
                    },
                });
            }
        }

        const resetToken = randomBytes(32).toString("hex");
        const resetTokenExp = addHours(new Date(), 1); // valid for 60 mins

        await prisma.user.update({
            where: { email },
            data: {
                resetToken,
                resetTokenExp,
            },
        });

        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

        const { html, text } = renderEmailTemplate({
            previewText: "Restablecé tu contraseña en Easyplit.",
            heading: "Restablecé tu contraseña",
            paragraphs: [
                "Recibimos una solicitud para restablecer tu contraseña. Hacé clic en el siguiente botón para elegir una nueva.",
                "Este enlace vence en 60 minutos.",
            ],
            ctaLabel: "Restablecer contraseña",
            ctaUrl: resetLink,
            footerNote:
                "Si no solicitaste este cambio, podés ignorar este correo.",
        });

        await sendMail({
            to: email,
            subject: "Restablecer contraseña en Easyplit",
            html,
            text,
        });

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
                name: user.name,
                email,
                image: user.image,
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
