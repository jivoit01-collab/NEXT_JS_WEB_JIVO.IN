import type { NextRequest } from 'next/server';
import {
  apiError,
  apiOk,
  apiValidationError,
  enforceAnalyticsRateLimit,
  getRequestContext,
  requireAdminGuard,
} from '@/modules/core/shared';
import { ingestVisitor, getVisitorByVisitorId, listVisitors } from '@/modules/core/visitor';
import { visitorIngestSchema, paginationSchema, visitorIdSchema } from '@/modules/core/visitor';

// Prisma + node:crypto (IP hashing) require the Node.js runtime.
export const runtime = 'nodejs';

/**
 * POST /api/analytics/visitor — public visitor identify/upsert.
 * Rate-limited, Zod-validated; IP is hashed server-side (never trusted/stored raw).
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

  const parsed = visitorIngestSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  try {
    const result = await ingestVisitor(parsed.data, getRequestContext(req));
    return apiOk(result, 201);
  } catch (err) {
    console.error('[POST /api/analytics/visitor]', err);
    return apiError('Failed to record visitor', 500);
  }
}

/**
 * GET /api/analytics/visitor?visitorId=... — single visitor (admin only).
 * GET /api/analytics/visitor?page=&pageSize= — paginated list (admin only).
 */
export async function GET(req: NextRequest) {
  const guard = await requireAdminGuard();
  if (guard) return apiError(guard.error, guard.error === 'Unauthorized' ? 401 : 403);

  const { searchParams } = req.nextUrl;
  const visitorIdParam = searchParams.get('visitorId');

  try {
    if (visitorIdParam) {
      const id = visitorIdSchema.safeParse(visitorIdParam);
      if (!id.success) return apiError('Invalid visitorId', 400);
      return apiOk(await getVisitorByVisitorId(id.data));
    }

    const { page, pageSize } = paginationSchema.parse({
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
    });
    return apiOk(await listVisitors(page, pageSize));
  } catch (err) {
    console.error('[GET /api/analytics/visitor]', err);
    return apiError('Failed to load visitor data', 500);
  }
}
