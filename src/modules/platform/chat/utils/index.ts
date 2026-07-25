// ==========================================================================
// AI Chat utils — pure, client-safe helpers.
// ==========================================================================

import type { ChatMessage } from '../types';

/** Map a stored ConversationMessageDTO-ish row to a rendered ChatMessage. */
export function toChatMessage(row: {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}): ChatMessage {
  return {
    id: row.id,
    role: row.role === 'ASSISTANT' ? 'assistant' : 'user',
    content: row.content,
    status: 'sent',
    createdAt: row.createdAt,
    plan: null,
  };
}

/** Client-only optimistic id (never used as a DB id). */
export function optimisticId(seed: number): string {
  return `optimistic_${seed}`;
}

/** Format an ISO timestamp as HH:MM (locale-safe, no server dependency). */
export function formatTime(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

/** Suggested questions from a plan's suggested_questions card, else fallback. */
export function questionsFromPlan(plan: { cards: { kind: string; data: unknown }[] } | null, fallback: string[]): string[] {
  const card = plan?.cards.find((c) => c.kind === 'suggested_questions');
  const data = card?.data as { questions?: string[] } | undefined;
  return data?.questions?.length ? data.questions : fallback;
}
