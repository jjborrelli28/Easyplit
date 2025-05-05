import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export const hashPassword = (password: string) =>
    bcrypt.hash(password, 10);

export const comparePassword = (password: string, hash: string) =>
    bcrypt.compare(password, hash);

export const generateToken = (userId: string) =>
    jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

export const verifyToken = (token: string) =>
    jwt.verify(token, JWT_SECRET) as { userId: string };
