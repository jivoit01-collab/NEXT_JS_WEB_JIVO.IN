import 'server-only';

// ==========================================================================
// Conversation retention — deletes RAW chat data on a schedule.
//
// Raw conversations are personal data with short operational value: after a week
// nobody re-reads a support chat, but keeping it indefinitely grows the database
// and the privacy surface. Aggregated analytics are NOT touched — `AIExecution`
// holds `conversationId` as a soft reference with no foreign key, so historical
// metrics (counts, tokens, response times, intents) survive deletion intact.
//
// Deletion relies on the CASCADES already declared in the schema:
//   Conversation → ConversationMessage | ConversationMemory | ConversationState
// all use `onDelete: Cascade`, so removing the parent removes its dependents in
// the correct order inside the database.
//
// Work is batched, idempotent, and reports counts — a partial run simply deletes
// fewer rows and the next run finishes the job.
// ==========================================================================

import { prisma } from '@/lib/db';
import { backfillConversationTitles } from '../data';
import { platformEvents } from '@/modules/core/events';

/** Days of raw conversation history to keep. Configurable per environment. */
export const CHAT_RETENTION_DAYS = Math.max(
  1,
  Number(process.env.CHAT_RETENTION_DAYS ?? 7) || 7,
);

/** Rows deleted per batch — small enough to avoid long locks. */
const BATCH_SIZE = Math.max(50, Number(process.env.CHAT_CLEANUP_BATCH ?? 200) || 200);

/** Safety cap so a single run can never spin indefinitely. */
const MAX_BATCHES = 100;

export interface CleanupResult {
  /** Conversations past the retention window. */
  expired: number;
  /** Conversations that never received a USER message. */
  empty: number;
  /** ConversationState/Memory rows whose conversation no longer exists. */
  orphans: number;
  /** Placeholder titles replaced with the first user question. */
  titlesFixed: number;
  /** True when the run stopped early (batch cap or error). */
  incomplete: boolean;
  error?: string;
}

/** Delete in batches of ids, so no single statement locks the table for long. */
async function deleteConversations(ids: string[]): Promise<number> {
  let removed = 0;
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const slice = ids.slice(i, i + BATCH_SIZE);
    const { count } = await prisma.conversation.deleteMany({ where: { id: { in: slice } } });
    removed += count;
  }
  return removed;
}

/**
 * Conversations older than the retention window.
 *
 * Age is measured from the LAST activity (`lastMessageAt`), falling back to
 * `createdAt` for conversations that never got a message — so an old but still
 * active chat is never removed just because it started long ago.
 */
async function findExpired(cutoff: Date, take: number): Promise<string[]> {
  const rows = await prisma.conversation.findMany({
    where: {
      OR: [
        { lastMessageAt: { lt: cutoff } },
        { lastMessageAt: null, createdAt: { lt: cutoff } },
      ],
    },
    select: { id: true },
    take,
  });
  return rows.map((r) => r.id);
}

/**
 * Conversations with no USER message.
 *
 * A conversation row is created the moment the widget opens, so a visitor who
 * never typed leaves an empty shell. Those are not real chats and are removed
 * regardless of age — but only once they are a few minutes old, so a session
 * being typed into right now is never swept away.
 */
async function findEmpty(take: number): Promise<string[]> {
  const graceCutoff = new Date(Date.now() - 15 * 60_000);
  const rows = await prisma.conversation.findMany({
    where: {
      createdAt: { lt: graceCutoff },
      messages: { none: { role: 'USER' } },
    },
    select: { id: true },
    take,
  });
  return rows.map((r) => r.id);
}

/**
 * Run the cleanup. Safe to call repeatedly; never throws.
 *
 * Errors are caught and reported rather than propagated, so a scheduled run that
 * fails midway logs the problem and leaves the database consistent — the next
 * run picks up where it left off.
 */
export async function cleanupConversations(
  retentionDays: number = CHAT_RETENTION_DAYS,
): Promise<CleanupResult> {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const result: CleanupResult = { expired: 0, empty: 0, orphans: 0, titlesFixed: 0, incomplete: false };

  try {
    // 1) Expired conversations, batch by batch until none remain.
    for (let batch = 0; batch < MAX_BATCHES; batch += 1) {
      const ids = await findExpired(cutoff, BATCH_SIZE);
      if (ids.length === 0) break;
      result.expired += await deleteConversations(ids);
      if (batch === MAX_BATCHES - 1) result.incomplete = true;
    }

    // 2) Empty shells (no USER message).
    for (let batch = 0; batch < MAX_BATCHES; batch += 1) {
      const ids = await findEmpty(BATCH_SIZE);
      if (ids.length === 0) break;
      result.empty += await deleteConversations(ids);
      if (batch === MAX_BATCHES - 1) result.incomplete = true;
    }

    // 3) Orphaned dependents. Cascades make these unlikely, but a historical
    //    import or a manual delete can leave them behind.
    const orphanState = await prisma.$executeRaw`
      DELETE FROM "ConversationState" s
      WHERE NOT EXISTS (SELECT 1 FROM "Conversation" c WHERE c.id = s."conversationId")
    `;
    const orphanMemory = await prisma.$executeRaw`
      DELETE FROM "ConversationMemory" m
      WHERE NOT EXISTS (SELECT 1 FROM "Conversation" c WHERE c.id = m."conversationId")
    `;
    result.orphans = Number(orphanState) + Number(orphanMemory);

    // 4) Repair legacy "Chat" placeholder titles so the admin list is readable.
    result.titlesFixed = await backfillConversationTitles();
  } catch (e) {
    result.incomplete = true;
    result.error = e instanceof Error ? e.message : String(e);
  }

  platformEvents.emit('conversation:cleanup_completed', { ...result, retentionDays });
  return result;
}
