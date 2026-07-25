// ==========================================================================
// Knowledge Platform — types (the architecture contract).
//
// These types are the stable seam every future AI feature builds on. The
// platform never imports an LLM; an LLM (Gemini/OpenAI/Claude/…) consumes the
// Retriever + Search output defined here.
// ==========================================================================

import type {
  KnowledgeSourceType,
  KnowledgeDocumentStatus,
  KnowledgeEmbeddingStatus,
  KnowledgeEmbeddingProvider,
  KnowledgeSyncJobType,
  KnowledgeSyncJobStatus,
} from '@prisma/client';

export type {
  KnowledgeSourceType,
  KnowledgeDocumentStatus,
  KnowledgeEmbeddingStatus,
  KnowledgeEmbeddingProvider,
  KnowledgeSyncJobType,
  KnowledgeSyncJobStatus,
};

// ── DTOs (serializable, admin/UI-facing) ─────────────────────

export interface KnowledgeSourceDTO {
  id: string;
  key: string;
  name: string;
  type: KnowledgeSourceType;
  description: string | null;
  enabled: boolean;
  documentCount: number;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeCollectionDTO {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  sortOrder: number;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeDocumentDTO {
  id: string;
  sourceId: string;
  collectionId: string | null;
  entityType: string;
  entityId: string | null;
  externalKey: string;
  title: string;
  content: string;
  excerpt: string | null;
  url: string | null;
  language: string;
  chunkIndex: number;
  tokenCount: number;
  status: KnowledgeDocumentStatus;
  embeddingStatus: KnowledgeEmbeddingStatus;
  version: number;
  metadata: Record<string, unknown> | null;
  indexedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeSyncJobDTO {
  id: string;
  sourceId: string | null;
  type: KnowledgeSyncJobType;
  status: KnowledgeSyncJobStatus;
  processed: number;
  created: number;
  updated: number;
  failed: number;
  error: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
}

// ── Ingestion (source adapters → indexer) ────────────────────

/**
 * A raw item produced by a source adapter, BEFORE chunking/hashing. `externalKey`
 * must be stable across syncs so the indexer can upsert instead of duplicating.
 */
export interface RawKnowledgeItem {
  externalKey: string;
  entityType: string;
  entityId?: string;
  collectionKey?: string;
  title: string;
  content: string;
  excerpt?: string;
  url?: string;
  language?: string;
  metadata?: Record<string, unknown>;
}

/**
 * A knowledge source adapter. Each source (CMS pages, products, FAQs, …) plugs
 * into the platform by implementing this — the platform never hard-codes a
 * source. `fetchItems` streams the source's current content; the indexer diffs
 * it against stored documents by content hash.
 */
export interface SourceAdapter {
  /** Stable source key, e.g. "cms-pages". */
  key: string;
  name: string;
  type: KnowledgeSourceType;
  /** Default collection for items with no explicit collectionKey. */
  defaultCollectionKey?: string;
  /** Produce the source's current knowledge items (server-only). */
  fetchItems: () => Promise<RawKnowledgeItem[]>;
}

// ── Search ───────────────────────────────────────────────────

export type SearchMode = 'keyword' | 'semantic' | 'hybrid';

export interface SearchFilters {
  collectionKeys?: string[];
  sourceKeys?: string[];
  entityTypes?: string[];
  language?: string;
  status?: KnowledgeDocumentStatus;
}

export interface SearchQuery {
  query: string;
  mode?: SearchMode; // default from config
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
}

export interface RankedDocument {
  document: KnowledgeDocumentDTO;
  /** 0..1 relevance score (keyword rank / cosine similarity / fused). */
  score: number;
  /** Which signal produced the match — useful for hybrid debugging. */
  matchedBy: SearchMode;
}

export interface KnowledgeSearchResult {
  query: string;
  mode: SearchMode;
  total: number;
  results: RankedDocument[];
  tookMs: number;
}

/** A search engine strategy (keyword / semantic / hybrid all implement this). */
export interface SearchEngine {
  mode: SearchMode;
  search: (q: SearchQuery) => Promise<KnowledgeSearchResult>;
}

// ── Retriever (question → top documents; NO LLM) ─────────────

export interface RetrievalRequest {
  question: string;
  filters?: SearchFilters;
  topK?: number;
  mode?: SearchMode;
}

export interface RetrievalResult {
  question: string;
  documents: RankedDocument[];
  /** Concatenated context string an LLM can drop into a prompt (built here, not by any LLM). */
  context: string;
  mode: SearchMode;
  tookMs: number;
}

// ── Embeddings abstraction (provider-agnostic; NO generation yet) ──

export interface EmbeddingVector {
  provider: KnowledgeEmbeddingProvider;
  model: string;
  dimensions: number;
  values: number[];
}

export interface EmbeddingRequest {
  input: string | string[];
  /** Optional override; otherwise the provider's default model. */
  model?: string;
}

/**
 * A provider that turns text into vectors (Gemini/OpenAI/Voyage/…). NOT
 * implemented in this phase — `embed` throws "not implemented". The interface +
 * registry exist so a future provider drops in with zero platform changes.
 */
export interface EmbeddingProvider {
  provider: KnowledgeEmbeddingProvider;
  defaultModel: string;
  dimensions: number;
  /** True once real generation is wired up. */
  available: boolean;
  embed: (req: EmbeddingRequest) => Promise<EmbeddingVector[]>;
}

// ── Stats (admin dashboard) ──────────────────────────────────

export interface KnowledgeStats {
  totalDocuments: number;
  totalSources: number;
  totalCollections: number;
  pendingEmbeddings: number;
  staleEmbeddings: number;
  readyEmbeddings: number;
  runningJobs: number;
}

// ── Events (published to the Core Event Bus) ─────────────────

export const KNOWLEDGE_EVENTS = {
  SEARCH: 'knowledge:search',
  DOCUMENT_USED: 'knowledge:document_used',
  DOCUMENT_UPDATED: 'knowledge:document_updated',
  DOCUMENT_INDEXED: 'knowledge:document_indexed',
  SYNC_STARTED: 'knowledge:sync_started',
  SYNC_COMPLETED: 'knowledge:sync_completed',
} as const;

export type KnowledgeEventName = (typeof KNOWLEDGE_EVENTS)[keyof typeof KNOWLEDGE_EVENTS];
