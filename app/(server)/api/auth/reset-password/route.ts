import { NextResponse } from "next/server";

import { hash } from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { parseZodErrors } from "@/lib/validations/helpers";
import { resetPasswordSchema } from "@/lib/validations/schemas";

export const POST = async (req: Request) => {
    try {
        const { token, password } = await req.json();
        const result = resetPasswordSchema.safeParse({ password });

        if (!result.success) {
            const errors = parseZodErrors(result.error);

            return NextResponse.json({ errors }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExp: {
                    gte: new Date(),
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Token inválido o expirado" },
                { status: 400 },
            );
        }

        const hashedPassword = await hash(password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExp: null,
            },
        });

        return NextResponse.json({ message: "Contraseña actualizada con éxito" });
    } catch (error) {
        console.log(error);

        return NextResponse.json({ error: "Error interno del servidor al intentar restablecer la contraseña" });
    }
};
