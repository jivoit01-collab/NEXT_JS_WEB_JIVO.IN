import 'server-only';

// ==========================================================================
// AI Observability data — the ONLY Prisma access for execution metadata. Stores
// one AIExecution row per request; never stores conversation content.
// ==========================================================================

import { prisma } from '@/lib/db';
import type { AIExecutionDTO, AIExecutionRecord, ObservabilityStats } from '../types';
import { ratio } from '../utils';

function toDTO(row: {
  id: string;
  correlationId: string;
  conversationId: string | null;
  messageId: string | null;
  visitorId: string | null;
  userId: string | null;
  channel: string;
  promptTemplate: string | null;
  promptVersion: number | null;
  knowledgeVersion: number | null;
  contextStrategy: string | null;
  retrievedDocs: number;
  provider: string | null;
  model: string | null;
  fromFallback: boolean;
  responseTimeMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  experienceCards: number;
  success: boolean;
  errorType: string | null;
  quality: number | null;
  feedbackId: string | null;
  createdAt: Date;
}): AIExecutionDTO {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

/** Insert one execution record. Returns the id (or null on failure). */
export async function insertExecution(record: AIExecutionRecord): Promise<string | null> {
  const row = await prisma.aIExecution.create({ data: record, select: { id: true } });
  return row.id;
}

/**
 * The AIExecution delegate. If the Prisma client is stale (regenerated after the
 * dev server started) the delegate can be undefined — guard so a dashboard widget
 * degrades to "empty" instead of throwing a TypeError mid-render.
 */
function executionModel(): typeof prisma.aIExecution | null {
  return prisma.aIExecution ?? null;
}

/** Recent executions (newest first). */
export async function recentExecutions(limit = 25): Promise<AIExecutionDTO[]> {
  const model = executionModel();
  if (!model) return [];
  const rows = await model.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
  return rows.map(toDTO);
}

/** Aggregate stats over all executions. */
export async function executionStats(): Promise<ObservabilityStats> {
  const model = executionModel();
  if (!model) {
    return { totalExecutions: 0, successRate: 0, avgResponseTimeMs: 0, totalTokens: 0, totalEstimatedCost: 0, fallbackRate: 0 };
  }
  const [total, ok, fallback, agg] = await Promise.all([
    model.count(),
    model.count({ where: { success: true } }),
    model.count({ where: { fromFallback: true } }),
    model.aggregate({
      _avg: { responseTimeMs: true },
      _sum: { totalTokens: true, estimatedCost: true },
    }),
  ]);
  return {
    totalExecutions: total,
    successRate: ratio(ok, total),
    avgResponseTimeMs: Math.round(agg._avg.responseTimeMs ?? 0),
    totalTokens: agg._sum.totalTokens ?? 0,
    totalEstimatedCost: Math.round((agg._sum.estimatedCost ?? 0) * 10_000) / 10_000,
    fallbackRate: ratio(fallback, total),
  };
}

/** Provider-grouped rollups (avg latency, tokens, cost, counts) — dashboard. */
export async function executionsByProvider(): Promise<
  { provider: string; count: number; avgResponseTimeMs: number; totalTokens: number; estimatedCost: number; failures: number }[]
> {
  const model = executionModel();
  if (!model) return [];
  const rows = await model.groupBy({
    by: ['provider'],
    _count: { _all: true },
    _avg: { responseTimeMs: true },
    _sum: { totalTokens: true, estimatedCost: true },
  });
  const failures = await model.groupBy({
    by: ['provider'],
    where: { success: false },
    _count: { _all: true },
  });
  const failMap = new Map(failures.map((f) => [f.provider ?? 'unknown', f._count._all]));
  return rows.map((r) => ({
    provider: r.provider ?? 'unknown',
    count: r._count._all,
    avgResponseTimeMs: Math.round(r._avg.responseTimeMs ?? 0),
    totalTokens: r._sum.totalTokens ?? 0,
    estimatedCost: Math.round((r._sum.estimatedCost ?? 0) * 10_000) / 10_000,
    failures: failMap.get(r.provider ?? 'unknown') ?? 0,
  }));
}
