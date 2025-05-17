import { NextResponse } from "next/server";

import { AuthUser, getUserFromCookie } from "@/lib/auth";


export interface AuthUserResponse {
    user: AuthUser | null;
}

export const GET = async (): Promise<NextResponse<AuthUserResponse>> => {
    const user = await getUserFromCookie();

    if (!user) {
        return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
};
