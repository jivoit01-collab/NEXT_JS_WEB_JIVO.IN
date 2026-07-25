import 'server-only';

// ==========================================================================
// Identity resolver — authenticate the caller. Prefers the NextAuth session
// (authenticated user); falls back to the client-supplied visitor id (anonymous
// but consented). Produces a rate-limit key that NEVER exposes a raw IP when a
// stable id exists. Reuses the Auth Platform + core security helpers — no new
// auth logic.
// ==========================================================================

import { auth } from '@/lib/auth';
import { hashedClientIp, rateLimitKey } from '@/modules/core/shared/security';
import type { AIGatewayRequest, GatewayIdentity } from '../types';

/** Resolve the caller's identity for a gateway request. */
export async function resolveIdentity(request: AIGatewayRequest): Promise<GatewayIdentity> {
  let userId: string | null = null;
  try {
    const session = await auth();
    userId = (session?.user as { id?: string } | undefined)?.id ?? null;
  } catch {
    userId = null; // no session context (e.g. a stateless API call) → visitor path
  }

  const visitorId = request.visitorId ?? null;
  const sessionId = request.sessionId ?? null;

  // Rate key preference: user → visitor → hashed IP → raw IP (last resort).
  const rateKey =
    (userId && `u:${userId}`) ||
    (visitorId && `v:${visitorId}`) ||
    (request.headers && hashedClientIp(request.headers) && `ip:${hashedClientIp(request.headers)}`) ||
    (request.headers && `ip:${rateLimitKey(request.headers)}`) ||
    'anon';

  return {
    userId,
    visitorId,
    sessionId,
    isAuthenticated: Boolean(userId),
    rateKey,
  };
}
