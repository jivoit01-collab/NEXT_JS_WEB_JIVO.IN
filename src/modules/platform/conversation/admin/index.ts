import 'server-only';

// ==========================================================================
// Admin conversation queries — the read model behind the AI dashboard's
// Conversations page and detail view.
//
// PERFORMANCE RULES (why the queries look like this):
//  • KPIs use `count` / `aggregate`, never a scan of every message row.
//  • The list reads Conversation rows only — `messageCount` is denormalised on
//    the conversation, so no per-row message query is needed.
//  • Messages are loaded ONLY when an admin opens one conversation, through the
//    existing cursor pagination (`getMessages`).
//  • All filters run on indexed columns: `lastMessageAt`, `status`, `visitorId`.
//
// Nothing here duplicates the analytics platform; it reads the same tables.
// ==========================================================================

import { prisma } from '@/lib/db';
import type { Prisma, ConversationStatus } from '@prisma/client';

export interface ConversationKpis {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  avgMessagesPerConversation: number;
  /** Mean minutes between first and last message. */
  avgDurationMinutes: number;
}

/** Dashboard KPIs — counts and aggregates only. */
export async function getConversationKpis(): Promise<ConversationKpis> {
  const [total, active, messages, userMsgs, assistantMsgs, durations] = await Promise.all([
    prisma.conversation.count(),
    prisma.conversation.count({ where: { status: 'ACTIVE' } }),
    prisma.conversationMessage.count(),
    prisma.conversationMessage.count({ where: { role: 'USER' } }),
    prisma.conversationMessage.count({ where: { role: 'ASSISTANT' } }),
    // Only the two timestamps are read, not the messages themselves.
    prisma.conversation.findMany({
      where: { lastMessageAt: { not: null } },
      select: { startedAt: true, lastMessageAt: true },
      take: 500,
      orderBy: { lastMessageAt: 'desc' },
    }),
  ]);

  const durationMs = durations.reduce(
    (sum, c) => sum + Math.max(0, (c.lastMessageAt!.getTime() - c.startedAt.getTime())),
    0,
  );

  return {
    totalConversations: total,
    activeConversations: active,
    totalMessages: messages,
    userMessages: userMsgs,
    assistantMessages: assistantMsgs,
    avgMessagesPerConversation: total ? Math.round((messages / total) * 10) / 10 : 0,
    avgDurationMinutes: durations.length
      ? Math.round(durationMs / durations.length / 60000)
      : 0,
  };
}

export interface ConversationListItem {
  id: string;
  /** Shortened visitor reference — never the full identifier. */
  visitorRef: string | null;
  title: string | null;
  messageCount: number;
  startedAt: string;
  lastMessageAt: string | null;
  durationMinutes: number;
  language: string;
  status: ConversationStatus;
}

export interface ConversationListQuery {
  page?: number;
  pageSize?: number;
  /** Matches the conversation title / first question. */
  search?: string;
  status?: ConversationStatus;
  /** ISO dates bounding `lastMessageAt`. */
  from?: string;
  to?: string;
}

/**
 * Paginated conversation list, newest activity first.
 *
 * Reads Conversation rows only — `messageCount` is already denormalised, so the
 * list never touches ConversationMessage.
 */
export async function listConversations(q: ConversationListQuery = {}): Promise<{
  items: ConversationListItem[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = Math.max(1, q.page ?? 1);
  // Capped at 100 so one request can never pull an unbounded page.
  const pageSize = Math.min(100, Math.max(1, q.pageSize ?? 25));

  const where: Prisma.ConversationWhereInput = {
    ...(q.status ? { status: q.status } : {}),
    ...(q.search
      ? {
          OR: [
            { title: { contains: q.search, mode: 'insensitive' } },
            { id: { contains: q.search } },
          ],
        }
      : {}),
    ...(q.from || q.to
      ? {
          lastMessageAt: {
            ...(q.from ? { gte: new Date(q.from) } : {}),
            ...(q.to ? { lte: new Date(q.to) } : {}),
          },
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      // `lastMessageAt` is indexed; nulls (never-messaged) sort last.
      orderBy: [{ lastMessageAt: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        visitorId: true,
        title: true,
        messageCount: true,
        startedAt: true,
        lastMessageAt: true,
        language: true,
        status: true,
      },
    }),
    prisma.conversation.count({ where }),
  ]);

  return {
    items: rows.map((r) => ({
      id: r.id,
      // Only a short suffix — enough to correlate sessions, not to identify.
      visitorRef: r.visitorId ? `…${r.visitorId.slice(-6)}` : null,
      title: r.title,
      messageCount: r.messageCount,
      startedAt: r.startedAt.toISOString(),
      lastMessageAt: r.lastMessageAt?.toISOString() ?? null,
      durationMinutes: r.lastMessageAt
        ? Math.max(0, Math.round((r.lastMessageAt.getTime() - r.startedAt.getTime()) / 60000))
        : 0,
      language: r.language,
      status: r.status,
    })),
    total,
    page,
    pageSize,
  };
}

export interface ConversationDetail {
  header: ConversationListItem;
  /** Conversation state — the detected topic/language the pipeline stored. */
  meta: { currentTopic: string | null; currentIntent: string | null; estimatedTokens: number };
  /** Observability metrics, if recorded for this conversation. */
  performance: { executions: number; avgResponseMs: number; totalTokens: number } | null;
}

/**
 * Header + metadata for ONE conversation. Messages are deliberately NOT included
 * — the caller loads them separately through cursor pagination, so opening a
 * long conversation never pulls its whole history at once.
 *
 * Only operational metadata is exposed. No credentials, keys or internal
 * configuration are read here or returned.
 */
export async function getConversationDetail(id: string): Promise<ConversationDetail | null> {
  const [row, state, exec] = await Promise.all([
    prisma.conversation.findUnique({
      where: { id },
      select: {
        id: true,
        visitorId: true,
        title: true,
        messageCount: true,
        startedAt: true,
        lastMessageAt: true,
        language: true,
        status: true,
      },
    }),
    prisma.conversationState.findUnique({
      where: { conversationId: id },
      select: { currentTopic: true, currentIntent: true, estimatedTokens: true },
    }),
    // Aggregate, not a row scan.
    prisma.aIExecution.aggregate({
      where: { conversationId: id },
      _count: { _all: true },
      _avg: { responseTimeMs: true },
      _sum: { totalTokens: true },
    }),
  ]);

  if (!row) return null;

  return {
    header: {
      id: row.id,
      visitorRef: row.visitorId ? `…${row.visitorId.slice(-6)}` : null,
      title: row.title,
      messageCount: row.messageCount,
      startedAt: row.startedAt.toISOString(),
      lastMessageAt: row.lastMessageAt?.toISOString() ?? null,
      durationMinutes: row.lastMessageAt
        ? Math.max(0, Math.round((row.lastMessageAt.getTime() - row.startedAt.getTime()) / 60000))
        : 0,
      language: row.language,
      status: row.status,
    },
    meta: {
      currentTopic: state?.currentTopic ?? null,
      currentIntent: state?.currentIntent ?? null,
      estimatedTokens: state?.estimatedTokens ?? 0,
    },
    performance: exec._count._all
      ? {
          executions: exec._count._all,
          avgResponseMs: Math.round(exec._avg.responseTimeMs ?? 0),
          totalTokens: exec._sum.totalTokens ?? 0,
        }
      : null,
  };
}
