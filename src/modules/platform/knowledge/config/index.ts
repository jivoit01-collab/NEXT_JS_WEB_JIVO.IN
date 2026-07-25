// ==========================================================================
// Knowledge configuration — single source of truth (flags + defaults).
// Client-safe. Future capabilities flip a flag here; no code changes elsewhere.
// ==========================================================================

import type { KnowledgeEmbeddingProvider, SearchMode } from '../types';

/** Which knowledge capabilities are enabled. */
export const KNOWLEDGE_FEATURES = {
  // Live today — the reusable knowledge layer.
  indexing: true,
  keywordSearch: true,
  retriever: true,
  adminDashboard: true,
  autoSync: true, // re-index on CMS content change (event-driven)

  // Prepared, disabled until generation / a provider is wired up.
  embeddings: false,
  semanticSearch: false,
  hybridSearch: false,
  vectorSearch: false,
  redisCache: false,
  backgroundWorker: false,
} as const;

export type KnowledgeFeature = keyof typeof KNOWLEDGE_FEATURES;

export function isKnowledgeFeatureEnabled(feature: KnowledgeFeature): boolean {
  return KNOWLEDGE_FEATURES[feature] === true;
}

export const KNOWLEDGE_CONFIG = {
  /** Default search behaviour. Falls back to keyword until embeddings land. */
  defaultSearchMode: 'keyword' as SearchMode,
  /** Provider used once `embeddings` is enabled. */
  defaultEmbeddingProvider: 'GEMINI' as KnowledgeEmbeddingProvider,
  defaultEmbeddingModel: 'text-embedding-004',

  /** Retrieval defaults. */
  defaultTopK: 6,
  maxTopK: 50,

  /** Chunking (long content → multiple KnowledgeDocument rows). */
  chunkSize: 1200, // approx characters per chunk
  chunkOverlap: 150,

  /** Admin pagination. */
  pageSize: 50,
  maxPageSize: 200,

  /** Hybrid fusion weight (semantic vs keyword) once hybrid is enabled. */
  hybridSemanticWeight: 0.6,
} as const;
