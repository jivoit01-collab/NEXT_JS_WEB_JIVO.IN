import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isIpBlocked } from '@/lib/admin-security-store';
import { localRateLimit } from '@/lib/rate-limit-local';

const ADMIN_ROUTE = '/jivo-dev';
const LEGACY_ADMIN_ROUTE = '/admin';
const NOT_FOUND_ROUTE = '/__not-found';

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function addSecurityHeaders(res: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(key, value);
  }

  if (process.env.NODE_ENV === 'production') {
    res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  return res;
}

function notFound(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = NOT_FOUND_ROUTE;
  url.search = '';

  return addSecurityHeaders(NextResponse.rewrite(url));
}

function normalizeIp(ip: string | null | undefined): string | null {
  if (!ip) return null;

  const first = ip.split(',')[0]?.trim();
  if (!first) return null;

  const withoutPort = /^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(first)
    ? first.slice(0, first.lastIndexOf(':'))
    : first;

  return withoutPort.startsWith('::ffff:')
    ? withoutPort.slice('::ffff:'.length)
    : withoutPort;
}

function clientIp(req: NextRequest): string | null {
  const hintedReq = req as NextRequest & { ip?: string };

  return (
    normalizeIp(req.headers.get('x-real-ip')) ??
    normalizeIp(req.headers.get('x-forwarded-for')) ??
    normalizeIp(req.headers.get('cf-connecting-ip')) ??
    normalizeIp(hintedReq.ip)
  );
}

function allowedAdminIps(): Set<string> {
  return new Set(
    (process.env.ALLOWED_ADMIN_IPS ?? '')
      .split(',')
      .map((ip) => normalizeIp(ip))
      .filter((ip): ip is string => Boolean(ip)),
  );
}

function isCredentialAuthPost(pathname: string, method: string): boolean {
  return (
    method === 'POST' &&
    pathname.startsWith('/api/auth/') &&
    (pathname.includes('/callback/credentials') || pathname.includes('/signin/credentials'))
  );
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  if (pathname.startsWith(LEGACY_ADMIN_ROUTE)) {
    return notFound(req);
  }

  const isAdminPage = pathname.startsWith(ADMIN_ROUTE);
  const isLoginPage = pathname === `${ADMIN_ROUTE}/login`;
  const isAdminApi = pathname.startsWith('/api/admin/') || pathname === '/api/upload';
  const isCredentialAuth = isCredentialAuthPost(pathname, method);
  const isApiRoute = pathname.startsWith('/api/');
  const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
  const isGuardedTarget = isAdminPage || isAdminApi || isCredentialAuth;

  if (isGuardedTarget) {
    const ip = clientIp(req);
    const allowedIps = allowedAdminIps();

    if (!ip || !allowedIps.has(ip)) {
      return notFound(req);
    }

    try {
      if (await isIpBlocked(ip)) {
        return notFound(req);
      }
    } catch (error) {
      console.error('[proxy.adminSecurityStore]', { ip, error });
      return notFound(req);
    }
  }

  if ((isAdminApi || isAdminPage) && isMutation) {
    const ip = clientIp(req) ?? 'unknown';
    const limiter = pathname === '/api/upload' ? localRateLimit.upload : localRateLimit.admin;
    const result = limiter(ip);

    if (!result.allowed) {
      return addSecurityHeaders(
        NextResponse.json(
          { success: false, error: 'Too many requests' },
          { status: 429, headers: { 'Retry-After': String(result.retryAfter) } },
        ),
      );
    }
  }

  // CSRF origin check for all API mutations except NextAuth, which owns its CSRF flow.
  if (isApiRoute && !pathname.startsWith('/api/auth/') && isMutation) {
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

  const needsAuth = isAdminPage || isAdminApi || (isApiRoute && isMutation && !pathname.startsWith('/api/auth/'));

  if (!needsAuth) {
    return addSecurityHeaders(NextResponse.next());
  }

  const isHttps =
    req.headers.get('x-forwarded-proto') === 'https' || req.nextUrl.protocol === 'https:';

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName: isHttps ? '__Secure-authjs.session-token' : 'authjs.session-token',
    secureCookie: isHttps,
  });

  const role = token?.role as string | undefined;
  const isLoggedIn = Boolean(token);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

  if (isAdminPage) {
    if (!isLoginPage && !isLoggedIn) {
      const url = req.nextUrl.clone();
      url.pathname = `${ADMIN_ROUTE}/login`;

      const proto = req.headers.get('x-forwarded-proto') ?? req.nextUrl.protocol.replace(':', '');
      const host = req.headers.get('host') ?? req.nextUrl.host;
      url.searchParams.set('callbackUrl', `${proto}://${host}${pathname}`);

      return addSecurityHeaders(NextResponse.redirect(url));
    }

    if (!isLoginPage && isLoggedIn && !isAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = `${ADMIN_ROUTE}/login`;
      url.searchParams.set('error', 'AccessDenied');
      return addSecurityHeaders(NextResponse.redirect(url));
    }

    if (isLoginPage && isLoggedIn && isAdmin) {
      return addSecurityHeaders(NextResponse.redirect(new URL(ADMIN_ROUTE, req.url)));
    }

    return addSecurityHeaders(NextResponse.next());
  }

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
    '/admin/:path*',
    '/jivo-dev/:path*',
    '/api/admin/:path*',
    '/api/upload',
    '/api/home/:path*',
    '/api/navbar/:path*',
    '/api/footer/:path*',
    '/api/hero-slides/:path*',
    '/api/auth/:path*',
  ],
};
