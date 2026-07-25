// ==========================================================================
// AI Experience utils — pure helpers (client-safe). No RNG, no Date.now.
// ==========================================================================

import type { StructuredResponse } from '@/modules/platform/response';

/** Derive the intent set the planner reasons over, from the response lead signal. */
export function deriveIntents(response: StructuredResponse, question?: string): Set<string> {
  const intents = new Set<string>(response.lead.reasons);
  if (response.lead.wantsContact) intents.add('contact_intent');
  const q = (question ?? '').toLowerCase();
  if (/\b(how|what|why|when|which|can|do|is)\b/.test(q)) intents.add('question_intent');
  if (response.citations.some((c) => c.entityType.toLowerCase().includes('product'))) intents.add('product_context');
  if (response.citations.length > 0) intents.add('has_sources');
  return intents;
}

/** Stable id from a seed (FNV-1a; no RNG). */
export function stableId(seed: string | null | undefined, salt = ''): string {
  const s = `${seed ?? 'plan'}:${salt}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/** Clamp to 0..1, 2 decimals. */
export function clamp01(n: number): number {
  return Math.round(Math.max(0, Math.min(1, n)) * 100) / 100;
}
