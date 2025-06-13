import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const GET = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url);
        const verifyToken = searchParams.get("token");

        // Verify token existence
        if (!verifyToken) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}`);
        }

        // Search user by verify token
        const user = await prisma.user.findFirst({ where: { verifyToken } });

        // User not found
        if (!user) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/not-found`,
            );
        }

        // Check if the user is verified
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

        // Check if the token is expired
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

        // Verify user email
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: new Date(),
                verifyToken: null,
                verifyTokenExp: null,
            },
        });

        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/verify-email/result?status=success`,
        );
    } catch (error) {
        console.error(error);

        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/verify-email/result?status=error`,
        );
    }
};
