// ==========================================================================
// Prompt Builder utils — pure helpers (client-safe).
// ==========================================================================

import { PROMPT_CONFIG } from '../config';

/** Estimate tokens from characters (model-agnostic ratio). */
export function estimateTokens(text: string, charsPerToken = PROMPT_CONFIG.charsPerToken): number {
  return Math.ceil(text.length / charsPerToken);
}

/** Interpolate `{{key}}` placeholders. Unknown keys are left blank. */
export function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => vars[key] ?? '');
}

/** Join non-empty section parts with blank lines. */
export function joinSections(parts: (string | null | undefined)[]): string {
  return parts.map((p) => p?.trim()).filter(Boolean).join('\n\n');
}

/** Trim text to a token budget (at a line/word boundary). Returns {text, truncated}. */
export function trimToTokens(text: string, maxTokens: number): { text: string; truncated: boolean } {
  const maxChars = maxTokens * PROMPT_CONFIG.charsPerToken;
  if (text.length <= maxChars) return { text, truncated: false };
  const slice = text.slice(0, maxChars);
  const brk = Math.max(slice.lastIndexOf('\n'), slice.lastIndexOf('. '), slice.lastIndexOf(' '));
  const cut = brk > maxChars * 0.6 ? brk : maxChars;
  return { text: `${slice.slice(0, cut).trimEnd()}…`, truncated: true };
}
