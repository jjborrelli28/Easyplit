import { NextResponse } from "next/server";

import { compare } from "bcryptjs";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type {
    DeleteUserFields,
    ServerErrorResponse,
    SuccessResponse,
    UpdateUserFields,
    UserData
} from "@/lib/api/types";
import { hashPassword } from "@/lib/auth/helpers";
import prisma from "@/lib/prisma";
import { parseZodErrors } from "@/lib/validations/helpers";
import { nameSchema, passwordSchema } from "@/lib/validations/schemas";

type ResetPasswordHandler = (
    req: Request,
) => Promise<
    NextResponse<
        SuccessResponse<UserData> | ServerErrorResponse<UpdateUserFields>
    >
>;

// Update user
export const POST: ResetPasswordHandler = async (req: Request) => {
    try {
        const { id, name, password, currentPassword } = await req.json();

        // Search user by id
        let user = await prisma.user.findFirst({
            where: {
                id,
            },
        });

        // User not found
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.INVALID_CREDENTIALS,
                        message: ["Usuario no encontrado."],
                        statusCode: 404,
                    },
                },
                { status: 404 },
            );
        }

        const nameIsModified = name && name !== user.name;
        const passwordModified = password && password !== user.password;

        // Check if no changes have been made
        if (!nameIsModified && !passwordModified) {
            return NextResponse.json({
                success: false,
                error: {
                    code: API_RESPONSE_CODE.NO_CHANGES_PROVIDED,
                    message: ["No se proporcionaron cambios para actualizar."],
                    statusCode: 400,
                },
            });
        }

        // If the name is modified
        if (nameIsModified) {
            // Name format validation
            const res = nameSchema.safeParse({
                name,
            });

            if (!res.success) {
                const fields = parseZodErrors(res.error) as unknown as UpdateUserFields;

                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: API_RESPONSE_CODE.INVALID_FIELD_FORMAT,
                            message: ["Formato de nombre incorrecto."],
                            fields,
                            statusCode: 400,
                        },
                    },
                    { status: 400 },
                );
            }

            // Update user name
            user = await prisma.user.update({
                where: { id },
                data: {
                    name,
                },
            });
        }

        // If the password is modified
        if (passwordModified) {
            // Check if the user has a password
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

            // Password format validation
            const passwordValidation = passwordSchema.safeParse({
                password,
            });

            if (!passwordValidation.success) {
                const fields = parseZodErrors(
                    passwordValidation.error,
                ) as unknown as UpdateUserFields;

                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: API_RESPONSE_CODE.INVALID_FIELD_FORMAT,
                            message: ["Formato de contraseña incorrecto."],
                            fields,
                            statusCode: 400,
                        },
                    },
                    { status: 400 },
                );
            }

            // Current password format validation
            const currentPassworValidation = passwordSchema.safeParse({
                password: currentPassword,
            });

            if (!currentPassworValidation.success) {
                const fields = parseZodErrors(
                    currentPassworValidation.error,
                ) as unknown as UpdateUserFields;

                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: API_RESPONSE_CODE.INVALID_FIELD_FORMAT,
                            message: ["Formato de contraseña incorrecto."],
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
                            message: ["La contraseña ingresada no es correcta."],
                            statusCode: 400,
                        },
                    },
                    { status: 400 },
                );
            }

            const hashedNewtPassword = await hashPassword(password);

            // Update user password
            user = await prisma.user.update({
                where: { id },
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
                id,
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

type DeleteUserHandler = (
    req: Request,
) => Promise<
    NextResponse<
        SuccessResponse<UserData> | ServerErrorResponse<DeleteUserFields>
    >
>;

export const DELETE: DeleteUserHandler = async (req) => {
    try {
        const { id, password } = await req.json();

        // Search user by id
        const user = await prisma.user.findFirst({ where: { id } });

        // User not found
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.INVALID_CREDENTIALS,
                        message: ["Usuario no encontrado."],
                        statusCode: 404,
                    },
                },
                { status: 404 },
            );
        }

        // Check if the user has a password
        if (user?.password) {
            // Password format validation
            const passwordValidation = passwordSchema.safeParse({
                password,
            });

            if (!passwordValidation.success) {
                const fields = parseZodErrors(
                    passwordValidation.error,
                ) as unknown as DeleteUserFields;

                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: API_RESPONSE_CODE.INVALID_FIELD_FORMAT,
                            message: ["Formato de contraseña incorrecto."],
                            fields,
                            statusCode: 400,
                        },
                    },
                    { status: 400 },
                );
            }

            // Credential verification
            const validUser = await compare(password, user.password);

            if (!validUser) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: API_RESPONSE_CODE.INVALID_CREDENTIALS,
                            message: ["La contraseña ingresada no es correcta."],
                            statusCode: 400,
                        },
                    },
                    { status: 400 },
                );
            }
        }

        // Remove user
        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            code: API_RESPONSE_CODE.DATA_DELETED,
            message: {
                color: "success",
                icon: "Trash",
                title: "Cuenta eliminada",
                content: [
                    {
                        text: "Tu cuenta fue eliminada correctamente.",
                    },
                    {
                        text: "Serás redirigido a la página principal.",
                        style: "muted",
                    },
                ],
            },
            data: {
                id,
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
