// ==========================================================================
// AI Response utils — pure helpers (client-safe). No I/O, no RNG, no Date.now.
// ==========================================================================

import { RESPONSE_CONFIG } from '../config';

/** Collapse whitespace and trim — used everywhere for safe plain text. */
export function cleanText(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Strip inline markdown/HTML tokens to plain, renderer-safe text. Removes emphasis
 * markers, inline code ticks, image/link syntax (keeping link text), and any raw
 * HTML tags — so no markup reaches a consumer unescaped.
 */
export function stripInlineMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // images → alt
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links → label
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // italic
    .replace(/~~(.*?)~~/g, '$1') // strikethrough
    .replace(/<\/?[a-z][^>]*>/gi, '') // any HTML tag
    .trim();
}

/**
 * Remove inline `[n]` citation markers from DISPLAY text.
 *
 * The model is still asked to emit them: they are how `extractCitations` resolves
 * each claim to a real Knowledge document (title + URL). Extraction therefore runs
 * BEFORE this, and only the user-facing text/blocks are cleaned — provenance
 * survives on `StructuredResponse.citations` for grounding, links and debugging.
 *
 * Handles grouped markers ("[1, 3]", "[2][4]") and tidies the punctuation and
 * spacing the removal leaves behind, so sentences don't end with " ." or double
 * spaces.
 */
export function stripCitationMarkers(text: string): string {
  return text
    .replace(/\s*\[\s*\d{1,3}(?:\s*[,;]\s*\d{1,3})*\s*\]/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+([.,!?;:])/g, '$1')
    .replace(/\(\s*\)/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}

/** Case-insensitive keyword hit count over a lowercased haystack. */
export function countHits(haystackLower: string, keywords: readonly string[]): number {
  let n = 0;
  for (const k of keywords) if (haystackLower.includes(k)) n += 1;
  return n;
}

/** Clamp to 0..1 and round to 2 decimals. */
export function clamp01(n: number): number {
  return Math.round(Math.max(0, Math.min(1, n)) * 100) / 100;
}

/** Is a URL host external to our site? */
export function isExternalHost(href: string): boolean {
  try {
    const url = new URL(href, 'https://jivo.in');
    return !(RESPONSE_CONFIG.internalHosts as readonly string[]).includes(url.host.toLowerCase());
  } catch {
    return false; // relative/malformed → treat as internal
  }
}

/** Derive a stable id from a correlation string (FNV-1a hash, no RNG). */
export function stableId(seed: string | null | undefined): string {
  const s = seed && seed.length ? seed : 'response';
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `resp_${(h >>> 0).toString(16).padStart(8, '0')}`;
}
