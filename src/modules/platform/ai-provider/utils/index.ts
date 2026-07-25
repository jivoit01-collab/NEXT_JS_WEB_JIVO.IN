// ==========================================================================
// AI Provider utils — pure helpers (client-safe).
// ==========================================================================

import { PROVIDER_CONFIG } from '../config';
import type { TokenUsage } from '../types';

/** Rough token estimate (model-agnostic) — used when a provider omits usage. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function makeUsage(promptText: string, completionText: string, reported?: Partial<TokenUsage>): TokenUsage {
  const promptTokens = reported?.promptTokens ?? estimateTokens(promptText);
  const completionTokens = reported?.completionTokens ?? estimateTokens(completionText);
  return {
    promptTokens,
    completionTokens,
    totalTokens: reported?.totalTokens ?? promptTokens + completionTokens,
  };
}

/** Exponential backoff with full jitter — deterministic-ish (index-based, no RNG). */
export function backoffDelay(attempt: number): number {
  const exp = PROVIDER_CONFIG.retryBaseDelayMs * 2 ** attempt;
  const capped = Math.min(exp, PROVIDER_CONFIG.retryMaxDelayMs);
  // Jitter derived from attempt (no Math.random — keeps builds/replays stable).
  const jitter = (capped / 4) * ((attempt % 3) / 2);
  return Math.round(capped - jitter);
}

/** Exponential moving average for latency smoothing. */
export function ema(prev: number | null, next: number, alpha = PROVIDER_CONFIG.latencyEmaAlpha): number {
  if (prev === null) return next;
  return Math.round(prev * (1 - alpha) + next * alpha);
}

/** Await a delay that also rejects if the signal aborts. */
export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(t);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}
