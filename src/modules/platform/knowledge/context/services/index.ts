// ==========================================================================
// Context Builder service — composes the pipeline into ONE reusable call.
// buildContext() is PURE + isomorphic (no I/O, no LLM). It is the ONLY source of
// truth for AI context: every future AI provider consumes this, never the
// Retriever directly. Publishes analytics events on the Core Event Bus. A Redis
// cache HOOK is prepared (interface + key builder) but not implemented.
// ==========================================================================

import { platformEvents } from '@/modules/core/events';
import { resolveContextStrategy } from '../strategies';
import { resolveTokenBudget, isContextFeatureEnabled, CONTEXT_CONFIG } from '../config';
import {
  filterDocuments,
  rankDocuments,
  toBlocks,
  deduplicateBlocks,
  compressBlocks,
  enforceTokenBudget,
  buildCitations,
  renderContext,
} from '../builders';
import { estimateTokens, formatCitation, dominantCollection, meanScore } from '../utils';
import { CONTEXT_EVENTS, type ContextRequest, type KnowledgeContext, type ContextCache } from '../types';

/** THE context builder. Retriever results → clean, token-efficient context. */
export function buildContext(request: ContextRequest): KnowledgeContext {
  const strategy = resolveContextStrategy(request.strategy);
  const cfg = strategy.config;

  // Global feature flags can override a strategy (all additive, all configurable).
  const deduplicate = cfg.deduplicate && isContextFeatureEnabled('deduplication');
  const compress = cfg.compress && isContextFeatureEnabled('compression');
  const includeCitations = cfg.includeCitations && isContextFeatureEnabled('citationMode');
  const tokenOptimize = isContextFeatureEnabled('tokenOptimization');

  const documentsIn = request.documents.length;
  const charsIn = request.documents.reduce((s, d) => s + d.document.content.length, 0);

  // ── Pipeline ──────────────────────────────────────────────
  const filtered = filterDocuments(request.documents, cfg);
  const ranked = rankDocuments(filtered, cfg.preferCollections);
  let blocks = toBlocks(ranked);

  const dedup = deduplicateBlocks(blocks, deduplicate);
  blocks = dedup.blocks;

  const comp = compressBlocks(blocks, { ...cfg, compress });
  blocks = comp.blocks;

  const budget = Math.floor(resolveTokenBudget(request.model, request.tokenBudget) * cfg.budgetRatio);
  let budgetTrimmed = false;
  if (tokenOptimize) {
    const r = enforceTokenBudget(blocks, budget);
    blocks = r.blocks;
    budgetTrimmed = r.trimmed;
  }

  const citations = buildCitations(blocks);
  const contextText = renderContext(blocks, citations, includeCitations);

  const charsOut = contextText.length;
  const estimatedTokens = estimateTokens(contextText);
  const confidence = Math.round(meanScore(blocks.map((b) => b.score)) * 1000) / 1000;
  const collection = dominantCollection(citations);
  const trimmed = comp.trimmed || budgetTrimmed;

  const result: KnowledgeContext = {
    context: contextText,
    sources: citations,
    citations: citations.map(formatCitation),
    metadata: {
      strategy: strategy.key,
      mode: request.mode ?? 'keyword',
      citationMode: includeCitations,
      compressed: compress,
      cached: false,
      model: request.model ?? null,
      tokenBudget: budget,
    },
    statistics: {
      documentsIn,
      documentsUsed: blocks.length,
      duplicatesRemoved: dedup.duplicatesRemoved,
      paragraphsRemoved: dedup.paragraphsRemoved,
      charsIn,
      charsOut,
      compressionRatio: charsIn ? Math.round((charsOut / charsIn) * 1000) / 1000 : 1,
      trimmed,
    },
    estimatedTokens,
    language: request.documents[0]?.document.language ?? 'en',
    confidence,
    collection,
  };

  // ── Analytics ─────────────────────────────────────────────
  platformEvents.emit(CONTEXT_EVENTS.BUILT, {
    strategy: strategy.key,
    documentsUsed: blocks.length,
    estimatedTokens,
    collection,
  });
  if (compress && dedup.paragraphsRemoved > 0) {
    platformEvents.emit(CONTEXT_EVENTS.COMPRESSED, {
      paragraphsRemoved: dedup.paragraphsRemoved,
      compressionRatio: result.statistics.compressionRatio,
    });
  }
  if (trimmed) {
    platformEvents.emit(CONTEXT_EVENTS.TRIMMED, { documentsIn, documentsUsed: blocks.length, tokenBudget: budget });
  }

  return result;
}

// ── Redis cache HOOK (prepared, not implemented) ─────────────
const globalRef = globalThis as typeof globalThis & { __jivoContextCache?: ContextCache | null };

export function registerContextCache(cache: ContextCache): void {
  globalRef.__jivoContextCache = cache;
}
export function getContextCache(): ContextCache | null {
  return globalRef.__jivoContextCache ?? null;
}

/** Stable cache key from the request (used once caching is enabled). */
export function contextCacheKey(request: ContextRequest): string {
  const ids = request.documents.map((d) => d.document.id).join(',');
  return `ctx:${request.strategy ?? CONTEXT_CONFIG.defaultStrategy}:${request.model ?? 'default'}:${ids}`;
}

/**
 * Cache-aware build. When `caching` is enabled AND a cache is registered, checks
 * the cache first (CACHE_HIT/MISS events). Otherwise builds directly. Ready for
 * Redis with no code changes — just register a ContextCache implementation.
 */
export async function buildContextCached(request: ContextRequest): Promise<KnowledgeContext> {
  const cache = getContextCache();
  if (isContextFeatureEnabled('caching') && cache) {
    const key = contextCacheKey(request);
    const hit = await cache.get(key);
    if (hit) {
      platformEvents.emit(CONTEXT_EVENTS.CACHE_HIT, { key });
      return { ...hit, metadata: { ...hit.metadata, cached: true } };
    }
    platformEvents.emit(CONTEXT_EVENTS.CACHE_MISS, { key });
    const built = buildContext(request);
    await cache.set(key, built);
    return built;
  }
  return buildContext(request);
}
