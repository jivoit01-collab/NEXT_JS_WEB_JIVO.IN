import { NextResponse } from 'next/server';
import type { ZodError } from 'zod';
import { localRateLimit } from '@/lib/rate-limit-local';
import { hashedClientIp, rateLimitKey } from './security';
import type { AnalyticsApiResponse, RequestContext } from './types';

/** Build the server-trusted request context (hashed IP, UA, referrer). */
export function getRequestContext(req: Request): RequestContext {
  return {
    ipHash: hashedClientIp(req.headers),
    userAgent: req.headers.get('user-agent'),
    referrer: req.headers.get('referer'),
  };
}

/** 200/201 success envelope. */
export function apiOk<T>(data: T, status = 200): NextResponse<AnalyticsApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

/** Error envelope with an explicit status code. */
export function apiError(
  error: string,
  status: number,
  fieldErrors?: Record<string, string[]>,
): NextResponse<AnalyticsApiResponse<never>> {
  return NextResponse.json({ success: false, error, fieldErrors }, { status });
}

/** 400 from a Zod parse failure — never leaks internals, just field messages. */
export function apiValidationError(error: ZodError): NextResponse<AnalyticsApiResponse<never>> {
  return apiError(
    'Validation failed',
    400,
    error.flatten().fieldErrors as Record<string, string[]>,
  );
}

/**
 * Enforce the public analytics write budget for this request's IP.
 * Returns a ready-to-send 429 response when the limit is exceeded, else null.
 */
export function enforceAnalyticsRateLimit(req: Request): NextResponse | null {
  const result = localRateLimit.analytics(rateLimitKey(req.headers));
  if (result.allowed) return null;

  return NextResponse.json(
    { success: false, error: 'Too many requests' },
    { status: 429, headers: { 'Retry-After': String(result.retryAfter) } },
  );
}
