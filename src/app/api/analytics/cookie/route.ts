import type { NextRequest } from 'next/server';
import {
  apiError,
  apiOk,
  apiValidationError,
  enforceAnalyticsRateLimit,
  getRequestContext,
  requireAdminGuard,
} from '@/modules/core/shared';
import { ingestConsent, getConsentByVisitorId, listConsents, cookieConsentSchema } from '@/modules/core/cookie';
import { paginationSchema, visitorIdSchema } from '@/modules/core/visitor';

export const runtime = 'nodejs';

/**
 * POST /api/analytics/cookie — set/update a visitor's cookie consent. Public + rate-limited.
 */
export async function POST(req: NextRequest) {
  const limited = enforceAnalyticsRateLimit(req);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON body', 400);
  }

  const parsed = cookieConsentSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  try {
    const result = await ingestConsent(parsed.data, getRequestContext(req));
    return apiOk(result, 201);
  } catch (err) {
    console.error('[POST /api/analytics/cookie]', err);
    return apiError('Failed to record consent', 500);
  }
}

/**
 * GET /api/analytics/cookie?visitorId=... — a visitor reads its own consent (public).
 * GET /api/analytics/cookie?page=&pageSize= — paginated list (admin only).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const visitorIdParam = searchParams.get('visitorId');

  // Public branch: a visitor may read ONLY its own consent by id.
  if (visitorIdParam) {
    const id = visitorIdSchema.safeParse(visitorIdParam);
    if (!id.success) return apiError('Invalid visitorId', 400);
    try {
      return apiOk(await getConsentByVisitorId(id.data));
    } catch (err) {
      console.error('[GET /api/analytics/cookie:self]', err);
      return apiError('Failed to load consent', 500);
    }
  }

  // Admin branch: list all consent records.
  const guard = await requireAdminGuard();
  if (guard) return apiError(guard.error, guard.error === 'Unauthorized' ? 401 : 403);

  try {
    const { page, pageSize } = paginationSchema.parse({
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
    });
    return apiOk(await listConsents(page, pageSize));
  } catch (err) {
    console.error('[GET /api/analytics/cookie]', err);
    return apiError('Failed to load consents', 500);
  }
}
