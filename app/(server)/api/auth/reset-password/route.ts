import { NextResponse } from "next/server";

import { hash } from "bcryptjs";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import { ErrorResponse, SuccessResponse } from "@/lib/api/types";
import prisma from "@/lib/prisma";
import { parseZodErrors } from "@/lib/validations/helpers";
import { updatePasswordSchema } from "@/lib/validations/schemas";

type ResetPasswordHandler = (
    req: Request,
) => Promise<
    NextResponse<ErrorResponse<Record<string, string>> | SuccessResponse>
>;

export const POST: ResetPasswordHandler = async (req: Request) => {
    try {
        const { token: resetToken, password } = await req.json();

        // Field format verification
        const fieldVerification = updatePasswordSchema.safeParse({
            password,
        });

        if (!fieldVerification.success) {
            const fields = parseZodErrors(fieldVerification.error);

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

        // Search user with reset token
        const user = await prisma.user.findFirst({
            where: {
                resetToken,
                resetTokenExp: {
                    gte: new Date(),
                },
            },
        });

        // User not found
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.TOKEN_INVALID,
                        message: ["Token inválido o expirado."],
                        statusCode: 400,
                    },
                },
                { status: 400 },
            );
        }

        const hashedPassword = await hash(password, 10);

        // Update user password
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExp: null,
            },
        });

        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.PASSWORD_RESET_SUCCESS,
            message: {
                color: "success",
                icon: "CheckCircle",
                title: "¡Contraseña actualizada!",
                content: [
                    { text: "Tu contraseña fue restablecida con éxito." },
                    {
                        text: "Ya podés iniciar sesión con tus nuevas credenciales.",
                        style: "small",
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
