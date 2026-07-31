import 'server-only';

// ==========================================================================
// Conversation Manager — the reusable lifecycle facade. Create / continue /
// end / restore a conversation, drive state, manage memory, publish events.
// NO AI logic. State-first: "restore" reads the state + first message page +
// relevant memory — it NEVER replays the whole history.
// ==========================================================================

import { platformEvents } from '@/modules/core/events';
import {
  createConversation,
  appendMessage,
  endConversation as endConversationData,
  getConversation,
  getMessages,
} from '../data';
import { readState } from '../state';
import { recallMemory } from '../memory';
import { isConversationFeatureEnabled } from '../config';
import {
  CONVERSATION_EVENTS,
  type StartConversationInput,
  type AppendMessageInput,
  type ConversationDTO,
  type ConversationMessageDTO,
  type ConversationStateDTO,
  type ConversationMemoryDTO,
  type MessagePage,
} from '../types';

/** A restored conversation — enough to resume WITHOUT replaying full history. */
export interface ConversationSnapshot {
  conversation: ConversationDTO;
  state: ConversationStateDTO | null;
  recentMessages: MessagePage;
  memory: ConversationMemoryDTO[];
}

/** Start a new conversation (metadata + one state row). */
export async function startConversation(input: StartConversationInput): Promise<ConversationDTO> {
  const conversation = await createConversation(input);
  platformEvents.emit(CONVERSATION_EVENTS.CREATED, { conversationId: conversation.id });
  platformEvents.emit(CONVERSATION_EVENTS.STARTED, {
    conversationId: conversation.id,
    visitorId: conversation.visitorId,
    userId: conversation.userId,
  });
  return conversation;
}

/** Append a message and advance state (counters, lastMessageId, tokens). */
export async function continueConversation(
  input: AppendMessageInput,
): Promise<ConversationMessageDTO> {
  const message = await appendMessage(input);
  platformEvents.emit(CONVERSATION_EVENTS.MESSAGE_CREATED, {
    conversationId: input.conversationId,
    messageId: message.id,
    role: message.role,
    tokens: message.tokens,
  });
  return message;
}

/** End a conversation. */
export async function endConversation(conversationId: string): Promise<void> {
  await endConversationData(conversationId);
  platformEvents.emit(CONVERSATION_EVENTS.ENDED, { conversationId });
}

/** Restore a conversation: state + newest message page + relevant memory. */
export async function restoreConversation(conversationId: string): Promise<ConversationSnapshot | null> {
  if (!isConversationFeatureEnabled('conversationResume')) return null;
  const conversation = await getConversation(conversationId);
  if (!conversation) return null;

  const [state, recentMessages, memory] = await Promise.all([
    readState(conversationId),
    getMessages(conversationId),
    recallMemory(conversationId),
  ]);
  return { conversation, state, recentMessages, memory };
}

// Re-export the state + memory engines so callers use one manager surface.
export { readState, updateState } from '../state';
export { rememberFact, recallMemory, forgetExpired } from '../memory';
export { getMessages, findLatestConversationByVisitor } from '../data';
