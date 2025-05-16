import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const GET = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url);
        const verifyToken = searchParams.get("token");

        if (!verifyToken) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/`);
        }

        const user = await prisma.user.findFirst({ where: { verifyToken } });

        if (!user) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/verify-email/result?status=error`,
            );
        }

        if (user.emailVerified) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/verify-email/result?status=already_verified`,
            );
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verifyToken: null,
            },
        });

        NextResponse.json({ message: 'Email verificado' });

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
