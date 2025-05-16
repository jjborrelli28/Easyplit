

import { NextResponse } from 'next/server';

import jwt from 'jsonwebtoken';

import { prisma } from '@/lib/prisma';

export const GET = async (req: Request) => {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=missing_code`);
    }

    const response = await fetch(`${process.env.AUTH0_DOMAIN}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            grant_type: 'authorization_code',
            client_id: process.env.AUTH0_CLIENT_ID,
            client_secret: process.env.AUTH0_CLIENT_SECRET,
            code,
            redirect_uri: `${process.env.NEXT_PUBLIC_API_URL}/auth/0/callback`,
        }),
    });

    const data = await response.json();

    if (!data.access_token) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=token`);
    }

    const profileRes = await fetch(`${process.env.AUTH0_DOMAIN}/userinfo`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
    });

    const profile = await profileRes.json();

    // Check if the user exists
    let user = await prisma.user.findUnique({
        where: { email: profile.email },
    });

    // If it does not exist, we create it with a verified email address
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: profile.email,
                name: profile.name || profile.email,
                password: '', // Empty, because you do not log in with password
                emailVerified: true,
            },
        });
    }

    // Generate JWT and set cookie
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: '7d',
    });

    const res = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
    res.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    });

    return res;
}


