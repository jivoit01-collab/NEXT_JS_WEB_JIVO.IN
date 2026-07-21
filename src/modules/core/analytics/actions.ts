'use server';

import { requireAdminGuard } from '../shared/auth';
import type { AnalyticsApiResponse, Paginated } from '../shared/types';
import { listEvents } from './data';
import { eventFilterSchema } from './validations';
import type { AnalyticsEventDTO } from './types';

/** Admin: query the universal event log with filters + pagination. */
export async function listEventsAction(
  input?: Record<string, unknown>,
): Promise<AnalyticsApiResponse<Paginated<AnalyticsEventDTO>>> {
  const guard = await requireAdminGuard();
  if (guard) return guard;

  const parsed = eventFilterSchema.safeParse(input ?? {});
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { page, pageSize, ...filter } = parsed.data;

  try {
    return { success: true, data: await listEvents(filter, page, pageSize) };
  } catch (err) {
    console.error('[listEventsAction]', err);
    return { success: false, error: 'Failed to load events' };
  }
}
