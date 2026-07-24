import type { NextRequest } from 'next/server';
import {
  apiError,
  apiOk,
  apiValidationError,
  enforceAnalyticsRateLimit,
  getRequestContext,
  requireAdminGuard,
} from '@/modules/core/shared';
import {
  ingestSession,
  getSessionBySessionId,
  listSessions,
  sessionIdSchema,
  sessionIngestSchema,
} from '@/modules/core/session';
import { paginationSchema, visitorIdSchema } from '@/modules/core/visitor';

export const runtime = 'nodejs';

/**
 * POST /api/analytics/session — start or end a session.
 * Body `{ end: true }` closes it (server computes duration + bounce). Public + rate-limited.
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

  const parsed = sessionIngestSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  try {
    const result = await ingestSession(parsed.data, getRequestContext(req));
    return apiOk(result, parsed.data.end ? 200 : 201);
  } catch (err) {
    console.error('[POST /api/analytics/session]', err);
    return apiError('Failed to record session', 500);
  }
}

/**
 * GET /api/analytics/session?sessionId=... — single session (admin only).
 * GET /api/analytics/session?visitorId=&page=&pageSize= — paginated list (admin only).
 */
export async function GET(req: NextRequest) {
  const guard = await requireAdminGuard();
  if (guard) return apiError(guard.error, guard.error === 'Unauthorized' ? 401 : 403);

  const { searchParams } = req.nextUrl;
  const sessionIdParam = searchParams.get('sessionId');

  try {
    if (sessionIdParam) {
      const id = sessionIdSchema.safeParse(sessionIdParam);
      if (!id.success) return apiError('Invalid sessionId', 400);
      return apiOk(await getSessionBySessionId(id.data));
    }

    const visitorIdParam = searchParams.get('visitorId');
    let visitorId: string | undefined;
    if (visitorIdParam) {
      const vid = visitorIdSchema.safeParse(visitorIdParam);
      if (!vid.success) return apiError('Invalid visitorId', 400);
      visitorId = vid.data;
    }

    const { page, pageSize } = paginationSchema.parse({
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
    });
    return apiOk(await listSessions(page, pageSize, visitorId));
  } catch (err) {
    console.error('[GET /api/analytics/session]', err);
    return apiError('Failed to load session data', 500);
  }
}
