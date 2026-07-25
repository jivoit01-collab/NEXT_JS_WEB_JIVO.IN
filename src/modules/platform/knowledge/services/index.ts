import 'server-only';

// ==========================================================================
// Knowledge services — the orchestration facade. Actions call these; nothing
// here knows about any LLM. Also wires event-driven AUTO-SYNC: when a CMS entity
// changes, its documents are marked STALE (a future embedding pass re-indexes
// only what moved) — no manual work.
// ==========================================================================

import { platformEvents } from '@/modules/core/events';
import { search } from '../search';
import { retrieve } from '../retriever';
import { syncSource, syncAllSources } from '../indexing';
import { getKnowledgeStats, listSources, listCollections, recentSyncJobs, listDocuments, markEntityStale } from '../data';
import { isKnowledgeFeatureEnabled } from '../config';
import { searchQuerySchema, retrievalRequestSchema, syncSourceSchema, listDocumentsSchema } from '../validations';
import type { SearchQueryInput, RetrievalRequestInput, SyncSourceInput, ListDocumentsInput } from '../validations';

// ── Query facade ─────────────────────────────────────────────
export function searchKnowledge(input: SearchQueryInput) {
  return search(searchQuerySchema.parse(input));
}

export function retrieveKnowledge(input: RetrievalRequestInput) {
  return retrieve(retrievalRequestSchema.parse(input));
}

export function getDocuments(input: ListDocumentsInput) {
  return listDocuments(listDocumentsSchema.parse(input));
}

export { getKnowledgeStats, listSources, listCollections, recentSyncJobs };

// ── Sync facade ──────────────────────────────────────────────
export function runSourceSync(input: SyncSourceInput) {
  const { sourceKey, type } = syncSourceSchema.parse(input);
  return syncSource(sourceKey, type ?? 'INCREMENTAL');
}

export function runFullSync() {
  return syncAllSources('FULL');
}

// ── Auto-sync (event-driven) ─────────────────────────────────
/**
 * Business modules emit `content:changed` when a CMS entity is saved; the
 * knowledge base marks that entity's documents STALE so a future re-index picks
 * them up. Adding the emit is a one-liner in a CMS action — the platform never
 * imports the CMS. Subscribed once per process.
 */
const globalRef = globalThis as typeof globalThis & { __jivoKnowledgeAutoSync?: boolean };

export function initKnowledgeAutoSync(): void {
  if (globalRef.__jivoKnowledgeAutoSync) return;
  globalRef.__jivoKnowledgeAutoSync = true;
  if (!isKnowledgeFeatureEnabled('autoSync')) return;

  platformEvents.on('content:changed', (payload) => {
    const p = payload as { entityType?: string; entityId?: string } | undefined;
    if (!p?.entityType || !p?.entityId) return;
    // Fire-and-forget: never block the emitter.
    void markEntityStale(p.entityType, p.entityId).catch(() => {});
  });
}

// Wire it up on import (server side effect).
initKnowledgeAutoSync();
