import 'server-only';

// ==========================================================================
// Knowledge data layer — the ONLY place that touches Prisma. Everything else
// (search, retriever, indexing, services, the analytics data source) goes
// through these functions. Server-only.
// ==========================================================================

import { prisma } from '@/lib/db';
import type {
  KnowledgeDocument,
  KnowledgeSource,
  KnowledgeCollection,
  KnowledgeSyncJob,
  Prisma,
} from '@prisma/client';
import type {
  KnowledgeDocumentDTO,
  KnowledgeSourceDTO,
  KnowledgeCollectionDTO,
  KnowledgeSyncJobDTO,
  KnowledgeStats,
  RawKnowledgeItem,
  SearchFilters,
  KnowledgeSourceType,
  KnowledgeSyncJobType,
} from '../types';
import { KNOWLEDGE_CONFIG } from '../config';
import { chunkText, contentHash, estimateTokens, makeExcerpt, toPlainText } from '../utils';

// ── Mappers ──────────────────────────────────────────────────
const iso = (d: Date | null) => (d ? d.toISOString() : null);

export function toDocumentDTO(d: KnowledgeDocument): KnowledgeDocumentDTO {
  return {
    id: d.id,
    sourceId: d.sourceId,
    collectionId: d.collectionId,
    entityType: d.entityType,
    entityId: d.entityId,
    externalKey: d.externalKey,
    title: d.title,
    content: d.content,
    excerpt: d.excerpt,
    url: d.url,
    language: d.language,
    chunkIndex: d.chunkIndex,
    tokenCount: d.tokenCount,
    status: d.status,
    embeddingStatus: d.embeddingStatus,
    version: d.version,
    metadata: (d.metadata as Record<string, unknown> | null) ?? null,
    indexedAt: iso(d.indexedAt),
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

export function toSourceDTO(s: KnowledgeSource): KnowledgeSourceDTO {
  return {
    id: s.id,
    key: s.key,
    name: s.name,
    type: s.type,
    description: s.description,
    enabled: s.enabled,
    documentCount: s.documentCount,
    lastSyncedAt: iso(s.lastSyncedAt),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export function toCollectionDTO(c: KnowledgeCollection): KnowledgeCollectionDTO {
  return {
    id: c.id,
    key: c.key,
    name: c.name,
    description: c.description,
    enabled: c.enabled,
    sortOrder: c.sortOrder,
    documentCount: c.documentCount,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export function toSyncJobDTO(j: KnowledgeSyncJob): KnowledgeSyncJobDTO {
  return {
    id: j.id,
    sourceId: j.sourceId,
    type: j.type,
    status: j.status,
    processed: j.processed,
    created: j.created,
    updated: j.updated,
    failed: j.failed,
    error: j.error,
    startedAt: iso(j.startedAt),
    finishedAt: iso(j.finishedAt),
    createdAt: j.createdAt.toISOString(),
  };
}

// ── Stats + breakdowns (admin dashboard) ─────────────────────
export async function getKnowledgeStats(): Promise<KnowledgeStats> {
  const [totalDocuments, totalSources, totalCollections, pending, stale, ready, runningJobs] =
    await Promise.all([
      prisma.knowledgeDocument.count({ where: { status: 'ACTIVE' } }),
      prisma.knowledgeSource.count(),
      prisma.knowledgeCollection.count(),
      prisma.knowledgeDocument.count({ where: { embeddingStatus: 'PENDING' } }),
      prisma.knowledgeDocument.count({ where: { embeddingStatus: 'STALE' } }),
      prisma.knowledgeDocument.count({ where: { embeddingStatus: 'READY' } }),
      prisma.knowledgeSyncJob.count({ where: { status: 'RUNNING' } }),
    ]);
  return {
    totalDocuments,
    totalSources,
    totalCollections,
    pendingEmbeddings: pending,
    staleEmbeddings: stale,
    readyEmbeddings: ready,
    runningJobs,
  };
}

export async function documentsByStatus(): Promise<{ label: string; value: number }[]> {
  const rows = await prisma.knowledgeDocument.groupBy({ by: ['status'], _count: { _all: true } });
  return rows.map((r) => ({ label: r.status, value: r._count._all }));
}

export async function documentsByEmbeddingStatus(): Promise<{ label: string; value: number }[]> {
  const rows = await prisma.knowledgeDocument.groupBy({
    by: ['embeddingStatus'],
    _count: { _all: true },
  });
  return rows.map((r) => ({ label: r.embeddingStatus, value: r._count._all }));
}

export async function documentsBySource(): Promise<{ label: string; value: number }[]> {
  const sources = await prisma.knowledgeSource.findMany({
    orderBy: { documentCount: 'desc' },
    take: 20,
    select: { name: true, documentCount: true },
  });
  return sources.map((s) => ({ label: s.name, value: s.documentCount }));
}

export async function documentsByCollection(): Promise<{ label: string; value: number }[]> {
  const collections = await prisma.knowledgeCollection.findMany({
    orderBy: { documentCount: 'desc' },
    take: 20,
    select: { name: true, documentCount: true },
  });
  return collections.map((c) => ({ label: c.name, value: c.documentCount }));
}

// ── Reads ────────────────────────────────────────────────────
export async function listSources(): Promise<KnowledgeSourceDTO[]> {
  const rows = await prisma.knowledgeSource.findMany({ orderBy: { name: 'asc' } });
  return rows.map(toSourceDTO);
}

export async function listCollections(): Promise<KnowledgeCollectionDTO[]> {
  const rows = await prisma.knowledgeCollection.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });
  return rows.map(toCollectionDTO);
}

export async function recentSyncJobs(limit = 20): Promise<KnowledgeSyncJobDTO[]> {
  const rows = await prisma.knowledgeSyncJob.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return rows.map(toSyncJobDTO);
}

export async function listDocuments(input: {
  page?: number;
  pageSize?: number;
  sourceKey?: string;
  collectionKey?: string;
  status?: KnowledgeDocumentDTO['status'];
  search?: string;
}): Promise<{ documents: KnowledgeDocumentDTO[]; total: number; page: number; pageSize: number }> {
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(KNOWLEDGE_CONFIG.maxPageSize, input.pageSize ?? KNOWLEDGE_CONFIG.pageSize);
  const where: Prisma.KnowledgeDocumentWhereInput = {
    status: input.status ?? undefined,
    source: input.sourceKey ? { key: input.sourceKey } : undefined,
    collection: input.collectionKey ? { key: input.collectionKey } : undefined,
    ...(input.search
      ? {
          OR: [
            { title: { contains: input.search, mode: 'insensitive' } },
            { content: { contains: input.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.knowledgeDocument.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.knowledgeDocument.count({ where }),
  ]);
  return { documents: rows.map(toDocumentDTO), total, page, pageSize };
}

// ── Keyword search (works today; the platform's baseline retrieval signal) ──
export async function keywordSearchDocuments(
  query: string,
  filters: SearchFilters | undefined,
  limit: number,
  offset: number,
): Promise<{ rows: KnowledgeDocumentDTO[]; total: number }> {
  const terms = query.split(/\s+/).filter(Boolean).slice(0, 8);
  const where: Prisma.KnowledgeDocumentWhereInput = {
    status: filters?.status ?? 'ACTIVE',
    language: filters?.language ?? undefined,
    entityType: filters?.entityTypes?.length ? { in: filters.entityTypes } : undefined,
    source: filters?.sourceKeys?.length ? { key: { in: filters.sourceKeys } } : undefined,
    collection: filters?.collectionKeys?.length ? { key: { in: filters.collectionKeys } } : undefined,
    AND: terms.map((t) => ({
      OR: [
        { title: { contains: t, mode: 'insensitive' as const } },
        { content: { contains: t, mode: 'insensitive' as const } },
      ],
    })),
  };
  const [rows, total] = await Promise.all([
    prisma.knowledgeDocument.findMany({ where, orderBy: { updatedAt: 'desc' }, take: limit, skip: offset }),
    prisma.knowledgeDocument.count({ where }),
  ]);
  return { rows: rows.map(toDocumentDTO), total };
}

// ── Mutations (indexer / services) ───────────────────────────
export async function upsertSource(meta: {
  key: string;
  name: string;
  type: KnowledgeSourceType;
  description?: string;
}): Promise<string> {
  const s = await prisma.knowledgeSource.upsert({
    where: { key: meta.key },
    update: { name: meta.name, type: meta.type, description: meta.description },
    create: { key: meta.key, name: meta.name, type: meta.type, description: meta.description },
    select: { id: true },
  });
  return s.id;
}

export async function upsertCollection(key: string, name: string): Promise<string> {
  const c = await prisma.knowledgeCollection.upsert({
    where: { key },
    update: { name },
    create: { key, name },
    select: { id: true },
  });
  return c.id;
}

/**
 * Upsert a raw item's chunks as KnowledgeDocument rows. Returns per-chunk
 * created/updated counts and the external keys touched. Marks embeddings STALE
 * when content changed (so a future re-index re-embeds only what moved).
 */
export async function upsertItemDocuments(
  sourceId: string,
  collectionId: string | null,
  item: RawKnowledgeItem,
): Promise<{ created: number; updated: number }> {
  const chunks = chunkText(item.content);
  let created = 0;
  let updated = 0;

  for (let i = 0; i < chunks.length; i++) {
    const text = chunks[i];
    const hash = contentHash(`${item.title}\n${text}`);
    const existing = await prisma.knowledgeDocument.findUnique({
      where: { sourceId_externalKey_chunkIndex: { sourceId, externalKey: item.externalKey, chunkIndex: i } },
      select: { id: true, contentHash: true },
    });

    const data = {
      collectionId,
      entityType: item.entityType,
      entityId: item.entityId ?? null,
      title: item.title,
      content: text,
      excerpt: item.excerpt ?? makeExcerpt(text),
      url: item.url ?? null,
      language: item.language ?? 'en',
      tokenCount: estimateTokens(text),
      contentHash: hash,
      metadata: (item.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      status: 'ACTIVE' as const,
      indexedAt: new Date(),
    };

    if (!existing) {
      await prisma.knowledgeDocument.create({
        data: { sourceId, externalKey: item.externalKey, chunkIndex: i, embeddingStatus: 'PENDING', ...data },
      });
      created++;
    } else {
      const changed = existing.contentHash !== hash;
      await prisma.knowledgeDocument.update({
        where: { id: existing.id },
        data: { ...data, ...(changed ? { embeddingStatus: 'STALE' } : {}) },
      });
      updated++;
    }
  }

  // Remove stale extra chunks if the content shrank.
  await prisma.knowledgeDocument.deleteMany({
    where: { sourceId, externalKey: item.externalKey, chunkIndex: { gte: chunks.length } },
  });

  return { created, updated };
}

/** After a FULL sync, drop documents whose externalKey no longer exists in the source. */
export async function pruneMissingDocuments(sourceId: string, keepKeys: string[]): Promise<number> {
  const { count } = await prisma.knowledgeDocument.deleteMany({
    where: { sourceId, externalKey: { notIn: keepKeys.length ? keepKeys : ['__none__'] } },
  });
  return count;
}

export async function refreshSourceCount(sourceId: string): Promise<void> {
  const count = await prisma.knowledgeDocument.count({ where: { sourceId, status: 'ACTIVE' } });
  await prisma.knowledgeSource.update({
    where: { id: sourceId },
    data: { documentCount: count, lastSyncedAt: new Date() },
  });
}

export async function refreshCollectionCounts(): Promise<void> {
  const collections = await prisma.knowledgeCollection.findMany({ select: { id: true } });
  for (const c of collections) {
    const count = await prisma.knowledgeDocument.count({
      where: { collectionId: c.id, status: 'ACTIVE' },
    });
    await prisma.knowledgeCollection.update({ where: { id: c.id }, data: { documentCount: count } });
  }
}

export async function createSyncJob(sourceId: string | null, type: KnowledgeSyncJobType): Promise<string> {
  const j = await prisma.knowledgeSyncJob.create({
    data: { sourceId, type, status: 'RUNNING', startedAt: new Date() },
    select: { id: true },
  });
  return j.id;
}

export async function finishSyncJob(
  jobId: string,
  result: { processed: number; created: number; updated: number; failed: number; error?: string },
): Promise<void> {
  await prisma.knowledgeSyncJob.update({
    where: { id: jobId },
    data: {
      status: result.error ? 'FAILED' : 'COMPLETED',
      processed: result.processed,
      created: result.created,
      updated: result.updated,
      failed: result.failed,
      error: result.error ?? null,
      finishedAt: new Date(),
    },
  });
}

/** Mark a source's documents STALE for a specific entity (auto-sync on CMS change). */
export async function markEntityStale(entityType: string, entityId: string): Promise<number> {
  const { count } = await prisma.knowledgeDocument.updateMany({
    where: { entityType, entityId, embeddingStatus: { not: 'DISABLED' } },
    data: { embeddingStatus: 'STALE' },
  });
  return count;
}

export { toPlainText };
