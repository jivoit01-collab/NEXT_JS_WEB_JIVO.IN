import 'server-only';

// ==========================================================================
// Search — keyword (working today), semantic + hybrid + vector (prepared).
//
// Every strategy implements SearchEngine, so the retriever / any AI feature is
// mode-agnostic. Until embeddings land, `semantic` and `hybrid` transparently
// FALL BACK to keyword (feature-flagged) — callers keep working, and flipping
// KNOWLEDGE_FEATURES.vectorSearch later upgrades them with no API change.
// ==========================================================================

import { keywordSearchDocuments, searchTerms } from '../data';
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
  let base = Math.min(1, hits / terms.length);

  // "Jivo" is in EVERY product title, so a brand-only query ("tell me about
  // Jivo") scored every product 1.00 and the company/story pages never surfaced.
  // Ignore the brand token when judging title relevance: a title only counts as
  // a real match if it shares a DISTINGUISHING term with the query.
  const distinguishing = terms.filter((t) => t !== 'jivo');
  if (distinguishing.length > 0) {
    const titleMatches = distinguishing.filter((t) => title.includes(t)).length;
    if (titleMatches === 0) base *= 0.7; // nothing specific in the title
    else base = Math.min(1, base + 0.15 * titleMatches); // genuinely on-topic
  }

  // The contact record has no page to link to, so it should only win when the
  // user actually asked about contacting Jivo — otherwise it crowds out a real
  // page and the answer ends up with no card at all.
  const isContactDoc = !doc.url && /contact/i.test(doc.title);
  if (isContactDoc && !terms.some((t) => /contact|phone|email|address|support|reach/.test(t))) {
    base *= 0.4;
  }

  if (distinguishing.length === 0 && terms.includes('jivo')) {
    // Brand-ONLY query ("tell me about Jivo"): the user wants the COMPANY, not a
    // product that merely carries the brand in its name. Demote products and
    // promote the company/story pages so an About-style page wins.
    const isProduct = doc.entityType.toLowerCase().includes('product');
    if (isProduct) base *= 0.4;
    else if (doc.url?.startsWith('/our-essence')) base = Math.min(1, base + 0.4);
  }

  // Prefer a SPECIFIC page over a broad landing page. The home page mentions
  // every product, so it matches most queries and used to out-rank the actual
  // "Canola Oil" page — sending "tell me about Canola Oil" to "Home". A small
  // penalty keeps it available without letting it win against a dedicated page.
  const isLanding = doc.url === '/' || doc.url === '';
  return isLanding ? base * 0.6 : base;
}

/** Over-fetch factor: rank a wider candidate pool than we return, so the best
 *  match wins even when many documents contain one of the query's terms. */
const CANDIDATE_MULTIPLIER = 5;

async function runKeyword(q: SearchQuery): Promise<KnowledgeSearchResult> {
  const started = Date.now();
  const limit = Math.min(q.limit ?? KNOWLEDGE_CONFIG.pageSize, KNOWLEDGE_CONFIG.maxPageSize);
  const offset = q.offset ?? 0;
  // Score on the SAME meaningful terms the query filtered on, so stopwords
  // ("what", "your") can't dilute a document's relevance score.
  const terms = searchTerms(q.query);

  const poolSize = Math.min(limit * CANDIDATE_MULTIPLIER, KNOWLEDGE_CONFIG.maxPageSize);
  const { rows, total } = await keywordSearchDocuments(q.query, q.filters, poolSize, offset);
  const results: RankedDocument[] = rows
    .map((document) => ({ document, score: scoreDoc(document, terms), matchedBy: 'keyword' as SearchMode }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

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
