import 'server-only';

// ==========================================================================
// Search — keyword (working today), semantic + hybrid + vector (prepared).
//
// Every strategy implements SearchEngine, so the retriever / any AI feature is
// mode-agnostic. Until embeddings land, `semantic` and `hybrid` transparently
// FALL BACK to keyword (feature-flagged) — callers keep working, and flipping
// KNOWLEDGE_FEATURES.vectorSearch later upgrades them with no API change.
// ==========================================================================

import { keywordSearchDocuments } from '../data';
import { isKnowledgeFeatureEnabled, KNOWLEDGE_CONFIG } from '../config';
import type {
  KnowledgeSearchResult,
  RankedDocument,
  SearchEngine,
  SearchMode,
  SearchQuery,
  KnowledgeDocumentDTO,
} from '../types';

/** Lightweight keyword relevance: term coverage with a title boost (0..1). */
function scoreDoc(doc: KnowledgeDocumentDTO, terms: string[]): number {
  if (terms.length === 0) return 0.5;
  const title = doc.title.toLowerCase();
  const content = doc.content.toLowerCase();
  let hits = 0;
  for (const t of terms) {
    if (title.includes(t)) hits += 1;
    else if (content.includes(t)) hits += 0.5;
  }
  return Math.min(1, hits / terms.length);
}

async function runKeyword(q: SearchQuery): Promise<KnowledgeSearchResult> {
  const started = Date.now();
  const limit = Math.min(q.limit ?? KNOWLEDGE_CONFIG.pageSize, KNOWLEDGE_CONFIG.maxPageSize);
  const offset = q.offset ?? 0;
  const terms = q.query.toLowerCase().split(/\s+/).filter(Boolean);

  const { rows, total } = await keywordSearchDocuments(q.query, q.filters, limit, offset);
  const results: RankedDocument[] = rows
    .map((document) => ({ document, score: scoreDoc(document, terms), matchedBy: 'keyword' as SearchMode }))
    .sort((a, b) => b.score - a.score);

  return { query: q.query, mode: 'keyword', total, results, tookMs: Date.now() - started };
}

export const keywordSearchEngine: SearchEngine = { mode: 'keyword', search: runKeyword };

/**
 * Semantic engine — PREPARED. When KNOWLEDGE_FEATURES.vectorSearch is on and
 * embeddings exist, this will run cosine ANN over KnowledgeEmbedding. Until then
 * it falls back to keyword so the platform stays functional.
 */
export const semanticSearchEngine: SearchEngine = {
  mode: 'semantic',
  async search(q) {
    if (!isKnowledgeFeatureEnabled('vectorSearch')) {
      const r = await runKeyword(q);
      return { ...r, mode: 'semantic' };
    }
    // Future: embed(q.query) → cosine over KnowledgeEmbedding vectors.
    const r = await runKeyword(q);
    return { ...r, mode: 'semantic' };
  },
};

/** Hybrid engine — PREPARED. Fuses keyword + semantic (weighted). Falls back to keyword. */
export const hybridSearchEngine: SearchEngine = {
  mode: 'hybrid',
  async search(q) {
    if (!isKnowledgeFeatureEnabled('hybridSearch')) {
      const r = await runKeyword(q);
      return { ...r, mode: 'hybrid' };
    }
    // Future: fuse keyword + semantic scores by KNOWLEDGE_CONFIG.hybridSemanticWeight.
    const r = await runKeyword(q);
    return { ...r, mode: 'hybrid' };
  },
};

const engines: Record<SearchMode, SearchEngine> = {
  keyword: keywordSearchEngine,
  semantic: semanticSearchEngine,
  hybrid: hybridSearchEngine,
};

/** THE entry point. Picks the engine by mode (default from config). */
export async function search(q: SearchQuery): Promise<KnowledgeSearchResult> {
  const mode = q.mode ?? KNOWLEDGE_CONFIG.defaultSearchMode;
  return engines[mode].search({ ...q, mode });
}
