import { NextResponse } from "next/server";

import { v4 as uuidv4 } from "uuid";

import { hashPassword, sendVerificationEmail } from "@/lib/auth/helpers";
import { prisma } from "@/lib/prisma";
import { parseZodErrors } from "@/lib/validations/helpers";
import { registerSchema } from "@/lib/validations/schemas";

export const POST = async (req: Request) => {
    try {
        const body = await req.json();

        // Verification of field formats
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            const fields = parseZodErrors(result.error);

            return NextResponse.json({ error: { fields } }, { status: 400 });
        }

        const { name, email, password } = result.data;

        // Verification of existing or linked user with Google
        const existingUser = await prisma.user.findUnique({ where: { email } });
        const isGoogleLinked =
            existingUser &&
            (await prisma.account.findFirst({
                where: {
                    userId: existingUser.id,
                    provider: "google",
                },
            }));

        if (existingUser) {
            if (existingUser?.password && isGoogleLinked) {
                return NextResponse.json(
                    {
                        error: {
                            result:
                                "Ya existe una cuenta registrada con este correo electrónico y vinculada con Google. Puedes iniciar sesión con ambos métodos.",
                        },
                    },
                    { status: 400 },
                );
            }

            if (!isGoogleLinked) {
                return NextResponse.json(
                    {
                        error: {
                            result: existingUser.emailVerified
                                ? "Ya existe una cuenta registrada con este correo electrónico."
                                : "Este correo ya está registrado pero aún no fue verificado. Por favor revisá tu casilla para confirmar tu cuenta.",
                        },
                    },
                    { status: 400 },
                );
            }
        }

        // Verification token generation, expiration time and password hashings

        const hashedPassword = await hashPassword(password);

        let user;

        if (isGoogleLinked) {
            // If linked to Google just add a password
            user = await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    emailVerified: new Date(),
                },
            });

            return NextResponse.json({
                message:
                    "Usuario creado. Ya puedes iniciar sesión con tu email y contraseña.",
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            });
        } else {
            // If it is a new user, create it and send verification email
            const verifyToken = uuidv4();
            const verifyTokenExp = new Date(Date.now() + 30 * 60 * 1000);

            user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    verifyToken,
                    verifyTokenExp,
                },
            });

            await sendVerificationEmail(email, verifyToken);

            return NextResponse.json({
                message:
                    "Usuario creado. Por favor, compruebe su correo electrónico para verificar su dirección.",
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            });
        }
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            { error: { result: "Error interno del servidor." } },
            { status: 500 },
        );
    }
};
