import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { compare } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

import { sendVerificationEmail } from "@/lib/auth/helpers";
import { prisma } from "@/lib/prisma";
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
            },
            async authorize(credentials) {
                // 1. Validate credentials format with Zod
                const verifiedCredentials = loginSchema.safeParse(credentials);

                if (!verifiedCredentials.success) {
                    const credentials = parseZodErrors(verifiedCredentials.error);

                    throw new Error(
                        JSON.stringify({
                            code: "ZOD_VALIDATION_ERROR",
                            credentials,
                        }),
                    );
                }

                const { email, password } = verifiedCredentials.data;

                // 2. Check if user with the given email exists
                const existingUser = await prisma.user.findUnique({
                    where: { email },
                });

                if (!existingUser) {
                    throw new Error(
                        JSON.stringify({
                            code: "INVALID_CREDENTIALS",
                            result: "Credenciales inválidas.",
                        }),
                    );
                }

                // 3. If user exists but does not have a password (Google account)
                if (!existingUser.password) {
                    throw new Error(
                        JSON.stringify({
                            code: "GOOGLE_ACCOUNT_EXISTS",
                            result:
                                "Este correo electrónico está registrado mediante Google. Por favor, iniciá sesión con el botón de Google.",
                        }),
                    );
                }

                // 4. Compare given password with stored hashed password
                const validUser = await compare(password, existingUser.password);

                if (!validUser) {
                    throw new Error(
                        JSON.stringify({
                            code: "INVALID_CREDENTIALS",
                            result: "Credenciales inválidas.",
                        }),
                    );
                }

                // 5. If email is not verified
                if (!existingUser.emailVerified) {
                    // 5a. Token expired -> notify user
                    if (
                        existingUser.verifyTokenExp &&
                        existingUser.verifyTokenExp <= new Date()
                    ) {
                        throw new Error(
                            JSON.stringify({
                                code: "EMAIL_NOT_VERIFIED",
                                result:
                                    "Tu cuenta aún no ha sido verificada. Por favor revisá tu casilla para confirmar tu cuenta.",
                            }),
                        );
                    } else {
                        // 5b. Token still valid -> resend verification email
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
                                code: "EMAIL_NOT_VERIFIED",
                                result:
                                    "Tu cuenta aún no ha sido verificada. Se ha enviado un nuevo correo electrónico de verificación. Por favor revisá tu casilla para confirmar tu cuenta.",
                            }),
                        );
                    }
                }

                // 6. Return user session data on successful login
                return {
                    id: existingUser.id,
                    name: existingUser.name,
                    email: existingUser.email,
                    image: existingUser.image,
                };
            },
        }),

        // Google OAuth provider
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
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email! },
                    include: { accounts: true },
                });

                // 1. If user already exists but doesn't have Google linked -> link it
                if (existingUser) {
                    const hasGoogleAccountLinked = existingUser.accounts.some(
                        (acc) => acc.provider === "google",
                    );

                    if (!hasGoogleAccountLinked) {
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
                    return true;
                }

                // 2. If user doesn't exist -> allow default NextAuth flow to create it
                return true;
            }

            return true;
        },
    },
});

export { handler as GET, handler as POST };
