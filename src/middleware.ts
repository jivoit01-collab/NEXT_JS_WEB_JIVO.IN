import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { rateLimit } from '@/lib/rate-limit';

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function addSecurityHeaders(res: NextResponse): NextResponse {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.headers.set(k, v);
  if (process.env.NODE_ENV === 'production') {
    res.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload',
    );
  }
  return res;
}

function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // ── Route classification ──────────────────────────────────────────
  const isAdminPage = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';
  const isAuthApi = pathname.startsWith('/api/auth/');
  // /api/upload has no trailing path but must always be admin-only
  const isAdminApi =
    pathname.startsWith('/api/admin/') || pathname === '/api/upload';
  const isApiRoute = pathname.startsWith('/api/');
  const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

  const ip = clientIp(req);

  // ── 1. Rate limiting ──────────────────────────────────────────────
  if (isAuthApi) {
    // Login brute-force protection: 5 attempts per 15 min per IP
    const { success } = await rateLimit.auth.limit(ip);
    if (!success) {
      return addSecurityHeaders(
        NextResponse.json(
          { success: false, error: 'Too many requests — try again later' },
          { status: 429 },
        ),
      );
    }
  } else if ((isAdminApi || isAdminPage) && isMutation) {
    const { success } = await rateLimit.admin.limit(ip);
    if (!success) {
      return addSecurityHeaders(
        NextResponse.json(
          { success: false, error: 'Too many requests' },
          { status: 429 },
        ),
      );
    }
  }

  // ── 2. CSRF origin check for all API mutations ────────────────────
  // NextAuth handles its own CSRF; skip that path.
  // If an Origin header is present it must match this server's host.
  if (isApiRoute && !isAuthApi && isMutation) {
    const origin = req.headers.get('origin');
    if (origin) {
      const host = req.headers.get('host') ?? '';
      let originHost: string;
      try {
        originHost = new URL(origin).host;
      } catch {
        return addSecurityHeaders(
          NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 }),
        );
      }
      if (originHost !== host) {
        return addSecurityHeaders(
          NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 }),
        );
      }
    }
  }

  // ── 3. Auth + role enforcement ────────────────────────────────────
  // Routes that require an authenticated ADMIN/SUPER_ADMIN session:
  //   • All /admin/* pages
  //   • All /api/admin/* routes and /api/upload
  //   • Any mutation on other API routes covered by this matcher
  const needsAuth =
    isAdminPage ||
    isAdminApi ||
    (isApiRoute && isMutation && !isAuthApi);

  if (!needsAuth) {
    return addSecurityHeaders(NextResponse.next());
  }

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName:
      process.env.NODE_ENV === 'production'
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token',
    secureCookie: process.env.NODE_ENV === 'production',
  });

  const isLoggedIn = !!token;
  const role = token?.role as string | undefined;
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

  // ── 3a. Admin pages — redirect flow ──────────────────────────────
  if (isAdminPage) {
    if (!isLoginPage && !isLoggedIn) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('callbackUrl', pathname);
      return addSecurityHeaders(NextResponse.redirect(url));
    }

    if (!isLoginPage && isLoggedIn && !isAdmin) {
      // Authenticated but not an admin role
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('error', 'AccessDenied');
      return addSecurityHeaders(NextResponse.redirect(url));
    }

    if (isLoginPage && isLoggedIn && isAdmin) {
      return addSecurityHeaders(NextResponse.redirect(new URL('/admin', req.url)));
    }

    return addSecurityHeaders(NextResponse.next());
  }

  // ── 3b. Admin API routes — JSON responses ─────────────────────────
  if (!isLoggedIn) {
    return addSecurityHeaders(
      NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }),
    );
  }
  if (!isAdmin) {
    return addSecurityHeaders(
      NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 }),
    );
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    // Admin dashboard pages
    '/admin/:path*',
    // All /api/admin/* routes (SEO, our-essence, etc.)
    '/api/admin/:path*',
    // File upload endpoint
    '/api/upload',
    // Mixed public-GET / admin-mutation routes
    '/api/home/:path*',
    '/api/navbar/:path*',
    '/api/footer/:path*',
    '/api/hero-slides/:path*',
    // Auth routes — rate limiting only
    '/api/auth/:path*',
  ],
};
