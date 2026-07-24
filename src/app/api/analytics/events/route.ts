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
  ingestEvents,
  listEvents,
  analyticsEventBatchSchema,
  eventFilterSchema,
} from '@/modules/core/analytics';
import type { AnalyticsEventInput } from '@/modules/core/analytics';

export const runtime = 'nodejs';

/**
 * POST /api/analytics/events — ingest one event or a bounded batch (`{ events: [...] }`).
 * Universal endpoint for EVERY interaction type. Public + rate-limited.
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

  const parsed = analyticsEventBatchSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const events: AnalyticsEventInput[] =
    'events' in parsed.data ? parsed.data.events : [parsed.data];

  try {
    const written = await ingestEvents(events, getRequestContext(req));
    return apiOk({ written }, 201);
  } catch (err) {
    console.error('[POST /api/analytics/events]', err);
    return apiError('Failed to record events', 500);
  }
}

/**
 * GET /api/analytics/events?eventType=&pagePath=&visitorId=&from=&to=&page=&pageSize=
 * Filterable, paginated event log (admin only).
 */
export async function GET(req: NextRequest) {
  const guard = await requireAdminGuard();
  if (guard) return apiError(guard.error, guard.error === 'Unauthorized' ? 401 : 403);

  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = eventFilterSchema.safeParse(params);
  if (!parsed.success) return apiValidationError(parsed.error);

  const { page, pageSize, ...filter } = parsed.data;

  try {
    return apiOk(await listEvents(filter, page, pageSize));
  } catch (err) {
    console.error('[GET /api/analytics/events]', err);
    return apiError('Failed to load events', 500);
  }
}
