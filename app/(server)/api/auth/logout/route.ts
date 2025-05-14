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
        console.error('Error al cerrar sesión:', error);

        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
};

