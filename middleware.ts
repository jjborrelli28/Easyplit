import { type NextRequest, NextResponse } from "next/server";

const delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const middleware = async (req: NextRequest) => {
    if (process.env.NODE_ENV === "development") {
        await delay(300); // 300ms delay only in development environment
    }

    const token = req.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
};

export const config = {
    matcher: ["/dashboard"],
};
