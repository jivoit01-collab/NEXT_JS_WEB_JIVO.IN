// ==========================================================================
// Platform / Knowledge (Phase 7.0) — public barrel.
//
// The reusable knowledge layer for every AI feature. It knows NOTHING about any
// LLM; an LLM consumes the Retriever/Search, never the reverse.
//
// Import boundaries (keep server code out of client bundles):
//   • Client/runtime → this barrel (components, hooks, actions, config, utils, types)
//   • Server data     → '@/modules/platform/knowledge/data'      (server-only)
//   • Server search   → '@/modules/platform/knowledge/search'    (server-only)
//   • Server retriever→ '@/modules/platform/knowledge/retriever' (server-only)
//   • Server indexing → '@/modules/platform/knowledge/indexing'  (server-only)
//   • Server services → '@/modules/platform/knowledge/services'  (server-only)
//   • Embeddings      → '@/modules/platform/knowledge/embeddings'
//   • Dashboard data  → '@/modules/platform/knowledge/analytics'
//
// Docs: docs/knowledge-platform.md
// ==========================================================================

export { KnowledgeSearchBox } from './components';
export { useKnowledgeSearch } from './hooks';

export {
  searchKnowledgeAction,
  retrieveKnowledgeAction,
  listDocumentsAction,
  knowledgeStatsAction,
  listSourcesAction,
  listCollectionsAction,
  listSyncJobsAction,
  syncSourceAction,
} from './actions';

export {
  KNOWLEDGE_FEATURES,
  KNOWLEDGE_CONFIG,
  isKnowledgeFeatureEnabled,
  type KnowledgeFeature,
} from './config';

export {
  humanizeEnum,
  chunkText,
  contentHash,
  estimateTokens,
  makeExcerpt,
  toPlainText,
} from './utils';

export { KNOWLEDGE_EVENTS } from './types';
export type {
  KnowledgeDocumentDTO,
  KnowledgeSourceDTO,
  KnowledgeCollectionDTO,
  KnowledgeSyncJobDTO,
  KnowledgeStats,
  KnowledgeSearchResult,
  RankedDocument,
  SearchMode,
  SearchQuery,
  SearchFilters,
  RetrievalRequest,
  RetrievalResult,
  EmbeddingProvider,
  EmbeddingVector,
  SourceAdapter,
  RawKnowledgeItem,
  KnowledgeEventName,
} from './types';
