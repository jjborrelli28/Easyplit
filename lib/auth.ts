import { cookies } from "next/headers";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const hashPassword = (password: string) => bcrypt.hash(password, 10);

export const comparePassword = (password: string, hash: string) =>
    bcrypt.compare(password, hash);

export const generateToken = (userId: string) =>
    jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });

export const verifyToken = (token: string) =>
    jwt.verify(token, JWT_SECRET) as { userId: string };

export const getUserFromCookie = async () => {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) return null;

        const user = await verifyToken(token);

        return user;
    } catch (error) {
        console.error(error)

        return null;
    }
};
