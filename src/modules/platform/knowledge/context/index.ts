// ==========================================================================
// Knowledge / Context Builder (Phase 7.0.1) — public barrel.
//
// The reusable layer between the Retriever and any future LLM. Transforms
// retrieved documents into a clean, deduped, token-efficient KnowledgeContext
// with full source attribution. Every AI provider consumes THIS, never the
// Retriever directly. Knows nothing about any LLM / Prompt Builder / Chatbot.
//
// Server-only entry (retrieve → build) lives at:
//   '@/modules/platform/knowledge/context/services/from-retriever'
//
// Docs: docs/knowledge-platform.md → "Context Builder".
// ==========================================================================

export {
  buildContext,
  buildContextCached,
  contextCacheKey,
  registerContextCache,
  getContextCache,
} from './services';

export {
  CONTEXT_FEATURES,
  CONTEXT_CONFIG,
  isContextFeatureEnabled,
  resolveTokenBudget,
  registerModelTokenBudget,
  type ContextFeature,
} from './config';

export {
  resolveContextStrategy,
  registerContextStrategy,
  getContextStrategies,
} from './strategies';

export {
  estimateTokens,
  formatCitation,
  dominantCollection,
  dedupeParagraphs,
  splitParagraphs,
} from './utils';

export { contextStrategySchema, contextOptionsSchema, type ContextOptionsInput } from './validations';

export { CONTEXT_EVENTS } from './types';
export type {
  KnowledgeContext,
  KnowledgeCitation,
  ContextRequest,
  ContextStrategy,
  ContextStrategyKey,
  ContextStatistics,
  ContextMetadata,
  ContextCache,
  ContextEventName,
  StrategyConfig,
} from './types';
