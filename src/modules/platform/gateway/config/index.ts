// ==========================================================================
// AI Gateway configuration — flags, rate limits, timeouts. Client-safe.
// ==========================================================================

import type { GatewayChannel } from '../types';

export const GATEWAY_FEATURES = {
  gateway: true,
  authentication: true,
  validation: true,
  rateLimiting: true,
  cancellation: true,
  analytics: true,

  // Prepared, off until wired.
  streaming: false, // executeStream is READY; provider streaming lands later
  caching: false, // response cache hooks (future)
  perUserQuotas: false, // daily quotas per authenticated user
} as const;

export type GatewayFeature = keyof typeof GATEWAY_FEATURES;

export function isGatewayFeatureEnabled(feature: GatewayFeature): boolean {
  return GATEWAY_FEATURES[feature] === true;
}

/** Sliding-window rate limit per channel: `limit` requests per `windowMs`. */
export const RATE_LIMITS: Record<GatewayChannel, { limit: number; windowMs: number }> = {
  web: { limit: 20, windowMs: 60_000 },
  mobile: { limit: 30, windowMs: 60_000 },
  admin: { limit: 120, windowMs: 60_000 },
  whatsapp: { limit: 15, windowMs: 60_000 },
  api: { limit: 60, windowMs: 60_000 },
};

export const GATEWAY_CONFIG = {
  defaultChannel: 'web' as GatewayChannel,
  /** Max question length accepted. */
  maxQuestionLength: 4000,
  /** Overall per-request timeout (ms) — provider has its own inner timeout too. */
  requestTimeoutMs: 45_000,
  /** Friendly message when no AI provider is configured/available. */
  unavailableMessage:
    'Thanks for your message! Our AI assistant is being set up right now. ' +
    'Please reach out to our team and we’ll help you directly.',
} as const;
