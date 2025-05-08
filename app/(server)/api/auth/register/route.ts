import { NextResponse } from 'next/server';

import { v4 as uuidv4 } from 'uuid';

import { hashPassword } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/mailer';
import { prisma } from '@/lib/prisma';

export const POST = async (req: Request) => {
    const { alias, email, password } = await req.json();

    if (!alias || alias.length < 3) {
        return NextResponse.json({ error: 'Alias must be at least 3 characters' }, { status: 400 });
    }

    if (!email || !email.includes('@')) {
        return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    if (!password || password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: 'User exists' }, { status: 400 });

    const verifyToken = uuidv4();
    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
        data: { alias, email, password: hashed, verifyToken },
    });

    try {
        await sendVerificationEmail(email, verifyToken);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
    }

    return NextResponse.json({
        message: 'User created. Please check your email to verify your address.',
        user: {
            id: user.id,
            email: user.email,
            alias: user.alias,
        },
    });
};



