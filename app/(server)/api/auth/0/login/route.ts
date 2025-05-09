import { NextResponse } from 'next/server';

export const GET = async () => {
    const auth0Domain = process.env.AUTH0_DOMAIN!;
    const clientId = process.env.AUTH0_CLIENT_ID!;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/0/callback`;

    const url = `${auth0Domain}/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid profile email`;

    return NextResponse.redirect(url);
}
