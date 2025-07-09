import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

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
