// ==========================================================================
// AI Gateway API — types (the contract).
//
// The SINGLE server entry point for every AI request, from any client (web,
// mobile, admin, WhatsApp). It authenticates, validates, rate-limits, runs the
// FULL pipeline once (Conversation → Knowledge → Context → Prompt → Provider →
// Response → Experience) and returns ONE structured response. It owns the
// pipeline; other surfaces (chat action, future route handlers) delegate to it —
// so business logic is never duplicated.
// ==========================================================================

import type { StructuredResponse } from '@/modules/platform/response';
import type { ExperiencePlan } from '@/modules/platform/experience';

/** Where the request came from — lets rules/limits differ per surface. */
export type GatewayChannel = 'web' | 'mobile' | 'admin' | 'whatsapp' | 'api';

/** The resolved caller identity (authenticated user and/or anonymous visitor). */
export interface GatewayIdentity {
  userId: string | null;
  visitorId: string | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  /** Opaque key used for rate limiting (never persisted raw). */
  rateKey: string;
}

/** Input to the gateway. `signal` enables request cancellation. */
export interface AIGatewayRequest {
  question: string;
  /** Continue an existing conversation, or omit to start one. */
  conversationId?: string;
  channel?: GatewayChannel;
  /** Client-supplied identity hints (validated/merged with the auth session). */
  visitorId?: string;
  sessionId?: string;
  language?: string;
  /** Prompt template + provider overrides (optional). */
  templateId?: string;
  provider?: string;
  /** Skip knowledge retrieval for this turn (small talk). */
  skipKnowledge?: boolean;
  /** Cancellation. */
  signal?: AbortSignal;
  /** Request headers (for IP-based rate limiting when there's no session). */
  headers?: Headers;
}

/** The ONE structured response object every client receives. */
export interface AIGatewayResponse {
  ok: true;
  conversationId: string;
  /** The stored assistant message. */
  message: {
    id: string;
    role: 'assistant';
    content: string;
    createdAt: string | null;
  };
  /** Full analysis of the answer (citations, entities, lead, validation, …). */
  structured: StructuredResponse;
  /** UI experience plan (cards) — clients may ignore it. */
  experience: ExperiencePlan | null;
  meta: {
    channel: GatewayChannel;
    provider: string;
    fromFallback: boolean;
    responseTimeMs: number;
    fromCacheOrFallbackMessage: boolean; // true when the provider was unavailable
    correlationId: string;
  };
}

/** A uniform error envelope (never leaks internals). */
export interface AIGatewayError {
  ok: false;
  code: 'unauthorized' | 'invalid_input' | 'rate_limited' | 'cancelled' | 'unavailable' | 'error';
  message: string;
  retryAfterMs?: number;
}

export type AIGatewayResult = AIGatewayResponse | AIGatewayError;

/** One streamed gateway event (streaming-ready; wraps provider deltas). */
export interface AIGatewayStreamEvent {
  type: 'delta' | 'done' | 'error';
  conversationId: string;
  delta?: string;
  /** Present on the terminal `done` event. */
  final?: AIGatewayResponse;
  error?: string;
}

// ── Events (Core Event Bus — gateway analytics) ──────────────
export const GATEWAY_EVENTS = {
  REQUEST: 'ai:gateway_request',
  AUTHENTICATED: 'ai:gateway_authenticated',
  RATE_LIMITED: 'ai:gateway_rate_limited',
  COMPLETED: 'ai:gateway_completed',
  CANCELLED: 'ai:gateway_cancelled',
  FAILED: 'ai:gateway_failed',
  STREAM_STARTED: 'ai:gateway_stream_started',
} as const;

export type GatewayEventName = (typeof GATEWAY_EVENTS)[keyof typeof GATEWAY_EVENTS];
