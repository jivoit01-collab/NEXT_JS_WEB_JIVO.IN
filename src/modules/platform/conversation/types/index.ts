// ==========================================================================
// Conversation Platform — types (the contract). No LLM/Prompt/Chat concepts.
// ==========================================================================

import type {
  ConversationStatus,
  ConversationRole,
  ConversationMessageType,
  ConversationMemoryType,
} from '@prisma/client';

export type {
  ConversationStatus,
  ConversationRole,
  ConversationMessageType,
  ConversationMemoryType,
};

// ── DTOs (serializable) ──────────────────────────────────────
export interface ConversationDTO {
  id: string;
  visitorId: string | null;
  userId: string | null;
  sessionId: string | null;
  title: string | null;
  language: string;
  status: ConversationStatus;
  startedAt: string;
  endedAt: string | null;
  lastMessageAt: string | null;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationStateDTO {
  conversationId: string;
  currentIntent: string | null;
  currentTopic: string | null;
  summary: string | null;
  lastMessageId: string | null;
  contextVersion: number;
  knowledgeVersion: number;
  estimatedTokens: number;
  streamingEnabled: boolean;
  modelProvider: string | null;
  temperature: number;
  updatedAt: string;
}

export interface ConversationMessageDTO {
  id: string;
  conversationId: string;
  role: ConversationRole;
  content: string;
  messageType: ConversationMessageType;
  tokens: number;
  responseTime: number | null;
  confidence: number | null;
  feedbackId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface ConversationMemoryDTO {
  id: string;
  conversationId: string;
  type: ConversationMemoryType;
  key: string;
  value: string;
  importance: number;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Inputs ───────────────────────────────────────────────────
export interface StartConversationInput {
  visitorId?: string;
  userId?: string;
  sessionId?: string;
  title?: string;
  language?: string;
  modelProvider?: string;
}

export interface AppendMessageInput {
  conversationId: string;
  role: ConversationRole;
  content: string;
  messageType?: ConversationMessageType;
  tokens?: number;
  responseTime?: number;
  confidence?: number;
  metadata?: Record<string, unknown>;
}

/** Partial state patch — the manager updates ONLY the changed fields. */
export interface StateUpdate {
  currentIntent?: string | null;
  currentTopic?: string | null;
  summary?: string | null;
  lastMessageId?: string | null;
  contextVersion?: number;
  knowledgeVersion?: number;
  estimatedTokens?: number;
  streamingEnabled?: boolean;
  modelProvider?: string | null;
  temperature?: number;
}

export interface MemoryInput {
  conversationId: string;
  type: ConversationMemoryType;
  key: string;
  value: string;
  importance?: number;
  /** TTL in ms (temporary memory). */
  ttlMs?: number;
}

// ── Cursor pagination (messages scale to millions) ───────────
export interface MessagePage {
  messages: ConversationMessageDTO[];
  nextCursor: string | null;
  hasMore: boolean;
}

// ── Stats (admin dashboard) ──────────────────────────────────
export interface ConversationStats {
  totalConversations: number;
  activeConversations: number;
  endedConversations: number;
  totalMessages: number;
  totalMemories: number;
  avgMessagesPerConversation: number;
}

// ── Events (Core Event Bus) ──────────────────────────────────
export const CONVERSATION_EVENTS = {
  CREATED: 'conversation:created',
  STARTED: 'conversation:started',
  MESSAGE_CREATED: 'conversation:message_created',
  MESSAGE_UPDATED: 'conversation:message_updated',
  MEMORY_CREATED: 'conversation:memory_created',
  MEMORY_UPDATED: 'conversation:memory_updated',
  STATE_UPDATED: 'conversation:state_updated',
  ENDED: 'conversation:ended',
} as const;

export type ConversationEventName =
  (typeof CONVERSATION_EVENTS)[keyof typeof CONVERSATION_EVENTS];
