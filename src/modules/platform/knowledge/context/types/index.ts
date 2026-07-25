// ==========================================================================
// Context Builder — types (the seam between Retriever and any future LLM).
//
// The Prompt Builder / LLM consumes a KnowledgeContext; it never touches the
// Retriever directly. Nothing here knows about any LLM.
// ==========================================================================

import type { RankedDocument, SearchFilters, SearchMode } from '../../types';

export type ContextStrategyKey =
  | 'compact'
  | 'balanced'
  | 'detailed'
  | 'citation'
  | 'product'
  | 'faq'
  | 'recipe';

/** Per-source provenance — a future "Sources" UI renders this with NO extra query. */
export interface KnowledgeCitation {
  index: number; // 1-based marker used in the context text ([1], [2], …)
  documentId: string;
  entityType: string;
  entityId: string | null;
  collection: string | null;
  title: string;
  url: string | null;
  relevanceScore: number; // 0..1
  chunkIndex: number;
}

export interface ContextStatistics {
  documentsIn: number;
  documentsUsed: number;
  duplicatesRemoved: number;
  paragraphsRemoved: number;
  charsIn: number;
  charsOut: number;
  /** charsOut / charsIn (1 = no compression). */
  compressionRatio: number;
  trimmed: boolean;
}

export interface ContextMetadata {
  strategy: ContextStrategyKey;
  mode: SearchMode;
  citationMode: boolean;
  compressed: boolean;
  cached: boolean;
  model: string | null;
  tokenBudget: number;
}

/** The reusable Context object. Consumed later by the Prompt Builder. */
export interface KnowledgeContext {
  /** Prompt-ready context text (already deduped/compressed/trimmed). */
  context: string;
  /** Structured provenance for every included chunk. */
  sources: KnowledgeCitation[];
  /** Human-readable citation lines (e.g. "[1] Our Story — /our-essence/the-story"). */
  citations: string[];
  metadata: ContextMetadata;
  statistics: ContextStatistics;
  estimatedTokens: number;
  language: string;
  /** 0..1 — mean relevance of the used chunks (context confidence). */
  confidence: number;
  /** Dominant collection of the used documents (or null if mixed/none). */
  collection: string | null;
}

/** Input to the Context Builder — the RETRIEVER'S output, plus options. */
export interface ContextRequest {
  question: string;
  documents: RankedDocument[];
  strategy?: ContextStrategyKey;
  /** Model name (only used to look up a registered token budget). */
  model?: string;
  /** Explicit token budget override. */
  tokenBudget?: number;
  mode?: SearchMode;
  filters?: SearchFilters;
}

/** How a strategy shapes the pipeline. Future strategies just declare config. */
export interface StrategyConfig {
  maxDocuments: number;
  maxCharsPerDoc: number;
  includeCitations: boolean;
  deduplicate: boolean;
  compress: boolean;
  /** Fraction of the token budget this strategy targets (≤ 1). */
  budgetRatio: number;
  /** Bias toward these collections when trimming (e.g. "products" for product strategy). */
  preferCollections?: string[];
}

export interface ContextStrategy {
  key: ContextStrategyKey;
  name: string;
  description: string;
  config: StrategyConfig;
}

/** Redis-style cache hook — interface only; no implementation this phase. */
export interface ContextCache {
  get: (key: string) => Promise<KnowledgeContext | null>;
  set: (key: string, value: KnowledgeContext) => Promise<void>;
}

// ── Events (published to the Core Event Bus) ─────────────────
export const CONTEXT_EVENTS = {
  BUILT: 'knowledge:context_built',
  COMPRESSED: 'knowledge:context_compressed',
  TRIMMED: 'knowledge:context_trimmed',
  CACHE_HIT: 'knowledge:context_cache_hit',
  CACHE_MISS: 'knowledge:context_cache_miss',
} as const;

export type ContextEventName = (typeof CONTEXT_EVENTS)[keyof typeof CONTEXT_EVENTS];
