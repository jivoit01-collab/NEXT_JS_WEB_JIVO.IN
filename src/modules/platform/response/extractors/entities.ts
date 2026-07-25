// ==========================================================================
// Entity extractor — pull emails, phones, URLs, money and dates from the text.
// Pure regex, provider-independent. Values are de-duplicated and normalized.
// ==========================================================================

import type { ResponseEntity, EntityKind } from '../types';

const PATTERNS: { kind: EntityKind; re: RegExp; normalize: (v: string) => string }[] = [
  { kind: 'email', re: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, normalize: (v) => v.toLowerCase() },
  { kind: 'url', re: /https?:\/\/[^\s)<>"']+/gi, normalize: (v) => v.replace(/[.,)]+$/, '') },
  // Phone: +country, spaces/dashes, 7–14 digits total.
  { kind: 'phone', re: /(?:\+?\d[\d\s-]{6,14}\d)/g, normalize: (v) => v.replace(/[^\d+]/g, '') },
  { kind: 'money', re: /(?:₹|Rs\.?|INR|\$|USD)\s?\d[\d,]*(?:\.\d{1,2})?/gi, normalize: (v) => v.replace(/\s+/g, ' ').trim() },
  { kind: 'date', re: /\b\d{4}-\d{2}-\d{2}\b/g, normalize: (v) => v },
];

export function extractEntities(text: string): ResponseEntity[] {
  const out: ResponseEntity[] = [];
  const seen = new Set<string>();

  for (const { kind, re, normalize } of PATTERNS) {
    for (const m of text.matchAll(re)) {
      const value = m[0];
      const normalized = normalize(value);
      // Guard: a "phone" must have >= 7 digits (avoids matching money/dates).
      if (kind === 'phone' && normalized.replace(/\D/g, '').length < 7) continue;
      const key = `${kind}:${normalized}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ kind, value, normalized });
    }
  }
  return out;
}
