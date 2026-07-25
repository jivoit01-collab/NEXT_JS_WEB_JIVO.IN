// ==========================================================================
// Knowledge utils — pure, dependency-light helpers (client-safe).
// ==========================================================================

import { KNOWLEDGE_CONFIG } from '../config';

/** Turn an ENUM_VALUE into "Enum value" for display. */
export function humanizeEnum(value: string): string {
  const s = value.replace(/_/g, ' ').toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Strip HTML/markdown noise to plain searchable text. */
export function toPlainText(input: string): string {
  return input
    .replace(/<[^>]+>/g, ' ') // tags
    .replace(/[#*_`>[\]]+/g, ' ') // markdown
    .replace(/\s+/g, ' ')
    .trim();
}

/** Cheap, stable token estimate (~4 chars/token) — good enough for budgeting. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Deterministic content hash (FNV-1a, 32-bit hex). Used to detect content change
 * so the indexer can mark an embedding STALE without a crypto dependency.
 */
export function contentHash(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/**
 * Split long content into overlapping chunks (each becomes one KnowledgeDocument).
 * Splits on paragraph/sentence boundaries where possible to keep chunks coherent.
 */
export function chunkText(
  text: string,
  size = KNOWLEDGE_CONFIG.chunkSize,
  overlap = KNOWLEDGE_CONFIG.chunkOverlap,
): string[] {
  const clean = toPlainText(text);
  if (clean.length <= size) return clean ? [clean] : [];

  const chunks: string[] = [];
  let start = 0;
  while (start < clean.length) {
    let end = Math.min(start + size, clean.length);
    if (end < clean.length) {
      // Prefer to break at the last sentence/space within the window.
      const slice = clean.slice(start, end);
      const brk = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('\n'), slice.lastIndexOf(' '));
      if (brk > size * 0.5) end = start + brk + 1;
    }
    chunks.push(clean.slice(start, end).trim());
    if (end >= clean.length) break;
    start = end - overlap;
  }
  return chunks.filter(Boolean);
}

/** First N characters as a plain-text excerpt. */
export function makeExcerpt(text: string, length = 200): string {
  const clean = toPlainText(text);
  return clean.length <= length ? clean : `${clean.slice(0, length).trimEnd()}…`;
}
