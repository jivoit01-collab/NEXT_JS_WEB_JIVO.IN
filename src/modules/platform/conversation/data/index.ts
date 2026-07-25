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
