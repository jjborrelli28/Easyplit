import { NextResponse } from "next/server";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type {
    ResetPasswordFields,
    ServerErrorResponse,
    SuccessResponse,
    User,
} from "@/lib/api/types";
import { hashPassword } from "@/lib/auth/helpers";
import prisma from "@/lib/prisma";
import { parseZodErrors } from "@/lib/validations/helpers";
import { resetPasswordSchema } from "@/lib/validations/schemas";

type ResetPasswordHandler = (
    req: Request,
) => Promise<
    NextResponse<SuccessResponse<User> | ServerErrorResponse<ResetPasswordFields>>
>;

export const POST: ResetPasswordHandler = async (req: Request) => {
    try {
        const body = await req.json();

        const res = resetPasswordSchema.safeParse(body);

        if (!res.success) {
            const fields = parseZodErrors(res.error) as ResetPasswordFields;

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

        const { password, token: resetToken } = res.data;

        const user = await prisma.user.findFirst({
            where: {
                resetToken,
                resetTokenExp: {
                    gte: new Date(),
                },
            },
        });

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

        const hashedPassword = await hashPassword(password);

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
                name: user.name,
                email: user.email,
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
