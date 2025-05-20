import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { compare } from "bcryptjs";

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
                // Verification of credentials format
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

                // Verification of existing user
                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user) {
                    throw new Error(
                        JSON.stringify({
                            code: "INVALID_CREDENTIALS",
                            result: "Credenciales inválidas.",
                        }),
                    );
                }

                // Verification of existing user with Google login
                if (!user.password) {
                    throw new Error(
                        JSON.stringify({
                            code: "GOOGLE_ACCOUNT_EXISTS",
                            result:
                                "Este correo está vinculado a una cuenta creada con Google. Usa el botón de 'Iniciar sesión con Google' para acceder.",
                        }),
                    );
                }

                // Credential verification
                const validUser = await compare(password, user.password);

                if (!validUser) {
                    throw new Error(
                        JSON.stringify({
                            code: "INVALID_CREDENTIALS",
                            result: "Credenciales inválidas.",
                        }),
                    );
                }

                // Verified user verification
                if (!user.emailVerified) {
                    throw new Error(
                        JSON.stringify({
                            code: "EMAIL_NOT_VERIFIED",
                            result:
                                "Tu cuenta aún no ha sido verificada. Por favor revisá tu correo electrónico para confirmar tu cuenta.",
                        }),
                    );
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
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
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                // User verification
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email! },
                    include: { accounts: true },
                });

                if (existingUser) {
                    const hasGoogleAccountLinked = existingUser.accounts.some(
                        (acc) => acc.provider === "google",
                    );

                    // If you do not have a Google link, we do it
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

                return true;
            }

            return true;
        },
    },
});

export { handler as GET, handler as POST };
