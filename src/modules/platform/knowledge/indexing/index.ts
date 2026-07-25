import 'server-only';

// ==========================================================================
// Indexer — runs a source's sync: fetch items → upsert documents → prune →
// refresh counts → record a KnowledgeSyncJob → publish events. Content changes
// mark embeddings STALE; a future embedding phase re-embeds only what moved.
// No blocking work leaks to the request path — callers run this in an action /
// (future) background worker.
// ==========================================================================

import { platformEvents } from '@/modules/core/events';
import {
  upsertSource,
  upsertCollection,
  upsertItemDocuments,
  pruneMissingDocuments,
  refreshSourceCount,
  refreshCollectionCounts,
  createSyncJob,
  finishSyncJob,
} from '../data';
import { getSourceAdapter } from './sources';
import { humanizeEnum } from '../utils';
import { KNOWLEDGE_EVENTS, type KnowledgeSyncJobType } from '../types';

export * from './sources';

export interface SyncResult {
  jobId: string;
  sourceKey: string;
  processed: number;
  created: number;
  updated: number;
  failed: number;
  pruned: number;
  error?: string;
}

/** Sync ONE source into the knowledge base. Reusable for every adapter. */
export async function syncSource(
  sourceKey: string,
  type: KnowledgeSyncJobType = 'INCREMENTAL',
): Promise<SyncResult> {
  const adapter = getSourceAdapter(sourceKey);
  if (!adapter) throw new Error(`[knowledge] unknown source "${sourceKey}"`);

  const sourceId = await upsertSource({
    key: adapter.key,
    name: adapter.name,
    type: adapter.type,
  });
  const jobId = await createSyncJob(sourceId, type);
  platformEvents.emit(KNOWLEDGE_EVENTS.SYNC_STARTED, { sourceKey, type, jobId });

  let processed = 0;
  let created = 0;
  let updated = 0;
  let failed = 0;
  let pruned = 0;
  let error: string | undefined;

  try {
    const items = await adapter.fetchItems();

    // Ensure every referenced collection exists once, up front.
    const collectionKeys = new Set(
      items.map((i) => i.collectionKey ?? adapter.defaultCollectionKey).filter(Boolean) as string[],
    );
    const collectionIds = new Map<string, string>();
    for (const key of collectionKeys) {
      collectionIds.set(key, await upsertCollection(key, humanizeEnum(key.replace(/-/g, '_'))));
    }

    for (const item of items) {
      try {
        const collKey = item.collectionKey ?? adapter.defaultCollectionKey;
        const collectionId = collKey ? (collectionIds.get(collKey) ?? null) : null;
        const r = await upsertItemDocuments(sourceId, collectionId, item);
        created += r.created;
        updated += r.updated;
        processed++;
        platformEvents.emit(KNOWLEDGE_EVENTS.DOCUMENT_INDEXED, {
          sourceKey,
          externalKey: item.externalKey,
        });
      } catch {
        failed++;
      }
    }

    if (type === 'FULL' || type === 'REINDEX') {
      pruned = await pruneMissingDocuments(
        sourceId,
        items.map((i) => i.externalKey),
      );
    }

    await refreshSourceCount(sourceId);
    await refreshCollectionCounts();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
    failed++;
  }

  await finishSyncJob(jobId, { processed, created, updated, failed, error });
  platformEvents.emit(KNOWLEDGE_EVENTS.SYNC_COMPLETED, {
    sourceKey,
    jobId,
    processed,
    created,
    updated,
    failed,
    error,
  });

  return { jobId, sourceKey, processed, created, updated, failed, pruned, error };
}

/** Sync every registered source (used by a scheduled full re-index). */
export async function syncAllSources(type: KnowledgeSyncJobType = 'INCREMENTAL'): Promise<SyncResult[]> {
  const { getSourceAdapters } = await import('./sources');
  const results: SyncResult[] = [];
  for (const adapter of getSourceAdapters()) {
    results.push(await syncSource(adapter.key, type));
  }
  return results;
}
