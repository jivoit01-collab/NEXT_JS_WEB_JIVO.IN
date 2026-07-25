'use client';

// ==========================================================================
// Local conversation history — a small client-only index of conversations the
// user has opened on this device (id + title + last activity). Frontend-only:
// it does NOT duplicate server data, it just remembers what to offer for restore.
// The Conversation Platform remains the source of truth for message content.
// ==========================================================================

import type { ChatConversationSummary } from '../types';

const KEY = 'jivo.chat.history';
const MAX = 50;

interface HistoryEntry {
  id: string;
  title: string;
  messageCount: number;
  lastMessageAt: string;
}

function read(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX)));
  } catch {
    /* ignore */
  }
}

/** Upsert a conversation into the local history (most-recent first). */
export function rememberConversation(
  id: string,
  title: string,
  messageCount: number,
  lastMessageAt: string,
): void {
  const entries = read().filter((e) => e.id !== id);
  entries.unshift({ id, title: title || 'New conversation', messageCount, lastMessageAt });
  write(entries);
}

/** All remembered conversations as summaries (newest first). */
export function listConversations(): ChatConversationSummary[] {
  return read()
    .sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1))
    .map((e) => ({ id: e.id, title: e.title, messageCount: e.messageCount, status: 'ACTIVE', lastMessageAt: e.lastMessageAt }));
}
