import 'server-only';

// ==========================================================================
// Convenience: retrieve → build context, in one server-only call. This is the
// full "question → prompt-ready context" path a future Prompt Builder / LLM
// uses. It NEVER calls an LLM — it stops at the context.
// ==========================================================================

import { retrieve } from '../../retriever';
import { buildContextCached } from './index';
import type { RetrievalRequest } from '../../types';
import type { KnowledgeContext, ContextStrategyKey } from '../types';

export interface ContextFromQuestionRequest extends RetrievalRequest {
  strategy?: ContextStrategyKey;
  model?: string;
  tokenBudget?: number;
}

export async function retrieveAndBuildContext(
  req: ContextFromQuestionRequest,
): Promise<KnowledgeContext> {
  const retrieval = await retrieve({
    question: req.question,
    filters: req.filters,
    topK: req.topK,
    mode: req.mode,
  });
  return buildContextCached({
    question: req.question,
    documents: retrieval.documents,
    strategy: req.strategy,
    model: req.model,
    tokenBudget: req.tokenBudget,
    mode: retrieval.mode,
    filters: req.filters,
  });
}
