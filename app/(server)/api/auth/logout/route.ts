import { NextResponse } from 'next/server';

export const POST = () => {
    try {
        const res = NextResponse.json({ message: 'Sesión cerrada' });

        res.cookies.set('token', '', {
            httpOnly: true,
            maxAge: 0,
            path: '/',
        });

        return res;
    } catch (error) {
        console.error(error);

        return NextResponse.json({ error: 'Error interno del servidor al intentar cerrar sesión' }, { status: 500 });
    }
};

