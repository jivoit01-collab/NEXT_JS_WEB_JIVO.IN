// ==========================================================================
// Conversation utils — pure, reusable helpers (client-safe).
// ==========================================================================

import { CONVERSATION_CONFIG } from '../config';
import type { ConversationMemoryType } from '../types';

/** ENUM_VALUE → "Enum value". */
export function humanizeEnum(value: string): string {
  const s = value.replace(/_/g, ' ').toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Estimate tokens from characters (~4 chars/token). */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/** Derive a conversation title from the first user message. */
export function deriveTitle(firstMessage: string): string {
  const clean = firstMessage.replace(/\s+/g, ' ').trim();
  return clean.length <= CONVERSATION_CONFIG.autoTitleLength
    ? clean
    : `${clean.slice(0, CONVERSATION_CONFIG.autoTitleLength).trimEnd()}…`;
}

/**
 * Importance score (0..1) for a memory. Long-term/profile matter more; temporary
 * matters least. A future semantic-memory pass can override this.
 */
export function scoreImportance(type: ConversationMemoryType, base = 0.5): number {
  const weights: Record<ConversationMemoryType, number> = {
    PROFILE: 0.9,
    LONG_TERM: 0.85,
    HEALTH: 0.8,
    BUSINESS: 0.75,
    PREFERENCE: 0.7,
    SHOPPING: 0.6,
    TEMPORARY: 0.3,
  };
  return Math.max(0, Math.min(1, (weights[type] ?? 0.5) * 0.7 + base * 0.3));
}

// ── Cursor pagination (opaque base64 of the createdAt+id) ─────
export function encodeCursor(createdAt: string, id: string): string {
  return Buffer.from(`${createdAt}|${id}`).toString('base64url');
}

export function decodeCursor(cursor: string): { createdAt: string; id: string } | null {
  try {
    const [createdAt, id] = Buffer.from(cursor, 'base64url').toString('utf8').split('|');
    return createdAt && id ? { createdAt, id } : null;
  } catch {
    return null;
  }
}
