import 'server-only';

// ==========================================================================
// Server-only orchestration: turn a live conversation + a user question into a
// final BuiltPrompt. This is the full "question → prompt" path a future LLM
// step consumes. It wires three existing platforms together:
//
//   Knowledge (retrieve → Context Builder)  ─┐
//   Conversation (recall memory)            ─┼─▶ Prompt Builder ─▶ BuiltPrompt
//   User question                           ─┘
//
// Still NO LLM. Everything is reused; nothing is duplicated.
// ==========================================================================

import { retrieveAndBuildContext } from '@/modules/platform/knowledge/context/services/from-retriever';
import { recallMemory } from '@/modules/platform/conversation/manager';
import type { KnowledgeContext } from '@/modules/platform/knowledge/context';
import { buildPrompt } from './index';
import type { BuiltPrompt } from '../types';

export interface PromptForConversationRequest {
  conversationId: string;
  question: string;
  templateId?: string;
  provider?: string;
  language?: string;
  variables?: Record<string, string>;
  maxTokens?: number;
  /** Skip knowledge retrieval (e.g. small-talk turns). */
  skipKnowledge?: boolean;
  /**
   * Restrict retrieval to these knowledge collections. Intent-scoped search: a
   * COMPANY question searches company/essence pages only, so product copy with
   * incidental keyword overlap cannot answer it.
   */
  collectionKeys?: string[];
}

/**
 * Build a grounded prompt for a conversation turn: recall the conversation's
 * memory, retrieve + build the knowledge context for the question, then assemble
 * the final prompt with the chosen template.
 */
export async function buildPromptForConversation(
  req: PromptForConversationRequest,
): Promise<BuiltPrompt> {
  return (await buildPromptForConversationDetailed(req)).prompt;
}

/** The prompt PLUS the knowledge context it used (for observability provenance).
 *  Same single retrieval as `buildPromptForConversation` — no duplicate work. */
export async function buildPromptForConversationDetailed(
  req: PromptForConversationRequest,
): Promise<{ prompt: BuiltPrompt; context: KnowledgeContext | undefined }> {
  const [memory, context] = await Promise.all([
    recallMemory(req.conversationId),
    req.skipKnowledge
      ? Promise.resolve<KnowledgeContext | undefined>(undefined)
      : retrieveAndBuildContext({
          question: req.question,
          filters: req.collectionKeys ? { collectionKeys: req.collectionKeys } : undefined,
        }).catch(() => undefined),
  ]);

  const prompt = buildPrompt({
    question: req.question,
    context,
    memory,
    templateId: req.templateId,
    provider: req.provider,
    language: req.language,
    variables: req.variables,
    maxTokens: req.maxTokens,
  });
  return { prompt, context };
}
