import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";

const secret = process.env.NEXTAUTH_SECRET;

const unauthenticatedPaths = ["/", "/login", "/register"];

const authenticatedPaths = [
    "/my-profile",
    "/dashboard",
    "/recent-activity",
    "/all-expenses",
];

export const middleware = async (req: NextRequest) => {
    const token = await getToken({ req, secret });
    const { pathname } = req.nextUrl;

    const isAuthenticated = !!token;

    if (isAuthenticated && unauthenticatedPaths.includes(pathname)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (!isAuthenticated && authenticatedPaths.includes(pathname)) {
        console.log(pathname);
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
};

export const config = {
    matcher: [
        "/",
        "/login",
        "/register",
        "/my-profile",
        "/dashboard/:path*",
        "/recent-activity/:path*",
        "/all-expenses/:path*",
    ],
};
