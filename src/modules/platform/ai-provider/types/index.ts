// ==========================================================================
// AI Provider Platform — types (the contract).
//
// The ONLY module allowed to talk to external AI APIs. It separates the provider
// INTERFACE (this file) from provider IMPLEMENTATIONS (adapters/*). It consumes a
// provider-neutral BuiltPrompt from the Prompt Builder; it never builds prompts,
// retrieves knowledge or renders chat UI. Streaming-ready by design.
// ==========================================================================

import type { BuiltPrompt } from '@/modules/platform/prompt';

/** Token accounting for one call. */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/** A request to a provider — carries the assembled prompt, not raw strings. */
export interface AIRequest {
  prompt: BuiltPrompt;
  /** Model id override (else the provider's default). */
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  /** Per-call timeout (ms) override. */
  timeoutMs?: number;
  /** Caller cancellation (wired through to fetch). */
  signal?: AbortSignal;
  /** Correlation for analytics (e.g. conversationId). */
  correlationId?: string;
}

/** A completed (non-streamed) provider response. */
export interface AIResponse {
  provider: string;
  model: string;
  text: string;
  usage: TokenUsage;
  /** Wall-clock latency in ms. */
  responseTimeMs: number;
  finishReason: 'stop' | 'length' | 'cancelled' | 'error' | 'unknown';
  /** True when a fallback provider produced this. */
  fromFallback: boolean;
  raw?: unknown;
}

/** One streamed delta. Streaming-ready even though no UI consumes it yet. */
export interface AIStreamChunk {
  provider: string;
  model: string;
  delta: string;
  done: boolean;
  usage?: TokenUsage;
}

/** Circuit-breaker state per provider. */
export type CircuitState = 'closed' | 'open' | 'half-open';

/** Live provider health + metrics (in-memory; a dashboard reads this). */
export interface ProviderHealth {
  provider: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  circuit: CircuitState;
  availability: number; // 0..1 success ratio
  avgResponseTimeMs: number;
  lastLatencyMs: number | null;
  totalCalls: number;
  totalErrors: number;
  totalTokens: number;
  dailyTokens: number;
  timeoutCount: number;
  fallbackCount: number;
  successRate: number; // 0..1
  failureRate: number; // 0..1
  lastError: string | null;
  lastCallAt: string | null;
  configured: boolean; // has an API key / is usable
}

/** Static provider capabilities/metadata (for the registry + dashboard). */
export interface ProviderInfo {
  name: string;
  label: string;
  defaultModel: string;
  models: string[];
  streaming: boolean;
  /** false = stub/prepared, not yet implemented. */
  implemented: boolean;
}

/**
 * The provider INTERFACE. An adapter implements this; the platform wraps every
 * call with retries/timeout/cancellation/health tracking. `stream` is optional
 * so a provider can be added before it supports streaming.
 */
export interface AIProvider {
  readonly info: ProviderInfo;
  /** Is this provider usable right now (API key present, etc.)? */
  isConfigured(): boolean;
  generate(request: AIRequest): Promise<AIResponse>;
  stream?(request: AIRequest): AsyncIterable<AIStreamChunk>;
}

// ── Events (Core Event Bus — provider analytics) ─────────────
export const PROVIDER_EVENTS = {
  REQUESTED: 'ai:provider_requested',
  SUCCEEDED: 'ai:provider_succeeded',
  FAILED: 'ai:provider_failed',
  RETRIED: 'ai:provider_retried',
  TIMED_OUT: 'ai:provider_timed_out',
  CANCELLED: 'ai:provider_cancelled',
  FELL_BACK: 'ai:provider_fell_back',
  CIRCUIT_OPENED: 'ai:provider_circuit_opened',
  CIRCUIT_CLOSED: 'ai:provider_circuit_closed',
} as const;

export type ProviderEventName = (typeof PROVIDER_EVENTS)[keyof typeof PROVIDER_EVENTS];

/** Thrown by adapters; carries whether a retry/fallback makes sense. */
export class AIProviderError extends Error {
  constructor(
    message: string,
    readonly provider: string,
    readonly retryable = false,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}
