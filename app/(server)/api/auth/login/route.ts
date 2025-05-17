import { NextResponse } from "next/server";

import { comparePassword, generateToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseZodErrors } from "@/lib/validations/helpers";
import { loginSchema } from "@/lib/validations/schemas";

export const POST = async (req: Request) => {
    try {
        const body = await req.json();
        const result = loginSchema.safeParse(body);

        if (!result.success) {
            const fieldErrors = parseZodErrors(result.error);
            return NextResponse.json({ fieldErrors }, { status: 400 });
        }

        const { email, password } = result.data;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !(await comparePassword(password, user.password))) {
            return NextResponse.json(
                { error: "Credenciales inválidas" },
                { status: 401 },
            );
        }

        if (!user.emailVerified) {
            return NextResponse.json(
                { error: "Correo electrónico no verificado" },
                { status: 403 },
            );
        }

        const token = generateToken(user.id);
        const res = NextResponse.json({ message: "Sesión iniciada" });

        res.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
        });

        return res;
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 },
        );
    }
};
