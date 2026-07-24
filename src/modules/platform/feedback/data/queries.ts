import 'server-only';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { toFeedbackDTO } from './mappers';
import type { FeedbackDTO, FeedbackFilter, FeedbackStats } from '../types';

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Shared where-builder (always excludes soft-deleted). */
export function buildFeedbackWhere(filter: FeedbackFilter = {}): Prisma.FeedbackWhereInput {
  return {
    deletedAt: null,
    ...(filter.type ? { type: filter.type } : {}),
    ...(filter.status ? { status: filter.status } : {}),
    ...(filter.sentiment ? { sentiment: filter.sentiment } : {}),
    ...(filter.entityType ? { entityType: filter.entityType } : {}),
    ...(filter.entityId ? { entityId: filter.entityId } : {}),
    ...(filter.visitorId ? { visitorId: filter.visitorId } : {}),
    ...(filter.from || filter.to
      ? {
          createdAt: {
            ...(filter.from ? { gte: filter.from } : {}),
            ...(filter.to ? { lte: filter.to } : {}),
          },
        }
      : {}),
  };
}

export async function getFeedbackById(id: string): Promise<FeedbackDTO | null> {
  const row = await prisma.feedback.findFirst({ where: { id, deletedAt: null } });
  return row ? toFeedbackDTO(row) : null;
}

export async function listFeedback(
  filter: FeedbackFilter,
  page: number,
  pageSize: number,
): Promise<Paginated<FeedbackDTO>> {
  const where = buildFeedbackWhere(filter);
  const [rows, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.feedback.count({ where }),
  ]);
  return {
    items: rows.map(toFeedbackDTO),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Overview stats (optionally scoped by filter). Each metric fails soft to 0. */
export async function getFeedbackStats(filter: FeedbackFilter = {}): Promise<FeedbackStats> {
  const where = buildFeedbackWhere(filter);
  const [total, open, pending, resolved, avg, positive, neutral, negative] =
    await Promise.allSettled([
      prisma.feedback.count({ where }),
      prisma.feedback.count({ where: { ...where, status: 'OPEN' } }),
      prisma.feedback.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.feedback.count({ where: { ...where, status: 'RESOLVED' } }),
      prisma.feedback.aggregate({ _avg: { rating: true }, where: { ...where, rating: { not: null } } }).then((r) => r._avg.rating ?? null),
      prisma.feedback.count({ where: { ...where, sentiment: 'POSITIVE' } }),
      prisma.feedback.count({ where: { ...where, sentiment: 'NEUTRAL' } }),
      prisma.feedback.count({ where: { ...where, sentiment: 'NEGATIVE' } }),
    ]);
  const n = (r: PromiseSettledResult<number>) => (r.status === 'fulfilled' ? r.value : 0);
  return {
    total: n(total),
    open: n(open),
    pending: n(pending),
    resolved: n(resolved),
    avgRating: avg.status === 'fulfilled' ? avg.value : null,
    positive: n(positive),
    neutral: n(neutral),
    negative: n(negative),
  };
}

/** Ranked breakdown by feedback type. */
export async function feedbackByType(filter: FeedbackFilter = {}) {
  const rows = await prisma.feedback.groupBy({
    by: ['type'],
    where: buildFeedbackWhere(filter),
    _count: { _all: true },
    orderBy: { _count: { type: 'desc' } },
    take: 12,
  });
  return rows.map((r) => ({ label: r.type, value: r._count._all }));
}

/** Sentiment breakdown. */
export async function feedbackBySentiment(filter: FeedbackFilter = {}) {
  const rows = await prisma.feedback.groupBy({
    by: ['sentiment'],
    where: { ...buildFeedbackWhere(filter), sentiment: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { sentiment: 'desc' } },
    take: 3,
  });
  return rows.map((r) => ({ label: r.sentiment ?? '—', value: r._count._all }));
}

/** Pages with the most feedback. */
export async function feedbackTopPages(filter: FeedbackFilter = {}) {
  const rows = await prisma.feedback.groupBy({
    by: ['pageUrl'],
    where: { ...buildFeedbackWhere(filter), pageUrl: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { pageUrl: 'desc' } },
    take: 8,
  });
  return rows.map((r) => ({ label: r.pageUrl ?? '—', value: r._count._all }));
}

/** Ranked breakdown by source. */
export async function feedbackBySource(filter: FeedbackFilter = {}) {
  const rows = await prisma.feedback.groupBy({
    by: ['source'],
    where: buildFeedbackWhere(filter),
    _count: { _all: true },
    orderBy: { _count: { source: 'desc' } },
    take: 10,
  });
  return rows.map((r) => ({ label: r.source, value: r._count._all }));
}

/** Feedback submissions bucketed by day (last N days). */
export async function feedbackTrend(
  filter: FeedbackFilter = {},
  days = 30,
): Promise<{ label: string; value: number }[]> {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));
  const rows = await prisma.feedback.findMany({
    where: { ...buildFeedbackWhere(filter), createdAt: { gte: from } },
    select: { createdAt: true },
    take: 50000,
  });
  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    buckets.set(`${d.getMonth() + 1}/${d.getDate()}`, 0);
  }
  for (const r of rows) {
    const k = `${r.createdAt.getMonth() + 1}/${r.createdAt.getDate()}`;
    if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + 1);
  }
  return [...buckets.entries()].map(([label, value]) => ({ label, value }));
}

/** Most recent feedback (compact). */
export async function recentFeedback(filter: FeedbackFilter = {}, limit = 6): Promise<FeedbackDTO[]> {
  const rows = await prisma.feedback.findMany({
    where: buildFeedbackWhere(filter),
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return rows.map(toFeedbackDTO);
}
