import { NextResponse } from "next/server";

import { randomBytes } from "crypto";
import { addHours } from "date-fns";

import { sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { parseZodErrors } from "@/lib/validations/helpers";
import { forgotPasswordSchema } from "@/lib/validations/schemas";

export const POST = async (req: Request) => {
    try {
        const body = await req.json();
        const result = forgotPasswordSchema.safeParse(body);

        if (!result.success) {
            const errors = parseZodErrors(result.error);
            return NextResponse.json({ errors }, { status: 400 });
        }

        const { email } = result.data;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return NextResponse.json(
                { error: "El correo electrónico no se encuentra registrado" },
                { status: 404 },
            );
        }

        const token = randomBytes(32).toString("hex");
        const expiration = addHours(new Date(), 1);

        await prisma.user.update({
            where: { email },
            data: {
                resetToken: token,
                resetTokenExp: expiration,
            },
        });

        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

        await sendMail({
            to: email,
            subject: "Restablecer contraseña en Easyplit",
            html: `<p>Hacé clic en el siguiente enlace para restablecer tu contraseña: <a href="${resetLink}">¡Restablecer Ahora!</a></p>`,
        });

        return NextResponse.json({ message: "Email enviado" });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 },
        );
    }
};
