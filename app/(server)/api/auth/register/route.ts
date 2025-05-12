import { NextResponse } from "next/server";

import { v4 as uuidv4 } from "uuid";

import { hashPassword } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { parseZodErrors } from "@/lib/validations/helpers";
import { registerSchema } from "@/lib/validations/schemas";

export const POST = async (req: Request) => {
    const body = await req.json();

    const result = registerSchema.safeParse(body);

    if (!result.success) {
        const errors = parseZodErrors(result.error);

        return NextResponse.json({ errors }, { status: 400 });
    }

    const { alias, email, password } = result.data;

    const exists = await prisma.user.findUnique({ where: { email } });

    if (exists) {
        return NextResponse.json(
            { errors: { email: exists.emailVerified ? "Ya existe un usuario con este email" : 'Usuario creado con este email, falta verificación' } },
            { status: 400 },
        );
    }

    const verifyToken = uuidv4();
    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
        data: { alias, email, password: hashed, verifyToken },
    });

    try {
        await sendVerificationEmail(email, verifyToken);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to send verification email" },
            { status: 500 },
        );
    }

    return NextResponse.json({
        message: "User created. Please check your email to verify your address.",
        user: {
            id: user.id,
            email: user.email,
            alias: user.alias,
        },
    });
};
