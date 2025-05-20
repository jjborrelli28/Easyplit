import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";

const secret = process.env.NEXTAUTH_SECRET;

export const middleware = async (req: NextRequest) => {
    const token = await getToken({ req, secret });
    const { pathname } = req.nextUrl;

    const isAuthenticated = !!token;
    const isAuthPage = pathname === "/login" || pathname === "/register";

    if (isAuthenticated && isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (!isAuthenticated && pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
};

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register"],
};
