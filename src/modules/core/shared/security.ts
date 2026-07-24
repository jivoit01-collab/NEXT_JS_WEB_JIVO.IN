import { createHash } from 'node:crypto';
import { getClientIpFromHeaders } from '@/lib/admin-ip';

/**
 * Privacy helpers for the analytics platform.
 *
 * RAW IPs ARE NEVER PERSISTED. We store a salted SHA-256 hash so a visitor can
 * be counted/deduplicated without the data becoming personally identifiable.
 * The salt makes the hash non-reversible via rainbow tables and lets us rotate
 * (a new salt anonymises all historical hashes).
 */

/** Stable per-deployment salt. Falls back to AUTH_SECRET so it always has entropy. */
function ipSalt(): string {
  return process.env.ANALYTICS_IP_SALT ?? process.env.AUTH_SECRET ?? 'jivo-analytics-dev-salt';
}

/** SHA-256(salt + ip) — returns null for empty/unknown IPs. */
export function hashIp(ip: string | null | undefined): string | null {
  const value = ip?.trim();
  if (!value || value === 'unknown') return null;
  return createHash('sha256').update(`${ipSalt()}:${value}`).digest('hex');
}

/** Extract the client IP from request headers (proxy-aware) and hash it in one step. */
export function hashedClientIp(headers: Headers): string | null {
  return hashIp(getClientIpFromHeaders(headers));
}

/** Raw client IP — used ONLY as an in-memory rate-limiter key, never stored. */
export function rateLimitKey(headers: Headers): string {
  return getClientIpFromHeaders(headers) ?? 'unknown';
}
