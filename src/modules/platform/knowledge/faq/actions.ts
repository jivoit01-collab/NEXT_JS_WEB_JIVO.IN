'use server';

// ==========================================================================
// Chatbot FAQ — admin CRUD for manually authored Q&A knowledge.
//
// FAQs are stored in the KnowledgeFaq table and indexed into the chatbot's
// knowledge via the `faqs` source adapter. On every write we AUTO-SYNC that one
// source, so a saved/edited/deleted FAQ reaches the chatbot immediately with no
// manual step. Admin-guarded — reuses the Auth Platform guard.
// ==========================================================================

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireAdminGuard } from '@/modules/core/shared';
import { getAiToggle, setAiToggle } from '@/modules/platform/gateway/feature/db-toggle';

export interface FaqDTO {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}

type Ok<T> = { success: true; data: T };
type Fail = { success: false; error: string };

function toDTO(f: {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}): FaqDTO {
  return {
    id: f.id,
    question: f.question,
    answer: f.answer,
    sortOrder: f.sortOrder,
    isActive: f.isActive,
  };
}

/** Re-index just the FAQ source so the chatbot picks up the change now. */
async function reindexFaqs(): Promise<void> {
  try {
    const { syncSource } = await import('../indexing');
    await syncSource('faqs', 'FULL');
  } catch (err) {
    // Never fail the save because indexing hiccuped — the FAQ is still stored,
    // and a later sync will pick it up.
    console.error('[faq] reindex failed', err);
  }
}

// ── Reads ────────────────────────────────────────────────────
export async function listFaqsAction(): Promise<Ok<FaqDTO[]> | Fail> {
  const guard = await requireAdminGuard();
  if (guard) return { success: false, error: 'Unauthorized' };
  try {
    const rows = await prisma.knowledgeFaq.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return { success: true, data: rows.map(toDTO) };
  } catch (err) {
    console.error('[listFaqsAction]', err);
    return { success: false, error: 'Failed to load FAQs' };
  }
}

// ── Writes ───────────────────────────────────────────────────
export async function createFaqAction(input: {
  question: string;
  answer: string;
}): Promise<Ok<FaqDTO> | Fail> {
  const guard = await requireAdminGuard();
  if (guard) return { success: false, error: 'Unauthorized' };

  const question = input.question?.trim() ?? '';
  const answer = input.answer?.trim() ?? '';
  if (!question || !answer) return { success: false, error: 'Question and answer are required' };

  try {
    const count = await prisma.knowledgeFaq.count();
    const row = await prisma.knowledgeFaq.create({
      data: { question, answer, sortOrder: count },
    });
    await reindexFaqs();
    revalidatePath('/jivo-dev/analytics/chatbot-faq');
    return { success: true, data: toDTO(row) };
  } catch (err) {
    console.error('[createFaqAction]', err);
    return { success: false, error: 'Failed to create FAQ' };
  }
}

export async function updateFaqAction(
  id: string,
  input: { question?: string; answer?: string; isActive?: boolean },
): Promise<Ok<FaqDTO> | Fail> {
  const guard = await requireAdminGuard();
  if (guard) return { success: false, error: 'Unauthorized' };

  try {
    const data: { question?: string; answer?: string; isActive?: boolean } = {};
    if (input.question !== undefined) {
      const q = input.question.trim();
      if (!q) return { success: false, error: 'Question cannot be empty' };
      data.question = q;
    }
    if (input.answer !== undefined) {
      const a = input.answer.trim();
      if (!a) return { success: false, error: 'Answer cannot be empty' };
      data.answer = a;
    }
    if (input.isActive !== undefined) data.isActive = input.isActive;

    const row = await prisma.knowledgeFaq.update({ where: { id }, data });
    await reindexFaqs();
    revalidatePath('/jivo-dev/analytics/chatbot-faq');
    return { success: true, data: toDTO(row) };
  } catch (err) {
    console.error('[updateFaqAction]', err);
    return { success: false, error: 'Failed to update FAQ' };
  }
}

export async function deleteFaqAction(id: string): Promise<Ok<null> | Fail> {
  const guard = await requireAdminGuard();
  if (guard) return { success: false, error: 'Unauthorized' };
  try {
    await prisma.knowledgeFaq.delete({ where: { id } });
    await reindexFaqs();
    revalidatePath('/jivo-dev/analytics/chatbot-faq');
    return { success: true, data: null };
  } catch (err) {
    console.error('[deleteFaqAction]', err);
    return { success: false, error: 'Failed to delete FAQ' };
  }
}

// ── Knowledge sync (run from the admin, no CLI) ──────────────
export async function syncKnowledgeAction(
  mode: 'full' | 'incremental',
): Promise<Ok<{ created: number; updated: number; failed: number }> | Fail> {
  const guard = await requireAdminGuard();
  if (guard) return { success: false, error: 'Unauthorized' };
  try {
    // Equivalent to `npm run knowledge:sync [-- --full]`, but in-process.
    const { syncAllSources } = await import('../indexing');
    const results = await syncAllSources(mode === 'full' ? 'FULL' : 'INCREMENTAL');
    const totals = results.reduce(
      (acc, r) => ({
        created: acc.created + r.created,
        updated: acc.updated + r.updated,
        failed: acc.failed + r.failed,
      }),
      { created: 0, updated: 0, failed: 0 },
    );
    return { success: true, data: totals };
  } catch (err) {
    console.error('[syncKnowledgeAction]', err);
    return { success: false, error: 'Knowledge sync failed' };
  }
}

// ── Chatbot master switch (DB-backed, no redeploy) ───────────
export async function getChatbotStatusAction(): Promise<Ok<{ override: boolean | null }> | Fail> {
  const guard = await requireAdminGuard();
  if (guard) return { success: false, error: 'Unauthorized' };
  try {
    return { success: true, data: { override: await getAiToggle() } };
  } catch (err) {
    console.error('[getChatbotStatusAction]', err);
    return { success: false, error: 'Failed to read chatbot status' };
  }
}

/** Set the chatbot on/off override. `null` clears it (follow the env flag). */
export async function setChatbotEnabledAction(
  enabled: boolean | null,
): Promise<Ok<{ override: boolean | null }> | Fail> {
  const guard = await requireAdminGuard();
  if (guard) return { success: false, error: 'Unauthorized' };
  try {
    await setAiToggle(enabled);
    revalidatePath('/jivo-dev/analytics/chatbot-faq');
    // Re-render the public layout so the chat widget appears/disappears at once.
    revalidatePath('/', 'layout');
    return { success: true, data: { override: enabled } };
  } catch (err) {
    console.error('[setChatbotEnabledAction]', err);
    return { success: false, error: 'Failed to update chatbot status' };
  }
}
