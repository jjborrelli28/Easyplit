import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { hashPassword, sendVerificationEmail } from "@/lib/auth/helpers";
import { prisma } from "@/lib/prisma";
import { parseZodErrors } from "@/lib/validations/helpers";
import { registerSchema } from "@/lib/validations/schemas";

export const POST = async (req: Request) => {
    try {
        const body = await req.json();

        // 1. Validate fields format using Zod schema
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            const fields = parseZodErrors(result.error);
            return NextResponse.json({ error: { fields } }, { status: 400 });
        }

        const { name, email, password } = result.data;

        // 2. Check if user already exists in the database
        const existingUser = await prisma.user.findUnique({ where: { email } });

        // Case 1: User exists with a password and is already verified
        if (existingUser?.password) {
            if (existingUser.emailVerified) {
                return NextResponse.json(
                    {
                        error: {
                            result:
                                "Ya existe una cuenta registrada con este correo electrónico.",
                        },
                    },
                    { status: 409 },
                );
            }

            // Case 2: User exists, but verify token expired
            if (
                existingUser.verifyTokenExp &&
                existingUser.verifyTokenExp <= new Date()
            ) {
                return NextResponse.json(
                    {
                        error: {
                            result:
                                "Ya existe una cuenta registrada con este correo electrónico que aún no ha sido verificada. Por favor revisá tu casilla para confirmar tu cuenta.",
                        },
                    },
                    { status: 409 },
                );
            } else {
                // Case 3: User exists, not verified, still within token expiration
                const verifyToken = uuidv4();
                const verifyTokenExp = new Date(Date.now() + 30 * 60 * 1000); // valid for 30 mins

                await prisma.user.update({
                    where: { email },
                    data: {
                        verifyToken,
                        verifyTokenExp,
                    },
                });

                await sendVerificationEmail(email, verifyToken);

                return NextResponse.json({
                    message:
                        "Ya existe una cuenta registrada con este correo electrónico que aún no ha sido verificada. Se ha enviado un nuevo correo electrónico de verificación. Por favor revisá tu casilla para confirmar tu cuenta.",
                });
            }
        }

        // Case 4: User exists without password (e.g., created by external auth)
        else if (existingUser) {
            const hashedPassword = await hashPassword(password);

            const user = await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    emailVerified: new Date(),
                },
            });

            return NextResponse.json({
                message:
                    "Usuario creado. Ya puedes iniciar sesión con tu correo electrónico y contraseña.",
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            });
        }

        // Case 5: New user registration
        else {
            const hashedPassword = await hashPassword(password);
            const verifyToken = uuidv4();
            const verifyTokenExp = new Date(Date.now() + 30 * 60 * 1000); // valid for 30 mins

            await sendVerificationEmail(email, verifyToken);

            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    verifyToken,
                    verifyTokenExp,
                },
            });

            return NextResponse.json({
                message:
                    "Usuario creado. Por favor, revisá tu correo electrónico para verificar tu cuenta.",
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
            {
                error: {
                    result: "Error interno del servidor.",
                },
            },
            { status: 500 },
        );
    }
};
