import { NextResponse } from "next/server";

import { hash } from "bcryptjs";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import { prisma } from "@/lib/prisma";
import { parseZodErrors } from "@/lib/validations/helpers";
import { resetPasswordSchema } from "@/lib/validations/schemas";
import { ErrorResponse, SuccessResponse } from "@/lib/api/types";

type ResetPasswordHandler = (
    req: Request,
) => Promise<
    NextResponse<ErrorResponse<Record<string, string>> | SuccessResponse>
>;

export const POST: ResetPasswordHandler = async (req: Request) => {
    try {
        const { token: resetToken, password } = await req.json();

        // 1. Validate fields format using Zod schema
        const result = resetPasswordSchema.safeParse({
            password,
        });

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

        // 2. Look for a user with a valid (non-expired) reset token
        const user = await prisma.user.findFirst({
            where: {
                resetToken,
                resetTokenExp: {
                    gte: new Date(),
                },
            },
        });

        // 3. If token is invalid or expired
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

        // 4. Update user password and remove the reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExp: null,
            },
        });

        // 5. Return success message
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
