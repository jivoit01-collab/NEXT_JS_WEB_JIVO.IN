// ==========================================================================
// AI Gateway utils — pure, client-safe helpers.
// ==========================================================================

import type { AIGatewayError } from '../types';

/** Build a uniform error envelope. */
export function gatewayError(
  code: AIGatewayError['code'],
  message: string,
  retryAfterMs?: number,
): AIGatewayError {
  return { ok: false, code, message, retryAfterMs };
}

/** Stable correlation id from identity + conversation (FNV-1a; no RNG). */
export function correlationId(seed: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `gw_${(h >>> 0).toString(16).padStart(8, '0')}`;
}

/** Narrow a result to the success shape. */
export function isGatewaySuccess<T extends { ok: boolean }>(r: T): r is Extract<T, { ok: true }> {
  return r.ok === true;
}
