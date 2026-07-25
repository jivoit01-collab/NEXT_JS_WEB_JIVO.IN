// ==========================================================================
// Rate limiter — in-memory sliding window per (channel, identity). globalThis
// singleton so it survives HMR. A future Redis-backed limiter can replace this
// with the same `checkRateLimit` signature — callers don't change. `nowMs` is
// injected so the core stays clock-free/testable.
// ==========================================================================

import { RATE_LIMITS } from '../config';
import type { GatewayChannel } from '../types';

interface Window {
  /** Timestamps (ms) of requests still inside the window. */
  hits: number[];
}

type Store = Map<string, Window>;
const KEY = '__jivo_gateway_ratelimit__';
function store(): Store {
  const g = globalThis as Record<string, unknown>;
  if (!g[KEY]) g[KEY] = new Map<string, Window>();
  return g[KEY] as Store;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * Sliding-window check. Records the hit when allowed. `nowMs` is the caller's
 * clock (Date.now() at the app boundary).
 */
export function checkRateLimit(channel: GatewayChannel, identityKey: string, nowMs: number): RateLimitResult {
  const { limit, windowMs } = RATE_LIMITS[channel] ?? RATE_LIMITS.web;
  const key = `${channel}:${identityKey}`;
  const s = store();
  const win = s.get(key) ?? { hits: [] };

  // Drop hits outside the window.
  const cutoff = nowMs - windowMs;
  win.hits = win.hits.filter((t) => t > cutoff);

  if (win.hits.length >= limit) {
    const oldest = win.hits[0];
    const retryAfterMs = Math.max(0, oldest + windowMs - nowMs);
    s.set(key, win);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  win.hits.push(nowMs);
  s.set(key, win);
  return { allowed: true, remaining: Math.max(0, limit - win.hits.length), retryAfterMs: 0 };
}
