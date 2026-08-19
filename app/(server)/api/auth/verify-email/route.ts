import { NextResponse } from "next/server";

import { v4 as uuidv4 } from "uuid";

import prisma from "@/lib/prisma";

const SIGN_IN_TOKEN_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const GET = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url);
        const verifyToken = searchParams.get("token");

        if (!verifyToken) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}`);
        }

        const user = await prisma.user.findFirst({ where: { verifyToken } });

        if (!user) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/not-found`,
            );
        }

        if (user?.emailVerified) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    verifyToken: null,
                    verifyTokenExp: null,
                },
            });

            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/verify-email/result?status=already_verified`,
            );
        }

        if (user?.verifyTokenExp && user.verifyTokenExp <= new Date()) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    verifyToken: null,
                    verifyTokenExp: null,
                },
            });

            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/verify-email/result?status=token_expired`,
            );
        }

        const signInToken = uuidv4();

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: new Date(),
                verifyToken: null,
                verifyTokenExp: null,
                signInToken,
                signInTokenExp: new Date(Date.now() + SIGN_IN_TOKEN_TTL_MS),
            },
        });

        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/verify-email/result?status=success&signInToken=${signInToken}`,
        );
    } catch (error) {
        console.error(error);

        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/verify-email/result?status=error`,
        );
    }
};
