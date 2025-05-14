import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const verifyToken = searchParams.get("token");

    if (!verifyToken)
        return NextResponse.json({ error: "Token inválido" }, { status: 400 });

    const user = await prisma.user.findFirst({ where: { verifyToken } });

    if (!user)
        return NextResponse.json({ error: "Token inválido" }, { status: 400 });

    if (user.emailVerified) {
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email/result?status=already_verified`
        );
    }

    try {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verifyToken: null,
            },
        });

        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email/result?status=success`
        );
    } catch {
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email/result?status=error`
        );
    }
}
