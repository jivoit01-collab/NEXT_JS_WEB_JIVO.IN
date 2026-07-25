'use server';

// ==========================================================================
// Knowledge server actions — admin-guarded. The admin dashboard + (future) AI
// tools call these. Reuses the Auth Platform guard; never exposes writes/sync to
// non-admins.
// ==========================================================================

import { requireAdminGuard } from '@/modules/core/shared';
import {
  searchKnowledge,
  retrieveKnowledge,
  getDocuments,
  getKnowledgeStats,
  listSources,
  listCollections,
  recentSyncJobs,
  runSourceSync,
} from '../services';
import type { SearchQueryInput, RetrievalRequestInput, SyncSourceInput, ListDocumentsInput } from '../validations';

type Ok<T> = { success: true; data: T };
type Fail = { success: false; error: string };

export async function searchKnowledgeAction(input: SearchQueryInput) {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  try {
    return { success: true, data: await searchKnowledge(input) } satisfies Ok<
      Awaited<ReturnType<typeof searchKnowledge>>
    >;
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Search failed' } satisfies Fail;
  }
}

export async function retrieveKnowledgeAction(input: RetrievalRequestInput) {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  try {
    return { success: true, data: await retrieveKnowledge(input) };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Retrieval failed' } satisfies Fail;
  }
}

export async function listDocumentsAction(input: ListDocumentsInput) {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  return { success: true, data: await getDocuments(input) };
}

export async function knowledgeStatsAction() {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  return { success: true, data: await getKnowledgeStats() };
}

export async function listSourcesAction() {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  return { success: true, data: await listSources() };
}

export async function listCollectionsAction() {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  return { success: true, data: await listCollections() };
}

export async function listSyncJobsAction() {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  return { success: true, data: await recentSyncJobs() };
}

export async function syncSourceAction(input: SyncSourceInput) {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  try {
    return { success: true, data: await runSourceSync(input) };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Sync failed' } satisfies Fail;
  }
}
