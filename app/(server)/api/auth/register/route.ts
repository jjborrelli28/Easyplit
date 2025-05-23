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
            return NextResponse.json(
                { error: { fields, code: "ZOD_VALIDATION_ERROR" } },
                { status: 400 },
            );
        }

        const { name, email, password } = result.data;

        // 2. Check if user already exists in the database
        const existingUser = await prisma.user.findUnique({ where: { email } });

        // 3. If user exists with a password (user created with credentials)
        if (existingUser?.password) {
            // 3.1.1. User is already verified
            if (existingUser?.emailVerified) {
                return NextResponse.json(
                    {
                        error: {
                            result:
                                "Ya existe una cuenta registrada con este correo electrónico.",
                            code: "EMAIL_ALREADY_REGISTERED",
                        },
                    },
                    { status: 409 },
                );
            }

            // 3.1.2a. User exists, but verify token expired
            if (
                existingUser?.verifyTokenExp &&
                existingUser.verifyTokenExp >= new Date()
            ) {
                return NextResponse.json(
                    {
                        error: {
                            result:
                                "Ya existe una cuenta registrada con este correo electrónico que aún no ha sido verificada. Por favor revisá tu casilla para confirmar tu cuenta.",
                            code: "EMAIL_NOT_VERIFIED",
                        },
                    },
                    { status: 409 },
                );
            } else {
                // 3.1.2b. User exists, not verified, still within token expiration -> resend verification email
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

        // 3.2. If user exists without password (e.g., created by external auth)
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
                    "¡Usuario creado! Ya puedes iniciar sesión con tu correo electrónico y contraseña.",
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            });
        }

        // 3.3. If a new user registration
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
                    "¡Usuario creado! Revisá tu correo electrónico para verificar tu cuenta.",
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
                    code: "INTERNAL_ERROR",
                },
            },
            { status: 500 },
        );
    }
};
