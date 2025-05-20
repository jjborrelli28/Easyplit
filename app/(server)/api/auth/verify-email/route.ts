import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const GET = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url);
        const verifyToken = searchParams.get("token");

        // No token
        if (!verifyToken) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}`);
        }

        const user = await prisma.user.findFirst({ where: { verifyToken } });

        // User not found
        if (!user) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/verify-email/result?status=user_not_found`,
            );
        }

        // Verified email
        if (user.emailVerified) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/verify-email/result?status=already_verified`,
            );
        }

        // Expired token
        if (!user.verifyTokenExp || user.verifyTokenExp < new Date()) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/verify-email/result?status=token_expired`,
            );
        }

        // User verification
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: new Date(),
                verifyToken: null,
                verifyTokenExp: null,
            },
        });

        NextResponse.json({ message: "Correo electrónico verificado." });

        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/verify-email/result?status=success`,
        );
    } catch (error) {
        console.log(error)

        NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });

        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/verify-email/result?status=error`,
        );
    }
};
