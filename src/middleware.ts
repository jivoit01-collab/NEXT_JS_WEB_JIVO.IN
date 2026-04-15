import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Edge-safe middleware.
 *
 * Uses `getToken` from `next-auth/jwt` (Web Crypto only) instead of
 * constructing a full NextAuth instance. This avoids pulling in the
 * Credentials provider, bcryptjs, or Prisma at edge compile time.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminArea = pathname.startsWith('/admin');
  if (!isAdminArea) return NextResponse.next();

  const isLoginPage = pathname === '/admin/login';

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    // NextAuth v5 uses "authjs." as the cookie prefix
    cookieName:
      process.env.NODE_ENV === 'production'
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token',
    secureCookie: process.env.NODE_ENV === 'production',
  });

  const isLoggedIn = !!token;

  if (!isLoginPage && !isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
