import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id?: string | null;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            hasPassword?: boolean;
        };
    }

    interface User {
        hasPassword?: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        hasPassword?: boolean;
    }
}
