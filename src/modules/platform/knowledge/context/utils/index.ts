// ==========================================================================
// Context Builder utils — pure, reusable, allocation-conscious helpers.
// Token estimation, paragraph splitting, near-duplicate detection, trimming,
// and citation formatting. No LLM, no I/O.
// ==========================================================================

import { CONTEXT_CONFIG } from '../config';
import type { KnowledgeCitation } from '../types';

/** Estimate tokens from characters (model-agnostic; override the ratio per model later). */
export function estimateTokens(text: string, charsPerToken = CONTEXT_CONFIG.charsPerToken): number {
  return Math.ceil(text.length / charsPerToken);
}

/** Split text into trimmed, non-empty paragraphs. */
export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}|(?<=[.!?])\s{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Normalize a paragraph for comparison (lowercase, collapse whitespace, drop punctuation). */
export function normalizeForCompare(p: string): string {
  return p.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Jaccard similarity over word sets (0..1) — cheap near-duplicate signal. */
export function jaccardSimilarity(a: string, b: string): number {
  const sa = new Set(normalizeForCompare(a).split(' '));
  const sb = new Set(normalizeForCompare(b).split(' '));
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const w of sa) if (sb.has(w)) inter++;
  return inter / (sa.size + sb.size - inter);
}

/**
 * Remove exact + near-duplicate paragraphs, preserving first-seen order. Returns
 * the deduped list plus how many were dropped. O(n·k) where k = kept size — fine
 * for the small paragraph counts a single context holds.
 */
export function dedupeParagraphs(
  paragraphs: string[],
  threshold = CONTEXT_CONFIG.dedupeSimilarityThreshold,
): { kept: string[]; removed: number } {
  const kept: string[] = [];
  const seenExact = new Set<string>();
  let removed = 0;

  for (const p of paragraphs) {
    const norm = normalizeForCompare(p);
    if (!norm) {
      removed++;
      continue;
    }
    if (seenExact.has(norm)) {
      removed++;
      continue;
    }
    const near = kept.some((k) => jaccardSimilarity(k, p) >= threshold);
    if (near) {
      removed++;
      continue;
    }
    seenExact.add(norm);
    kept.push(p);
  }
  return { kept, removed };
}

/** Trim text to a max character length at a sentence/word boundary (no mid-word cut). */
export function trimToChars(text: string, maxChars: number): { text: string; trimmed: boolean } {
  if (text.length <= maxChars) return { text, trimmed: false };
  const slice = text.slice(0, maxChars);
  const brk = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('\n'), slice.lastIndexOf(' '));
  const cut = brk > maxChars * 0.5 ? brk : maxChars;
  return { text: `${slice.slice(0, cut).trimEnd()}…`, trimmed: true };
}

/** Human-readable citation line for a future "Sources" UI. */
export function formatCitation(c: KnowledgeCitation): string {
  const where = c.url ? ` — ${c.url}` : c.collection ? ` — ${c.collection}` : '';
  return `[${c.index}] ${c.title}${where}`;
}

/** The most common collection among citations (context's dominant topic), or null. */
export function dominantCollection(citations: KnowledgeCitation[]): string | null {
  const counts = new Map<string, number>();
  for (const c of citations) {
    if (!c.collection) continue;
    counts.set(c.collection, (counts.get(c.collection) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestN = 0;
  for (const [k, n] of counts) {
    if (n > bestN) {
      best = k;
      bestN = n;
    }
  }
  return best;
}

/** Mean relevance of a set of scores (0..1) — the context's confidence. */
export function meanScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((s, v) => s + v, 0) / scores.length;
}
