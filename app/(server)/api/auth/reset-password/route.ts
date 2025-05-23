import { NextResponse } from "next/server";

import { hash } from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { parseZodErrors } from "@/lib/validations/helpers";
import { resetPasswordSchema } from "@/lib/validations/schemas";

export const POST = async (req: Request) => {
    try {
        const { token: resetToken, password } = await req.json();

        // 1. Validate fields format using Zod schema
        const result = resetPasswordSchema.safeParse({
            password,
            code: "ZOD_VALIDATION_ERROR",
        });

        if (!result.success) {
            const fields = parseZodErrors(result.error);

            return NextResponse.json(
                {
                    error: {
                        fields,
                        code: "INVALID_INPUT",
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
                    error: {
                        result: "Token inválido o expirado.",
                        code: "INVALID_OR_EXPIRED_TOKEN",
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
            message: "Contraseña actualizada con éxito.",
        });
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            {
                error: {
                    result: "Error interno del servidor.",
                    code: "INTERNAL_ERROR",
                },
            },
            { status: 500 },
        );
    }
};
