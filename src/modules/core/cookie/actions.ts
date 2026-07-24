'use server';

import { requireAdminGuard } from '../shared/auth';
import { ANALYTICS_PAGE_SIZE } from '../shared/constants';
import type { AnalyticsApiResponse, Paginated } from '../shared/types';
import { paginationSchema, visitorIdSchema } from '../visitor/validations';
import { getConsentByVisitorId, listConsents } from './data';
import type { CookieConsentDTO } from './types';

/** Read a visitor's own consent — usable client-side to hydrate the banner. */
export async function getConsentAction(
  visitorId: string,
): Promise<AnalyticsApiResponse<CookieConsentDTO | null>> {
  const parsed = visitorIdSchema.safeParse(visitorId);
  if (!parsed.success) return { success: false, error: 'Invalid visitorId' };

  try {
    return { success: true, data: await getConsentByVisitorId(parsed.data) };
  } catch (err) {
    console.error('[getConsentAction]', err);
    return { success: false, error: 'Failed to load consent' };
  }
}

/** Admin: list all consent records. */
export async function listConsentsAction(input?: {
  page?: number;
  pageSize?: number;
}): Promise<AnalyticsApiResponse<Paginated<CookieConsentDTO>>> {
  const guard = await requireAdminGuard();
  if (guard) return guard;

  const parsed = paginationSchema.safeParse(input ?? {});
  const { page, pageSize } = parsed.success
    ? parsed.data
    : { page: 1, pageSize: ANALYTICS_PAGE_SIZE };

  try {
    return { success: true, data: await listConsents(page, pageSize) };
  } catch (err) {
    console.error('[listConsentsAction]', err);
    return { success: false, error: 'Failed to load consents' };
  }
}
