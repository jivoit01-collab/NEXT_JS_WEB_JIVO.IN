// ==========================================================================
// Context Builder configuration — flags + defaults. Client-safe.
// Everything configurable; no LLM/provider limits hardcoded.
// ==========================================================================

import type { ContextStrategyKey } from '../types';

/** Which context-building capabilities are enabled. */
export const CONTEXT_FEATURES = {
  compression: true,
  deduplication: true,
  citationMode: true,
  tokenOptimization: true,

  // Prepared, off until implemented.
  semanticCompression: false, // needs embeddings
  caching: false, // Redis (hooks ready, no impl)
} as const;

export type ContextFeature = keyof typeof CONTEXT_FEATURES;

export function isContextFeatureEnabled(feature: ContextFeature): boolean {
  return CONTEXT_FEATURES[feature] === true;
}

export const CONTEXT_CONFIG = {
  defaultStrategy: 'balanced' as ContextStrategyKey,

  /** Model-agnostic default budget. NOT a Gemini/OpenAI limit — see resolveTokenBudget. */
  defaultTokenBudget: 4000,
  /** Reserve headroom for the (future) prompt template + question + answer. */
  reserveTokensForPrompt: 800,
  /** Rough chars→tokens ratio (English ~4). Overridable per model later. */
  charsPerToken: 4,

  /** Upper bound on documents merged into one context. */
  maxDocuments: 12,
  /** Drop chunks below this relevance before building. */
  minRelevanceScore: 0.05,
  /** Two paragraphs with ≥ this Jaccard similarity are treated as duplicates. */
  dedupeSimilarityThreshold: 0.9,
} as const;

/**
 * Model-specific token budgets. EMPTY by default — a future provider registers
 * its own budget here (or passes `tokenBudget` per request). No LLM limit is
 * hardcoded, so nothing couples the Context Builder to Gemini/OpenAI/Claude.
 */
const MODEL_TOKEN_BUDGETS: Record<string, number> = {};

export function registerModelTokenBudget(model: string, maxTokens: number): void {
  MODEL_TOKEN_BUDGETS[model] = maxTokens;
}

/** Resolve the usable context token budget for a request. */
export function resolveTokenBudget(model?: string, override?: number): number {
  if (override && override > 0) return override;
  const modelBudget = model ? MODEL_TOKEN_BUDGETS[model] : undefined;
  const total = modelBudget ?? CONTEXT_CONFIG.defaultTokenBudget;
  return Math.max(256, total - CONTEXT_CONFIG.reserveTokensForPrompt);
}
