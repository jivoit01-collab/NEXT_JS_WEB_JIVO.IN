/**
 * In-memory fixed-window rate limiter — zero external dependencies.
 *
 * HOW IT WORKS
 * ─────────────
 * A module-level Map stores one entry per (limiter-prefix + IP).
 * Each entry tracks the request count and when the current window expires.
 * On the first request in a new window the counter resets to 1.
 * Once the counter reaches the limit, all further requests are rejected
 * until the window expires.
 *
 * WHY THIS IS SAFE FOR YOUR DEPLOYMENT
 * ──────────────────────────────────────
 * Next.js standalone runs as a single Node.js process on your server.
 * Module-level state (this Map) lives for the lifetime of that process,
 * so the counter accumulates correctly across every request.
 *
 * LIMITATION: not suitable for multi-instance / horizontally-scaled
 * deployments — each instance would have its own independent counter.
 * Use a shared Redis-backed limiter if you ever scale out.
 *
 * MEMORY
 * ───────
 * Each entry is ~80 bytes. Even with 10 000 unique IPs the store is < 1 MB.
 * Expired entries are purged lazily (at most once every 10 minutes) so the
 * Map stays small without needing timers or worker threads.
 */

export interface LimitResult {
  /** Whether this request is allowed through. */
  allowed: boolean;
  /** Requests remaining in the current window. */
  remaining: number;
  /** Unix ms timestamp when the current window resets. */
  resetAt: number;
  /** Seconds until the window resets — use as the Retry-After header value. */
  retryAfter: number;
}

interface Entry {
  count: number;
  resetAt: number; // Unix ms
}

const store = new Map<string, Entry>();

// Lazy cleanup — called on every rate-limit check, but only does real work
// once per CLEANUP_INTERVAL to avoid O(n) overhead on every request.
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
let lastCleanedAt = 0;

function maybeCleanup(now: number): void {
  if (now - lastCleanedAt < CLEANUP_INTERVAL_MS) return;
  lastCleanedAt = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

/**
 * Core check — synchronous, O(1) per call (excluding the periodic cleanup pass).
 *
 * @param key        Unique key, e.g. `"auth:192.168.1.1"`
 * @param maxReqs    Maximum requests allowed per window
 * @param windowMs   Window duration in milliseconds
 */
export function checkLimit(key: string, maxReqs: number, windowMs: number): LimitResult {
  const now = Date.now();
  maybeCleanup(now);

  let entry = store.get(key);

  // No entry or window has expired — start a fresh window
  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return { allowed: true, remaining: maxReqs - 1, resetAt: entry.resetAt, retryAfter: 0 };
  }

  // Window is active and limit reached — reject
  if (entry.count >= maxReqs) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  // Window is active, still under limit — increment and allow
  entry.count += 1;
  return {
    allowed: true,
    remaining: maxReqs - entry.count,
    resetAt: entry.resetAt,
    retryAfter: 0,
  };
}

const AUTH_MAX = 5;
const AUTH_WINDOW_MS = 15 * 60 * 1000;

/**
 * Returns true if the IP has exhausted its auth attempts and the block
 * window has not yet expired. Used by middleware to gate /admin access.
 */
export function isAuthBlocked(ip: string): boolean {
  const entry = store.get(`auth:${ip}`);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) return false;
  return entry.count >= AUTH_MAX;
}

/**
 * Pre-configured limiters matching the project's security policy.
 * Call the function with the client IP as the key.
 *
 * @example
 *   const result = localRateLimit.auth('203.0.113.5');
 *   if (!result.allowed) return res.status(429).end();
 */
export const localRateLimit = {
  /** Login brute-force guard: 5 attempts per 15 minutes per IP. */
  auth: (ip: string): LimitResult => checkLimit(`auth:${ip}`, AUTH_MAX, AUTH_WINDOW_MS),

  /** Admin API mutations: 60 requests per minute per IP. */
  admin: (ip: string): LimitResult => checkLimit(`admin:${ip}`, 60, 60 * 1000),

  /** File uploads: 10 per minute per IP. */
  upload: (ip: string): LimitResult => checkLimit(`upload:${ip}`, 10, 60 * 1000),

  /** General API reads: 120 per minute per IP. */
  general: (ip: string): LimitResult => checkLimit(`general:${ip}`, 120, 60 * 1000),
};
