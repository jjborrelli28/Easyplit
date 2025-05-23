import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const GET = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url);
        const verifyToken = searchParams.get("token");

        // 1. Validate fields format using Zod schema
        if (!verifyToken) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}`);
        }

        // 2. Find the user associated with the token
        const user = await prisma.user.findFirst({ where: { verifyToken } });

        // 3. If no user is found, redirect to 404 page
        if (!user) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/not-found`,
            );
        }

        // 4. If the user is already verified, clear token and redirect with "already_verified" status
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

        // 5. If the token is expired, clear token and redirect with "token_expired" status
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

        // 6. Verify user email, clear token, and redirect with "success" status
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
        console.log(error);

        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/verify-email/result?status=error`,
        );
    }
};
