import { NextResponse } from "next/server";

import { compare } from "bcryptjs";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import { ErrorResponse, SuccessResponse } from "@/lib/api/types";
import { hashPassword } from "@/lib/auth/helpers";
import prisma from "@/lib/prisma";
import { parseZodErrors } from "@/lib/validations/helpers";
import {
    updateNameSchema,
    updatePasswordSchema,
} from "@/lib/validations/schemas";

type ResetPasswordHandler = (
    req: Request,
) => Promise<
    NextResponse<ErrorResponse<Record<string, string>> | SuccessResponse>
>;

export const POST: ResetPasswordHandler = async (req: Request) => {
    try {
        const { name, password, currentPassword, email } = await req.json();

        // Search user by email
        const user = await prisma.user.findFirst({
            where: {
                email,
            },
        });

        if (!user) {
            throw new Error(
                JSON.stringify({
                    code: API_RESPONSE_CODE.INVALID_CREDENTIALS,
                    message: ["Usuario no encontrado."],
                    statusCode: 400,
                }),
            );
        }

        // If the name is changed
        if (name) {
            // Name format verification
            const fieldVerification = updateNameSchema.safeParse({
                name,
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

            // Update user name
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    name,
                },
            });
        }

        // If the password is changed
        if (password) {
            // Verification of existing user with password
            if (!user?.password) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: API_RESPONSE_CODE.TOKEN_INVALID,
                            message: ["El usuario no tiene contraseña."],
                            statusCode: 400,
                        },
                    },
                    { status: 400 },
                );
            }

            // Password format verification
            const newPasswordVerificacion = updatePasswordSchema.safeParse({
                password,
            });

            if (!newPasswordVerificacion.success) {
                const fields = parseZodErrors(newPasswordVerificacion.error);

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

            // CurrentPassword format verification
            const currentPasswordVerification = updatePasswordSchema.safeParse({
                password: currentPassword,
            });

            if (!currentPasswordVerification.success) {
                const fields = parseZodErrors(currentPasswordVerification.error);

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

            // Credential verification
            const validUser = await compare(currentPassword, user.password);

            if (!validUser) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: API_RESPONSE_CODE.INVALID_CREDENTIALS,
                            message: ["Credenciales inválidas."],
                            statusCode: 400,
                        },
                    },
                    { status: 400 },
                );
            }

            const hashedNewtPassword = await hashPassword(password);

            // Update user password
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedNewtPassword,
                },
            });
        }

        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.DATA_UPDATED,
            message: {
                color: "success",
                icon: "CheckCircle",
                title: "¡Datos actualizados con éxito!",
                content: [
                    {
                        text:
                            name && !password
                                ? "Tu nombre fue actualizado con éxito."
                                : name && password
                                    ? "Tu nombre y contraseña fueron actualizados con éxito."
                                    : !name && password
                                        ? "Tu contraseña fue actualizada con éxito."
                                        : "Tus datos fueron actualizados con éxito.",
                    },
                ],
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
