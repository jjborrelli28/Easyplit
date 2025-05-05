import { NextResponse } from 'next/server';

import { hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    const { email, password } = await req.json();
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: 'User exists' }, { status: 400 });

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
        data: { email, password: hashed },
    });

    return NextResponse.json({ message: 'User created', user });
}
