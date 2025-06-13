import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { compare } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

import API_RESPONSE_CODE from "@/lib/api/API_RESPONSE_CODE";
import { sendVerificationEmail } from "@/lib/auth/helpers";
import prisma from "@/lib/prisma";
import verifyRecaptcha from "@/lib/recaptcha";
import { parseZodErrors } from "@/lib/validations/helpers";
import { loginSchema } from "@/lib/validations/schemas";

const handler = NextAuth({
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
                recaptchaToken: { label: "ReCAPTCHA Token", type: "text" },
            },
            async authorize(credentials) {
                // Credential format validation
                const res = loginSchema.safeParse(credentials);

                if (!res.success) {
                    const fields = parseZodErrors(res.error);

                    throw new Error(
                        JSON.stringify({
                            code: API_RESPONSE_CODE.INVALID_FIELD_FORMAT,
                            message: ["Revisá los datos ingresados."],
                            fields,
                            statusCode: 400,
                        }),
                    );
                }

                const { email, password, recaptchaToken } = res.data;

                // ReCAPTCHA verification
                try {
                    await verifyRecaptcha(recaptchaToken);
                } catch (error) {
                    throw new Error(
                        JSON.stringify({
                            code: API_RESPONSE_CODE.INVALID_RECAPTCHA,
                            message: ["Fallo la verificación de reCAPTCHA."],
                            details: error,
                            statusCode: 400,
                        }),
                    );
                }

                // Search user by email
                const user = await prisma.user.findUnique({
                    where: { email },
                });

                // User not found
                if (!user) {
                    throw new Error(
                        JSON.stringify({
                            code: API_RESPONSE_CODE.INVALID_CREDENTIALS,
                            message: ["Credenciales inválidas."],
                            statusCode: 400,
                        }),
                    );
                }

                // Check if the user has a Google loggin
                if (!user?.password) {
                    throw new Error(
                        JSON.stringify({
                            code: API_RESPONSE_CODE.GOOGLE_ACCOUNT_EXISTS,
                            message: [
                                "Este correo electrónico está registrado mediante Google. Por favor, iniciá sesión con el botón de 'Iniciar sesión con Google'.",
                            ],
                            statusCode: 409,
                        }),
                    );
                }

                // Credential verification
                const validUser = await compare(password, user.password);

                if (!validUser) {
                    throw new Error(
                        JSON.stringify({
                            code: API_RESPONSE_CODE.INVALID_CREDENTIALS,
                            message: ["Credenciales inválidas."],
                            statusCode: 400,
                        }),
                    );
                }

                // Check if the account is not verified
                if (!user?.emailVerified) {
                    // Check if user has an active verification token
                    if (user?.verifyTokenExp && user.verifyTokenExp <= new Date()) {
                        throw new Error(
                            JSON.stringify({
                                code: API_RESPONSE_CODE.EMAIL_NOT_VERIFIED,
                                message: [
                                    "Tu cuenta aún no ha sido verificada.",
                                    "Por favor revisá tu casilla para confirmar tu cuenta.",
                                ],
                                statusCode: 409,
                            }),
                        );
                    }
                    // Verification token is expired
                    else {
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

                        throw new Error(
                            JSON.stringify({
                                code: API_RESPONSE_CODE.EMAIL_NOT_VERIFIED,
                                message: [
                                    "Tu cuenta aún no ha sido verificada.",
                                    "Se ha enviado un nuevo correo electrónico de verificación.",
                                    "Por favor revisá tu casilla para confirmar tu cuenta.",
                                ],
                                statusCode: 409,
                            }),
                        );
                    }
                }

                // Login
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    hasPassword: true,
                };
            },
        }),

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "select_account",
                },
            },
        }),
    ],

    session: {
        strategy: "jwt",
    },

    // SignIn callback to handle user linking on Google login
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                // Search user by email
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email! },
                    include: { accounts: true },
                });

                // Check If the user exists but is not linked to Google
                if (existingUser) {
                    const hasGoogleAccountLinked = existingUser.accounts.some(
                        (acc) => acc.provider === "google",
                    );

                    if (!hasGoogleAccountLinked) {
                        // Link user with google
                        await prisma.account.create({
                            data: {
                                userId: existingUser.id,
                                type: account.type,
                                provider: account.provider,
                                providerAccountId: account.providerAccountId,
                                refresh_token: account.refresh_token,
                                access_token: account.access_token,
                                expires_at: account.expires_at,
                                token_type: account.token_type,
                                scope: account.scope,
                                id_token: account.id_token,
                                session_state: account.session_state,
                            },
                        });
                    }
                    // Login
                    return true;
                }
                // If the user does not exist, allow NextAuth to create it
                return true;
            }
            return true;
        },

        // Callback to modify the JWT (executed when logging in or updating token)
        async jwt({ token, user }) {
            const email = user?.email ?? token?.email;

            // Search user by email
            if (email) {
                const existingUser = await prisma.user.findUnique({
                    where: { email },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        emailVerified: true,
                        password: true,
                    },
                });

                // If the user exists, update the token with the user's details
                if (existingUser) {
                    token.id = existingUser.id;
                    token.name = existingUser.name;
                    token.email = existingUser.email;
                    token.image = existingUser.image;
                    token.hasPassword = !!existingUser.password;
                }
            }

            return token;
        },
        // Callback to modify the session before sending it to the client
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as string;
                session.user.name = token.name as string;
                session.user.email = token.email as string;
                session.user.image = token.image as string;
                session.user.hasPassword = token.hasPassword as boolean;
            }

            return session;
        },
    },
});

export { handler as GET, handler as POST };
