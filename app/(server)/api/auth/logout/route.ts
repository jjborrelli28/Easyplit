import { NextResponse } from 'next/server';

export const POST = () => {
    const res = NextResponse.json({ message: 'Sesión cerrada' });

    res.cookies.set('token', '', { httpOnly: true, maxAge: 0 });

    return res;
}
