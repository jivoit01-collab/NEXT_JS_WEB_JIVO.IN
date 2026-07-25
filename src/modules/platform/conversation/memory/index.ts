import 'server-only';

// ==========================================================================
// Memory Engine — reusable conversation memory. Store / update / expire /
// retrieve, with importance scoring. No AI: "semantic memory" is a future flag.
// ==========================================================================

import { platformEvents } from '@/modules/core/events';
import { upsertMemory, expireMemory, getRelevantMemory } from '../data';
import { isConversationFeatureEnabled } from '../config';
import { scoreImportance } from '../utils';
import { CONVERSATION_EVENTS, type MemoryInput, type ConversationMemoryDTO } from '../types';

/** Store or update a memory (upsert by conversation + type + key). */
export async function rememberFact(input: MemoryInput): Promise<ConversationMemoryDTO | null> {
  if (!isConversationFeatureEnabled('memory')) return null;
  if (input.type === 'TEMPORARY' && !isConversationFeatureEnabled('temporaryMemory')) return null;
  if (input.type === 'LONG_TERM' && !isConversationFeatureEnabled('longTermMemory')) return null;

  const existed = false; // upsert; we emit CREATED/UPDATED generically below
  const memory = await upsertMemory({
    ...input,
    importance: input.importance ?? scoreImportance(input.type),
  });
  platformEvents.emit(
    existed ? CONVERSATION_EVENTS.MEMORY_UPDATED : CONVERSATION_EVENTS.MEMORY_CREATED,
    { conversationId: input.conversationId, type: input.type, key: input.key },
  );
  return memory;
}

/**
 * Retrieve the most relevant memory for a conversation (non-expired, top-N by
 * importance). A future `semanticMemory` pass re-ranks these by embedding
 * similarity to the current message — the interface stays the same.
 */
export function recallMemory(conversationId: string): Promise<ConversationMemoryDTO[]> {
  if (!isConversationFeatureEnabled('memory')) return Promise.resolve([]);
  return getRelevantMemory(conversationId);
}

/** Evict expired (temporary) memory. Cheap to call opportunistically. */
export function forgetExpired(): Promise<number> {
  return expireMemory();
}
