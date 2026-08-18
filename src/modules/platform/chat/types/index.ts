// ==========================================================================
// AI Chat Widget Platform — types (client-safe contract).
//
// The Chat Widget is the UI that consumes the whole AI stack. It contains NO
// business logic: a single server action runs the pipeline (Conversation →
// Prompt → Provider → Response → Experience) and returns UI-ready data. The
// client only renders. These types are the wire shapes between them.
// ==========================================================================

import type { ExperiencePlan } from '@/modules/platform/experience';

/** UI status of a message in the client (optimistic → confirmed). */
export type MessageStatus = 'sending' | 'streaming' | 'sent' | 'error';

/** A message as the widget renders it (maps from ConversationMessageDTO). */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status: MessageStatus;
  createdAt: string | null;
  /** Experience plan attached to an assistant message (cards to render). */
  plan?: ExperiencePlan | null;
  error?: string;
}

/** A conversation summary for the conversation list. */
export interface ChatConversationSummary {
  id: string;
  title: string;
  messageCount: number;
  status: string;
  lastMessageAt: string | null;
}

/** Result of starting / restoring a chat session. */
export interface ChatSession {
  /**
   * Null until the visitor actually sends something. Opening the widget no
   * longer creates a conversation row — the Gateway creates one on the first
   * message — so an unopened/idle chat leaves no empty record behind.
   */
  conversationId: string | null;
  messages: ChatMessage[];
  /** Suggested opening questions (from the last plan or defaults). */
  suggestedQuestions: string[];
}

/** Result of sending one message: the stored assistant reply + its experience. */
export interface ChatTurnResult {
  message: ChatMessage;
  plan: ExperiencePlan | null;
  /** The conversation this turn belongs to — new on the visitor's first message. */
  conversationId: string;
}

/** Panel display state (persisted to localStorage on the client). */
export type PanelState = 'closed' | 'open' | 'minimized';

// ── Events (Core Event Bus — chat analytics) ─────────────────
export const CHAT_EVENTS = {
  OPENED: 'ai:chat_opened',
  CLOSED: 'ai:chat_closed',
  MINIMIZED: 'ai:chat_minimized',
  MESSAGE_SENT: 'ai:chat_message_sent',
  MESSAGE_RECEIVED: 'ai:chat_message_received',
  CARD_CLICKED: 'ai:chat_card_clicked',
  SUGGESTED_CLICKED: 'ai:chat_suggested_clicked',
  CONVERSATION_RESTORED: 'ai:chat_conversation_restored',
  ERROR: 'ai:chat_error',
} as const;

export type ChatEventName = (typeof CHAT_EVENTS)[keyof typeof CHAT_EVENTS];
