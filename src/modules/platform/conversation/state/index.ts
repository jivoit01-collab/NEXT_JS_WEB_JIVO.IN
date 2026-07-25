import 'server-only';

// ==========================================================================
// Conversation State engine — the SINGLE SOURCE OF TRUTH for a live conversation.
// Always read the current state first; update ONLY the changed fields. Never
// rebuild the whole conversation. Publishes a state-updated event.
// ==========================================================================

import { platformEvents } from '@/modules/core/events';
import { getState, patchState } from '../data';
import { CONVERSATION_EVENTS, type StateUpdate, type ConversationStateDTO } from '../types';

/** Read the live state (one small row — no message scan). */
export function readState(conversationId: string): Promise<ConversationStateDTO | null> {
  return getState(conversationId);
}

/**
 * Apply a partial patch — only the fields present are written. Emits
 * STATE_UPDATED with the changed keys so analytics/other platforms can react.
 */
export async function updateState(
  conversationId: string,
  patch: StateUpdate,
): Promise<ConversationStateDTO> {
  const clean = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined),
  ) as StateUpdate;
  const state = await patchState(conversationId, clean);
  platformEvents.emit(CONVERSATION_EVENTS.STATE_UPDATED, {
    conversationId,
    changed: Object.keys(clean),
  });
  return state;
}

/** Bump the context/knowledge version (used when a new context is built). */
export async function bumpVersions(
  conversationId: string,
  which: { context?: boolean; knowledge?: boolean },
): Promise<ConversationStateDTO> {
  const current = await getState(conversationId);
  return updateState(conversationId, {
    contextVersion: (current?.contextVersion ?? 0) + (which.context ? 1 : 0),
    knowledgeVersion: (current?.knowledgeVersion ?? 0) + (which.knowledge ? 1 : 0),
  });
}
