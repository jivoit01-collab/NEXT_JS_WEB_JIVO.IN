// ==========================================================================
// Platform / Chat (Phase 7.6) — public barrel.
//
// The reusable AI Chat Widget: floating launcher + responsive, theme-aware panel
// that renders streaming-ready messages, Experience Cards and suggested
// questions. It is PURE UI wiring — ALL business logic lives in one server action
// (`sendMessageAction`) that orchestrates the existing platforms (Conversation →
// Prompt → Provider → Response → Experience). The widget duplicates none of it.
//
// Drop-in usage (client):
//   import { ChatWidget } from '@/modules/platform/chat';
//   <ChatWidget visitorId={visitorId} />
//
// Import boundaries (respect the client/registry rule):
//   • Client/runtime → this barrel (components, hook, config, utils, types)
//   • Server actions  → '@/modules/platform/chat/actions' (the orchestration)
//
// Docs: docs/ai-chat-widget-platform.md
// ==========================================================================

// Components (all 'use client').
export {
  ChatWidget,
  type ChatWidgetProps,
  ChatLauncher,
  ChatPanel,
  MessageList,
  Composer,
  SuggestedQuestions,
  ConversationList,
  TypingIndicator,
  ExperienceCards,
} from './components';

// Client session hook.
export { useChat, type UseChatReturn } from './hooks/use-chat';

// Server orchestration actions.
export {
  startChatAction,
  sendMessageAction,
  restoreChatAction,
  chatSuggestedQuestionsAction,
} from './actions';

// Config + flags (client-safe).
export {
  CHAT_FEATURES,
  CHAT_CONFIG,
  isChatFeatureEnabled,
  type ChatFeature,
} from './config';

// Utils (client-safe).
export { toChatMessage, formatTime, questionsFromPlan } from './utils';

// Events + types.
export { CHAT_EVENTS } from './types';
export type {
  ChatMessage,
  MessageStatus,
  ChatConversationSummary,
  ChatSession,
  ChatTurnResult,
  PanelState,
  ChatEventName,
} from './types';
