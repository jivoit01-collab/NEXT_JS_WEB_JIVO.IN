import type { FeedbackSentiment, FeedbackType } from '../types';

/**
 * Derive sentiment from a 1–5 rating (and/or explicit type). Pure + reusable.
 *   >= 4 → POSITIVE · 3 → NEUTRAL · <= 2 → NEGATIVE
 * BUG reports default to NEGATIVE when unrated; FEATURE to NEUTRAL.
 */
export function deriveSentiment(
  rating: number | null | undefined,
  type?: FeedbackType,
): FeedbackSentiment | null {
  if (typeof rating === 'number' && Number.isFinite(rating)) {
    if (rating >= 4) return 'POSITIVE';
    if (rating === 3) return 'NEUTRAL';
    return 'NEGATIVE';
  }
  if (type === 'BUG') return 'NEGATIVE';
  if (type === 'FEATURE') return 'NEUTRAL';
  return null;
}

/** Human label for an enum-ish value (e.g. IN_PROGRESS → "In progress"). */
export function humanizeEnum(value: string | null | undefined): string {
  if (!value) return '—';
  return value
    .toLowerCase()
    .split('_')
    .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}
