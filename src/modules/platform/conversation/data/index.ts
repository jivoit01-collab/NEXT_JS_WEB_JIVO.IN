import 'server-only';

// ==========================================================================
// Conversation data layer — the ONLY place that touches Prisma. State-first:
// the live state is a single small row read directly; messages are cursor-
// paginated and never fully rebuilt. Server-only.
// ==========================================================================

import { prisma } from '@/lib/db';
import type {
  Conversation,
  ConversationState,
  ConversationMessage,
  ConversationMemory,
  Prisma,
} from '@prisma/client';
import type {
  ConversationDTO,
  ConversationStateDTO,
  ConversationMessageDTO,
  ConversationMemoryDTO,
  ConversationStats,
  StartConversationInput,
  AppendMessageInput,
  StateUpdate,
  MemoryInput,
  MessagePage,
} from '../types';
import { CONVERSATION_CONFIG } from '../config';
import { deriveTitle, estimateTokens, encodeCursor, decodeCursor, scoreImportance } from '../utils';

// ── Mappers ──────────────────────────────────────────────────
const iso = (d: Date | null) => (d ? d.toISOString() : null);

export function toConversationDTO(c: Conversation): ConversationDTO {
  return {
    id: c.id,
    visitorId: c.visitorId,
    userId: c.userId,
    sessionId: c.sessionId,
    title: c.title,
    language: c.language,
    status: c.status,
    startedAt: c.startedAt.toISOString(),
    endedAt: iso(c.endedAt),
    lastMessageAt: iso(c.lastMessageAt),
    messageCount: c.messageCount,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export function toStateDTO(s: ConversationState): ConversationStateDTO {
  return {
    conversationId: s.conversationId,
    currentIntent: s.currentIntent,
    currentTopic: s.currentTopic,
    summary: s.summary,
    lastMessageId: s.lastMessageId,
    contextVersion: s.contextVersion,
    knowledgeVersion: s.knowledgeVersion,
    estimatedTokens: s.estimatedTokens,
    streamingEnabled: s.streamingEnabled,
    modelProvider: s.modelProvider,
    temperature: s.temperature,
    updatedAt: s.updatedAt.toISOString(),
  };
}

export function toMessageDTO(m: ConversationMessage): ConversationMessageDTO {
  return {
    id: m.id,
    conversationId: m.conversationId,
    role: m.role,
    content: m.content,
    messageType: m.messageType,
    tokens: m.tokens,
    responseTime: m.responseTime,
    confidence: m.confidence,
    feedbackId: m.feedbackId,
    metadata: (m.metadata as Record<string, unknown> | null) ?? null,
    createdAt: m.createdAt.toISOString(),
  };
}

export function toMemoryDTO(m: ConversationMemory): ConversationMemoryDTO {
  return {
    id: m.id,
    conversationId: m.conversationId,
    type: m.type,
    key: m.key,
    value: m.value,
    importance: m.importance,
    expiresAt: iso(m.expiresAt),
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  };
}

// ── Lifecycle mutations ──────────────────────────────────────
export async function createConversation(input: StartConversationInput): Promise<ConversationDTO> {
  const c = await prisma.conversation.create({
    data: {
      visitorId: input.visitorId ?? null,
      userId: input.userId ?? null,
      sessionId: input.sessionId ?? null,
      title: input.title ?? null,
      language: input.language ?? 'en',
      // One state row per conversation, created up front (state-first).
      state: {
        create: {
          modelProvider: input.modelProvider ?? null,
          temperature: CONVERSATION_CONFIG.defaultTemperature,
        },
      },
    },
  });
  return toConversationDTO(c);
}

export async function appendMessage(input: AppendMessageInput): Promise<ConversationMessageDTO> {
  const tokens = input.tokens ?? estimateTokens(input.content);
  const message = await prisma.$transaction(async (tx) => {
    const m = await tx.conversationMessage.create({
      data: {
        conversationId: input.conversationId,
        role: input.role,
        content: input.content,
        messageType: input.messageType ?? 'TEXT',
        tokens,
        responseTime: input.responseTime ?? null,
        confidence: input.confidence ?? null,
        metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
    await tx.conversation.update({
      where: { id: input.conversationId },
      data: { messageCount: { increment: 1 }, lastMessageAt: m.createdAt, status: 'ACTIVE' },
    });
    // State-first: patch only the moving fields; never rebuild the conversation.
    await tx.conversationState.update({
      where: { conversationId: input.conversationId },
      data: { lastMessageId: m.id, estimatedTokens: { increment: tokens } },
    });
    // Auto-title from the first user message if none set.
    if (input.role === 'USER') {
      const conv = await tx.conversation.findUnique({
        where: { id: input.conversationId },
        select: { title: true },
      });
      if (conv && !conv.title) {
        await tx.conversation.update({
          where: { id: input.conversationId },
          data: { title: deriveTitle(input.content) },
        });
      }
    }
    return m;
  });
  return toMessageDTO(message);
}

export async function patchState(
  conversationId: string,
  patch: StateUpdate,
): Promise<ConversationStateDTO> {
  const s = await prisma.conversationState.update({
    where: { conversationId },
    data: patch,
  });
  return toStateDTO(s);
}

export async function endConversation(conversationId: string): Promise<void> {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: 'ENDED', endedAt: new Date() },
  });
}

export async function linkMessageFeedback(messageId: string, feedbackId: string): Promise<void> {
  await prisma.conversationMessage.update({ where: { id: messageId }, data: { feedbackId } });
}

// ── Memory mutations ─────────────────────────────────────────
export async function upsertMemory(input: MemoryInput): Promise<ConversationMemoryDTO> {
  const importance = input.importance ?? scoreImportance(input.type);
  const expiresAt =
    input.type === 'TEMPORARY'
      ? new Date(Date.now() + (input.ttlMs ?? CONVERSATION_CONFIG.temporaryMemoryTtlMs))
      : (input.ttlMs ? new Date(Date.now() + input.ttlMs) : null);

  const m = await prisma.conversationMemory.upsert({
    where: {
      conversationId_type_key: {
        conversationId: input.conversationId,
        type: input.type,
        key: input.key,
      },
    },
    update: { value: input.value, importance, expiresAt },
    create: {
      conversationId: input.conversationId,
      type: input.type,
      key: input.key,
      value: input.value,
      importance,
      expiresAt,
    },
  });
  return toMemoryDTO(m);
}

export async function expireMemory(): Promise<number> {
  const { count } = await prisma.conversationMemory.deleteMany({
    where: { expiresAt: { not: null, lt: new Date() } },
  });
  return count;
}

// ── Reads (state-first, cursor-paginated) ────────────────────
export async function getConversation(id: string): Promise<ConversationDTO | null> {
  const c = await prisma.conversation.findUnique({ where: { id } });
  return c ? toConversationDTO(c) : null;
}

/**
 * The most recent non-ended conversation for an anonymous visitor. Read-only —
 * lets a caller REUSE a visitor's single conversation instead of creating a new
 * one each visit (reduces duplicate conversations / DB growth). Additive.
 */
export async function findLatestConversationByVisitor(visitorId: string): Promise<ConversationDTO | null> {
  const c = await prisma.conversation.findFirst({
    where: { visitorId, status: { not: 'ENDED' } },
    orderBy: { updatedAt: 'desc' },
  });
  return c ? toConversationDTO(c) : null;
}

/** The single source of truth read — one small row, no message scan. */
export async function getState(conversationId: string): Promise<ConversationStateDTO | null> {
  const s = await prisma.conversationState.findUnique({ where: { conversationId } });
  return s ? toStateDTO(s) : null;
}

export async function getMessages(
  conversationId: string,
  cursor?: string,
  pageSize: number = CONVERSATION_CONFIG.messagePageSize,
): Promise<MessagePage> {
  const take = Math.min(pageSize, CONVERSATION_CONFIG.maxMessagePageSize);
  const c = cursor ? decodeCursor(cursor) : null;
  const where: Prisma.ConversationMessageWhereInput = {
    conversationId,
    ...(c
      ? {
          OR: [
            { createdAt: { lt: new Date(c.createdAt) } },
            { createdAt: new Date(c.createdAt), id: { lt: c.id } },
          ],
        }
      : {}),
  };
  const rows = await prisma.conversationMessage.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: take + 1,
  });
  const hasMore = rows.length > take;
  const page = hasMore ? rows.slice(0, take) : rows;
  const last = page[page.length - 1];
  return {
    messages: page.map(toMessageDTO),
    nextCursor: hasMore && last ? encodeCursor(last.createdAt.toISOString(), last.id) : null,
    hasMore,
  };
}

