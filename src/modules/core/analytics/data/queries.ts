import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import type { Paginated } from '../../shared/types';
import type { AnalyticsEventDTO, EventFilter } from '../types';

const eventPublicSelect = {
  eventType: true,
  page: true,
  entityType: true,
  entityId: true,
  metadata: true,
  timestamp: true,
  sessionId: true,
  visitorId: true,
  createdAt: true,
} as const;

function buildWhere(filter: EventFilter): Prisma.AnalyticsEventWhereInput {
  return {
    ...(filter.eventType ? { eventType: filter.eventType } : {}),
    ...(filter.pagePath ? { page: filter.pagePath } : {}),
    ...(filter.entityType ? { entityType: filter.entityType } : {}),
    ...(filter.visitorId ? { visitorId: filter.visitorId } : {}),
    ...(filter.sessionId ? { sessionId: filter.sessionId } : {}),
    ...(filter.from || filter.to
      ? {
          timestamp: {
            ...(filter.from ? { gte: filter.from } : {}),
            ...(filter.to ? { lte: filter.to } : {}),
          },
        }
      : {}),
  };
}

/** Admin: paginated, filterable event log (newest first). */
export async function listEvents(
  filter: EventFilter,
  page: number,
  pageSize: number,
): Promise<Paginated<AnalyticsEventDTO>> {
  const where = buildWhere(filter);
  const [items, total] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: eventPublicSelect,
    }),
    prisma.analyticsEvent.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Count events matching a filter — building block for future dashboards. */
export async function countEvents(filter: EventFilter = {}): Promise<number> {
  return prisma.analyticsEvent.count({ where: buildWhere(filter) });
}
