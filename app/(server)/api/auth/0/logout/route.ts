import { NextResponse } from 'next/server';

export const GET = async () => {
    const res = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
    res.cookies.set('token', '', {
        httpOnly: true,
        expires: new Date(0),
        path: '/',
    });

    return res;
}
