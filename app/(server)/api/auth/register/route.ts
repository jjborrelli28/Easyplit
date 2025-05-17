import { NextResponse } from "next/server";

import { v4 as uuidv4 } from "uuid";

import { hashPassword } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { parseZodErrors } from "@/lib/validations/helpers";
import { registerSchema } from "@/lib/validations/schemas";

export const POST = async (req: Request) => {
    try {
        const body = await req.json();
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            const errors = parseZodErrors(result.error);
            return NextResponse.json({ error: { fields: errors } }, { status: 400 });
        }

        const { name, email, password } = result.data;
        const exists = await prisma.user.findUnique({ where: { email } });

        if (exists) {
            return NextResponse.json(
                {
                    error: exists.emailVerified ? 'Ya existe un usuario con este correo electrónico' : 'Correo electrónico registrado, falta verificar del mismo'
                },
                { status: 400 },
            );
        }

        const verifyToken = uuidv4();
        const hashed = await hashPassword(password);
        const user = await prisma.user.create({
            data: { name, email, password: hashed, verifyToken },
        });

        try {
            await sendVerificationEmail(email, verifyToken);
        } catch (error) {
            return NextResponse.json(
                { error: "Error al enviar correo electrónico de verificación" },
                { status: 500 },
            );
        }

        return NextResponse.json({
            message:
                "Usuario creado. Por favor, compruebe su correo electrónico para verificar su dirección",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 },
        );
    }
};
