'use server';

import { requireAdminGuard } from '../shared/auth';
import type { AnalyticsApiResponse, Paginated } from '../shared/types';
import { ANALYTICS_PAGE_SIZE } from '../shared/constants';
import { getVisitorByVisitorId, listVisitors } from './data';
import { visitorIdSchema, paginationSchema } from './validations';
import type { VisitorDTO } from './types';

/**
 * Admin server actions — future dashboard reads. Ingestion is public and lives
 * in the API route (rate-limited); these are guarded by an admin session.
 */

export async function getVisitorAction(
  visitorId: string,
): Promise<AnalyticsApiResponse<VisitorDTO | null>> {
  const guard = await requireAdminGuard();
  if (guard) return guard;

  const parsed = visitorIdSchema.safeParse(visitorId);
  if (!parsed.success) return { success: false, error: 'Invalid visitorId' };

  try {
    return { success: true, data: await getVisitorByVisitorId(parsed.data) };
  } catch (err) {
    console.error('[getVisitorAction]', err);
    return { success: false, error: 'Failed to load visitor' };
  }
}

export async function listVisitorsAction(
  input?: { page?: number; pageSize?: number },
): Promise<AnalyticsApiResponse<Paginated<VisitorDTO>>> {
  const guard = await requireAdminGuard();
  if (guard) return guard;

  const parsed = paginationSchema.safeParse(input ?? {});
  const { page, pageSize } = parsed.success
    ? parsed.data
    : { page: 1, pageSize: ANALYTICS_PAGE_SIZE };

  try {
    return { success: true, data: await listVisitors(page, pageSize) };
  } catch (err) {
    console.error('[listVisitorsAction]', err);
    return { success: false, error: 'Failed to load visitors' };
  }
}
