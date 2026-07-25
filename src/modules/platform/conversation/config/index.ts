// ==========================================================================
// Conversation configuration — flags + defaults. Client-safe.
// ==========================================================================

/** Which conversation capabilities are enabled. */
export const CONVERSATION_FEATURES = {
  memory: true,
  conversationResume: true,
  temporaryMemory: true,
  longTermMemory: true,

  // Prepared, off until implemented.
  streaming: false,
  multiAgent: false,
  redisSessionCache: false, // hooks ready, no Redis
  semanticMemory: false, // needs embeddings
} as const;

export type ConversationFeature = keyof typeof CONVERSATION_FEATURES;

export function isConversationFeatureEnabled(feature: ConversationFeature): boolean {
  return CONVERSATION_FEATURES[feature] === true;
}

export const CONVERSATION_CONFIG = {
  /** Default assistant temperature stored in state (no LLM called here). */
  defaultTemperature: 0.7,
  /** Cursor page size for message history. */
  messagePageSize: 30,
  maxMessagePageSize: 100,
  /** Title auto-derived from the first user message, truncated to this. */
  autoTitleLength: 60,
  /** Temporary memory default TTL (ms) when none is provided. */
  temporaryMemoryTtlMs: 60 * 60 * 1000, // 1 hour
  /** Memory retrieval: top-N by importance. */
  memoryTopK: 20,
  /** Conversation is IDLE after this much silence (ms). */
  idleAfterMs: 30 * 60 * 1000, // 30 min
} as const;
