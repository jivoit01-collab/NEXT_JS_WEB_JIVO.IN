import 'server-only';

// ==========================================================================
// AI Gateway service — the SINGLE server entry point for all AI requests.
//
//   execute(request):  authenticate → validate → rate-limit → runPipeline
//                       → return ONE AIGatewayResult
//   executeStream(request): streaming-ready wrapper (emits deltas; currently a
//                       single terminal delta until provider streaming lands).
//
// Any client (web action, mobile/WhatsApp route handler, admin tool) calls this.
// It owns NO pipeline logic itself — it guards + delegates to `runPipeline`.
// ==========================================================================

import { GATEWAY_CONFIG, GATEWAY_FEATURES } from '../config';
import { AI_DISABLED_MESSAGE } from '../feature';
import { isAiEnabledResolved } from '../feature/db-toggle';
import { gatewayRequestSchema } from '../validations';
import { gatewayError, correlationId as makeCorrelationId } from '../utils';
import { resolveIdentity } from '../auth';
import { checkRateLimit } from '../rate-limit';
import { runPipeline } from '../pipeline';
import {
  emitRequest,
  emitAuthenticated,
  emitRateLimited,
  emitCompleted,
  emitCancelled,
  emitFailed,
  emitStreamStarted,
} from '../analytics';
import type {
  AIGatewayRequest,
  AIGatewayResult,
  AIGatewayResponse,
  AIGatewayStreamEvent,
  GatewayChannel,
} from '../types';

/** The single entry point. Returns a discriminated `AIGatewayResult`. */
export async function execute(request: AIGatewayRequest): Promise<AIGatewayResult> {
  const channel: GatewayChannel = request.channel ?? GATEWAY_CONFIG.defaultChannel;

  // 0) Master AI switch (DB override → env/static fallback). When AI is disabled,
  //    refuse cleanly — no pipeline, no provider call, no stored conversation.
  if (!(await isAiEnabledResolved())) {
    return gatewayError('unavailable', AI_DISABLED_MESSAGE);
  }

  // 1) Validate the serializable input.
  if (GATEWAY_FEATURES.validation) {
    const parsed = gatewayRequestSchema.safeParse(request);
    if (!parsed.success) {
      return gatewayError('invalid_input', parsed.error.issues[0]?.message ?? 'Invalid request');
    }
  }

  // 2) Authenticate (user session or visitor id).
  const identity = await resolveIdentity(request);
  const correlationId = makeCorrelationId(`${identity.rateKey}:${request.conversationId ?? 'new'}`);
  emitRequest(channel, correlationId);
  emitAuthenticated(identity, channel);

  // 3) Rate limit.
  if (GATEWAY_FEATURES.rateLimiting) {
    const rl = checkRateLimit(channel, identity.rateKey, Date.now());
    if (!rl.allowed) {
      emitRateLimited(channel, rl.retryAfterMs);
      return gatewayError('rate_limited', 'Too many requests. Please slow down.', rl.retryAfterMs);
    }
  }

  // 4) Cancellation check before doing expensive work.
  if (request.signal?.aborted) {
    emitCancelled(channel, correlationId);
    return gatewayError('cancelled', 'Request cancelled');
  }

  // 5) Run the ONE pipeline.
  try {
    const response = await runPipeline({ request, identity, channel, correlationId });
    emitCompleted(response);
    return response;
  } catch (e) {
    if (request.signal?.aborted) {
      emitCancelled(channel, correlationId);
      return gatewayError('cancelled', 'Request cancelled');
    }
    const message = e instanceof Error ? e.message : 'AI request failed';
    emitFailed(channel, message, correlationId);
    return gatewayError('error', 'Something went wrong. Please try again.');
  }
}

/**
 * Streaming-ready entry point. The architecture streams gateway events; until
 * provider streaming is enabled it runs `execute` and yields one delta + done.
 */
export async function* executeStream(request: AIGatewayRequest): AsyncIterable<AIGatewayStreamEvent> {
  const channel: GatewayChannel = request.channel ?? GATEWAY_CONFIG.defaultChannel;
  const result = await execute(request);

  if (!result.ok) {
    yield { type: 'error', conversationId: request.conversationId ?? '', error: result.message };
    return;
  }

  emitStreamStarted(channel, result.meta.correlationId);
  // Single-chunk today; a future provider-streaming path yields incremental deltas.
  yield { type: 'delta', conversationId: result.conversationId, delta: result.message.content };
  yield { type: 'done', conversationId: result.conversationId, final: result as AIGatewayResponse };
}
