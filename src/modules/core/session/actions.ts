'use server';

import { requireAdminGuard } from '../shared/auth';
import { ANALYTICS_PAGE_SIZE } from '../shared/constants';
import type { AnalyticsApiResponse, Paginated } from '../shared/types';
import { paginationSchema } from '../visitor/validations';
import { getSessionBySessionId, listSessions } from './data';
import { sessionIdSchema } from './validations';
import type { SessionDTO } from './types';

export async function getSessionAction(
  sessionId: string,
): Promise<AnalyticsApiResponse<SessionDTO | null>> {
  const guard = await requireAdminGuard();
  if (guard) return guard;

  const parsed = sessionIdSchema.safeParse(sessionId);
  if (!parsed.success) return { success: false, error: 'Invalid sessionId' };

  try {
    return { success: true, data: await getSessionBySessionId(parsed.data) };
  } catch (err) {
    console.error('[getSessionAction]', err);
    return { success: false, error: 'Failed to load session' };
  }
}

export async function listSessionsAction(input?: {
  page?: number;
  pageSize?: number;
  visitorId?: string;
}): Promise<AnalyticsApiResponse<Paginated<SessionDTO>>> {
  const guard = await requireAdminGuard();
  if (guard) return guard;

  const parsed = paginationSchema.safeParse(input ?? {});
  const { page, pageSize } = parsed.success
    ? parsed.data
    : { page: 1, pageSize: ANALYTICS_PAGE_SIZE };

  try {
    return { success: true, data: await listSessions(page, pageSize, input?.visitorId) };
  } catch (err) {
    console.error('[listSessionsAction]', err);
    return { success: false, error: 'Failed to load sessions' };
  }
}
