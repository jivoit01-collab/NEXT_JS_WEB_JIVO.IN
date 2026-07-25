import 'server-only';

// ==========================================================================
// Conversation services — the orchestration facade. Actions call these. It may
// consume the Knowledge Retriever + Context Builder and NOTHING else — never an
// LLM. It stops at producing a KnowledgeContext + updating state.
// ==========================================================================

import { retrieveAndBuildContext } from '@/modules/platform/knowledge/context/services/from-retriever';
import type { KnowledgeContext, ContextStrategyKey } from '@/modules/platform/knowledge/context';
import {
  startConversation,
  continueConversation,
  endConversation,
  restoreConversation,
  updateState,
  rememberFact,
  recallMemory,
  forgetExpired,
  getMessages,
} from '../manager';
import {
  getConversationStats,
  conversationsByStatus,
  messagesByRole,
  memoriesByType,
  recentConversations,
} from '../data';

// Lifecycle + memory facade.
export {
  startConversation,
  continueConversation,
  endConversation,
  restoreConversation,
  updateState,
  rememberFact,
  recallMemory,
  forgetExpired,
  getMessages,
};

// Admin reads.
export {
  getConversationStats,
  conversationsByStatus,
  messagesByRole,
  memoriesByType,
  recentConversations,
};

export interface ConversationContextRequest {
  conversationId: string;
  question: string;
  strategy?: ContextStrategyKey;
  model?: string;
  topK?: number;
}

/**
 * Build knowledge context for a conversation turn (Knowledge → Context Builder),
 * then advance the conversation state (bump knowledge/context version, record the
 * estimated tokens). Returns the KnowledgeContext for a FUTURE Prompt Builder/LLM
 * to consume — this platform never calls an LLM.
 */
export async function buildConversationContext(
  req: ConversationContextRequest,
): Promise<KnowledgeContext> {
  const context = await retrieveAndBuildContext({
    question: req.question,
    strategy: req.strategy,
    model: req.model,
    topK: req.topK,
  });

  // State-first: patch only the moving fields — never rebuild the conversation.
  const current = await import('../state').then((m) => m.readState(req.conversationId));
  await updateState(req.conversationId, {
    contextVersion: (current?.contextVersion ?? 0) + 1,
    knowledgeVersion: (current?.knowledgeVersion ?? 0) + 1,
    estimatedTokens: (current?.estimatedTokens ?? 0) + context.estimatedTokens,
    currentTopic: context.collection ?? current?.currentTopic ?? null,
  });

  return context;
}
