// ==========================================================================
// Context pipeline — modular, pure steps composed by the service:
//   Filter → Rank → Deduplicate → Merge → Compress → Estimate Tokens →
//   Attach Sources → Generate Final Context.
// Each step is a small pure function operating on ContextBlock[] so future steps
// (e.g. semantic compression) drop in without touching the others.
// ==========================================================================

import type { RankedDocument } from '../../types';
import type { KnowledgeCitation, StrategyConfig } from '../types';
import {
  estimateTokens,
  splitParagraphs,
  normalizeForCompare,
  jaccardSimilarity,
  trimToChars,
  formatCitation,
} from '../utils';
import { CONTEXT_CONFIG } from '../config';

/** Internal unit flowing through the pipeline — one retrieved document's text. */
export interface ContextBlock {
  documentId: string;
  entityType: string;
  entityId: string | null;
  collection: string | null;
  title: string;
  url: string | null;
  score: number;
  chunkIndex: number;
  text: string;
}

// 1) Filter — drop low-relevance chunks; cap document count.
export function filterDocuments(
  docs: RankedDocument[],
  cfg: StrategyConfig,
  minScore = CONTEXT_CONFIG.minRelevanceScore,
): RankedDocument[] {
  return docs.filter((d) => d.score >= minScore).slice(0, Math.min(cfg.maxDocuments, CONTEXT_CONFIG.maxDocuments));
}

// 2) Rank — score desc, with a small boost for preferred collections.
export function rankDocuments(docs: RankedDocument[], preferCollections?: string[]): RankedDocument[] {
  const prefer = new Set(preferCollections ?? []);
  const boost = (d: RankedDocument) =>
    d.score + (prefer.size && d.document.collectionId && prefer.has(d.document.collectionId) ? 0.1 : 0);
  return [...docs].sort((a, b) => boost(b) - boost(a));
}

// Map to internal blocks (Merge input).
export function toBlocks(docs: RankedDocument[]): ContextBlock[] {
  return docs.map((d) => ({
    documentId: d.document.id,
    entityType: d.document.entityType,
    entityId: d.document.entityId,
    collection: d.document.collectionId,
    title: d.document.title,
    url: d.document.url,
    score: d.score,
    chunkIndex: d.document.chunkIndex,
    text: d.document.content,
  }));
}

// 3) Deduplicate — drop exact/near-duplicate paragraphs GLOBALLY across blocks.
export function deduplicateBlocks(
  blocks: ContextBlock[],
  enabled: boolean,
  threshold = CONTEXT_CONFIG.dedupeSimilarityThreshold,
): { blocks: ContextBlock[]; duplicatesRemoved: number; paragraphsRemoved: number } {
  if (!enabled) return { blocks, duplicatesRemoved: 0, paragraphsRemoved: 0 };

  const keptNorms = new Set<string>();
  const keptParas: string[] = [];
  let paragraphsRemoved = 0;
  const out: ContextBlock[] = [];

  for (const b of blocks) {
    const survive: string[] = [];
    for (const p of splitParagraphs(b.text)) {
      const norm = normalizeForCompare(p);
      if (!norm) {
        paragraphsRemoved++;
        continue;
      }
      const dup = keptNorms.has(norm) || keptParas.some((k) => jaccardSimilarity(k, p) >= threshold);
      if (dup) {
        paragraphsRemoved++;
        continue;
      }
      keptNorms.add(norm);
      keptParas.push(p);
      survive.push(p);
    }
    if (survive.length) out.push({ ...b, text: survive.join('\n\n') });
  }
  return { blocks: out, duplicatesRemoved: blocks.length - out.length, paragraphsRemoved };
}

// 4) Compress / trim each block to the strategy's per-doc cap.
export function compressBlocks(
  blocks: ContextBlock[],
  cfg: StrategyConfig,
): { blocks: ContextBlock[]; trimmed: boolean } {
  if (!cfg.compress) return { blocks, trimmed: false };
  let trimmed = false;
  const out = blocks.map((b) => {
    const r = trimToChars(b.text, cfg.maxCharsPerDoc);
    if (r.trimmed) trimmed = true;
    return { ...b, text: r.text };
  });
  return { blocks: out, trimmed };
}

// 5) Estimate tokens for the whole block set.
export function estimateBlockTokens(blocks: ContextBlock[]): number {
  return blocks.reduce((sum, b) => sum + estimateTokens(`${b.title}\n${b.text}`), 0);
}

// 6) Enforce the token budget — drop the lowest-relevance blocks until under budget.
export function enforceTokenBudget(
  blocks: ContextBlock[],
  budgetTokens: number,
): { blocks: ContextBlock[]; trimmed: boolean } {
  if (estimateBlockTokens(blocks) <= budgetTokens) return { blocks, trimmed: false };
  const ordered = [...blocks].sort((a, b) => b.score - a.score);
  const kept: ContextBlock[] = [];
  let total = 0;
  for (const b of ordered) {
    const t = estimateTokens(`${b.title}\n${b.text}`);
    if (total + t > budgetTokens && kept.length > 0) continue;
    kept.push(b);
    total += t;
  }
  return { blocks: kept, trimmed: kept.length < blocks.length };
}

// 7) Attach sources — build 1-based citations aligned to the final block order.
export function buildCitations(blocks: ContextBlock[]): KnowledgeCitation[] {
  return blocks.map((b, i) => ({
    index: i + 1,
    documentId: b.documentId,
    entityType: b.entityType,
    entityId: b.entityId,
    collection: b.collection,
    title: b.title,
    url: b.url,
    relevanceScore: Math.round(b.score * 1000) / 1000,
    chunkIndex: b.chunkIndex,
  }));
}

// 8) Generate the final prompt-ready context string.
export function renderContext(
  blocks: ContextBlock[],
  citations: KnowledgeCitation[],
  includeCitations: boolean,
): string {
  const body = blocks
    .map((b, i) => (includeCitations ? `[${i + 1}] ${b.title}\n${b.text}` : `${b.title}\n${b.text}`))
    .join('\n\n');
  if (!includeCitations) return body;
  const sources = citations.map(formatCitation).join('\n');
  return `${body}\n\nSources:\n${sources}`;
}