/** Relevant memory: non-expired, top-N by importance. */
export async function getRelevantMemory(conversationId: string): Promise<ConversationMemoryDTO[]> {
  const rows = await prisma.conversationMemory.findMany({
    where: { conversationId, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    orderBy: { importance: 'desc' },
    take: CONVERSATION_CONFIG.memoryTopK,
  });
  return rows.map(toMemoryDTO);
}

// ── Admin stats / breakdowns (dashboard) ─────────────────────
export async function getConversationStats(): Promise<ConversationStats> {
  const [total, active, ended, totalMessages, totalMemories] = await Promise.all([
    prisma.conversation.count(),
    prisma.conversation.count({ where: { status: 'ACTIVE' } }),
    prisma.conversation.count({ where: { status: 'ENDED' } }),
    prisma.conversationMessage.count(),
    prisma.conversationMemory.count(),
  ]);
  return {
    totalConversations: total,
    activeConversations: active,
    endedConversations: ended,
    totalMessages,
    totalMemories,
    avgMessagesPerConversation: total ? Math.round((totalMessages / total) * 10) / 10 : 0,
  };
}

export async function conversationsByStatus(): Promise<{ label: string; value: number }[]> {
  const rows = await prisma.conversation.groupBy({ by: ['status'], _count: { _all: true } });
  return rows.map((r) => ({ label: r.status, value: r._count._all }));
}

export async function messagesByRole(): Promise<{ label: string; value: number }[]> {
  const rows = await prisma.conversationMessage.groupBy({ by: ['role'], _count: { _all: true } });
  return rows.map((r) => ({ label: r.role, value: r._count._all }));
}

export async function memoriesByType(): Promise<{ label: string; value: number }[]> {
  const rows = await prisma.conversationMemory.groupBy({ by: ['type'], _count: { _all: true } });
  return rows.map((r) => ({ label: r.type, value: r._count._all }));
}

export async function recentConversations(limit = 8): Promise<ConversationDTO[]> {
  const rows = await prisma.conversation.findMany({ orderBy: { lastMessageAt: 'desc' }, take: limit });
  return rows.map(toConversationDTO);
}

/**
 * Replace placeholder titles with the conversation's FIRST user question.
 *
 * Older conversations were created with a literal "Chat" title, which blocked
 * the auto-titling in `appendMessage` (it only fills an empty title) and left
 * the admin list unreadable. This repairs them in ONE statement — the update is
 * driven by a correlated sub-select, so no rows are pulled into memory.
 *
 * Idempotent: only rows still holding a placeholder are touched.
 */
export async function backfillConversationTitles(): Promise<number> {
  const updated = await prisma.$executeRaw`
    UPDATE "Conversation" c
    SET title = sub.title
    FROM (
      SELECT DISTINCT ON (m."conversationId")
        m."conversationId" AS id,
        left(regexp_replace(btrim(m.content), '\\s+', ' ', 'g'), 60) AS title
      FROM "ConversationMessage" m
      WHERE m.role = 'USER' AND length(btrim(m.content)) > 0
      ORDER BY m."conversationId", m."createdAt" ASC
    ) sub
    WHERE c.id = sub.id
      AND (c.title IS NULL OR c.title = '' OR c.title = 'Chat')
  `;
  return Number(updated);
}

export interface AskedQuestion {
  question: string;
  count: number;
  lastAskedAt: string;
}

/**
 * The most frequently asked USER questions.
 *
 * Grouped and counted BY THE DATABASE — the dashboard never loads messages into
 * memory to tally them. Normalisation happens inside the query:
 *
 *   lower(btrim(content))            → case/whitespace differences collapse
 *   regexp_replace(…, '\s+', ' ')    → internal runs of spaces collapse
 *   regexp_replace(…, '[?!.]+$', '') → trailing punctuation collapses
 *
 * That is deliberately conservative: it merges obvious duplicates ("Tell me
 * about Canola Oil" / "tell me about canola oil?") while leaving genuinely
 * different wording — and therefore different intent — as separate rows.
 *
 * `MIN(content)` returns a representative original spelling so the dashboard
 * shows a readable question rather than the normalised key.
 *
 * Only USER messages are counted, and only those whose conversation still
 * exists (the join excludes orphans; retention cleanup removes the rest).
 */
export async function mostAskedQuestions(limit = 10, offset = 0): Promise<AskedQuestion[]> {
  const take = Math.min(50, Math.max(1, limit));
  const skip = Math.max(0, offset);

  const rows = await prisma.$queryRaw<{ question: string; count: bigint; last_asked: Date }[]>`
    SELECT
      MIN(m.content)                         AS question,
      COUNT(*)                               AS count,
      MAX(m."createdAt")                     AS last_asked
    FROM "ConversationMessage" m
    JOIN "Conversation" c ON c.id = m."conversationId"
    WHERE m.role = 'USER'
      AND length(btrim(m.content)) BETWEEN 3 AND 300
    GROUP BY regexp_replace(
               regexp_replace(lower(btrim(m.content)), '\\s+', ' ', 'g'),
               '[?!.]+$', '', 'g'
             )
    ORDER BY count DESC, last_asked DESC
    LIMIT ${take} OFFSET ${skip}
  `;

  return rows.map((r) => ({
    question: r.question,
    count: Number(r.count),
    lastAskedAt: r.last_asked.toISOString(),
  }));
}
