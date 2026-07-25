// ==========================================================================
// Platform / Conversation (Phase 7.1) — public barrel.
//
// The reusable AI Conversation Platform: lifecycle, live state, message storage,
// and memory. It knows NOTHING about any LLM/Gemini/Prompt Builder/Chat UI —
// those consume this platform, never the reverse. It may consume the Knowledge
// Retriever + Context Builder and nothing else.
//
// Import boundaries (keep server code out of client bundles):
//   • Client/runtime → this barrel (components, hook, actions, config, utils, types)
//   • Server data     → '@/modules/platform/conversation/data'     (server-only)
//   • Manager         → '@/modules/platform/conversation/manager'  (server-only)
//   • Services        → '@/modules/platform/conversation/services' (server-only)
//   • State / Memory  → '@/modules/platform/conversation/state' | '/memory'
//   • Dashboard data  → '@/modules/platform/conversation/analytics'
//
// Docs: docs/conversation-platform.md
// ==========================================================================

export { ConversationStatusBadge } from './components';
export { useConversation } from './hooks';

export {
  startConversationAction,
  continueConversationAction,
  endConversationAction,
  restoreConversationAction,
  getMessagesAction,
  rememberFactAction,
  recallMemoryAction,
  conversationStatsAction,
  recentConversationsAction,
} from './actions';

export {
  CONVERSATION_FEATURES,
  CONVERSATION_CONFIG,
  isConversationFeatureEnabled,
  type ConversationFeature,
} from './config';

export { humanizeEnum, deriveTitle, estimateTokens, scoreImportance } from './utils';

export { CONVERSATION_EVENTS } from './types';
export type {
  ConversationDTO,
  ConversationStateDTO,
  ConversationMessageDTO,
  ConversationMemoryDTO,
  ConversationStats,
  StartConversationInput,
  AppendMessageInput,
  StateUpdate,
  MemoryInput,
  MessagePage,
  ConversationStatus,
  ConversationRole,
  ConversationMessageType,
  ConversationMemoryType,
  ConversationEventName,
} from './types';
