import { NextResponse } from 'next/server';

import { comparePassword, generateToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const POST = async (req: Request) => {
    const { email, password } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await comparePassword(password, user.password)))
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = generateToken(user.id);
    const res = NextResponse.json({ message: 'Logged in' });

    res.cookies.set('token', token, { httpOnly: true });

    return res;
}