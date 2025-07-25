import { NextResponse } from "next/server";

import { compare } from "bcryptjs";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import type {
    DeleteUserFields,
    ServerErrorResponse,
    SuccessResponse,
    UpdateUserFields,
    User,
} from "@/lib/api/types";
import { hashPassword } from "@/lib/auth/helpers";
import prisma from "@/lib/prisma";
import { parseZodErrors } from "@/lib/validations/helpers";
import { deleteUserSchema, updateUserSchema } from "@/lib/validations/schemas";

type UpdateUserHandler = (
    req: Request,
) => Promise<
    NextResponse<
        SuccessResponse<User> | ServerErrorResponse<UpdateUserFields>
    >
>;

// Update user
export const POST: UpdateUserHandler = async (req: Request) => {
    try {
        const body = await req.json();

        const res = updateUserSchema.safeParse(body);

        if (!res.success) {
            const fields = parseZodErrors(res.error) as UpdateUserFields;

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

        const { id, name, password, currentPassword } = res.data;

        let user = await prisma.user.findFirst({
            where: {
                id,
            },
        });

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

        const nameIsModified = name !== '' && name !== user.name;
        const passwordModified = password !== '' && password !== user.password;

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

        if (nameIsModified) {
            user = await prisma.user.update({
                where: { id },
                data: {
                    name,
                },
            });
        }

        if (passwordModified && currentPassword) {
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
        SuccessResponse<User> | ServerErrorResponse<DeleteUserFields>
    >
>;

// Delete user
export const DELETE: DeleteUserHandler = async (req) => {
    try {
        const body = await req.json();

        const res = deleteUserSchema.safeParse(body);

        if (!res.success) {
            const fields = parseZodErrors(res.error) as unknown as DeleteUserFields;

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

        const { id, password } = res.data;

        const user = await prisma.user.findFirst({ where: { id } });

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

        if (user?.password) {
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

        const groupsCount = await prisma.group.count({
            where: {
                createdById: id,
            },
        });

        if (groupsCount > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.NO_CHANGES_PROVIDED,
                        message: ["No se puede eliminar el usuario porque tiene grupos creados."],
                        statusCode: 400,
                    },
                },
                { status: 400 },
            );
        }

        const expensesCount = await prisma.expense.count({
            where: {
                paidById: id,
            },
        });

        if (expensesCount > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: API_RESPONSE_CODE.NO_CHANGES_PROVIDED,
                        message: ["No se puede eliminar el usuario porque tiene gastos creados."],
                        statusCode: 400,
                    },
                },
                { status: 400 },
            );
        }

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
