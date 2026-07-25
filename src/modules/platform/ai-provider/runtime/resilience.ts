// ==========================================================================
// Resilience runtime — wraps a single provider call with timeout, cancellation,
// retries (backoff) and health/circuit tracking, emitting analytics events.
//
// This is the ONLY place that decides retry/timeout/circuit policy, so every
// adapter gets identical, correct behavior for free.
// ==========================================================================

import { platformEvents } from '@/modules/core/events';
import { PROVIDER_CONFIG } from '../config';
import { backoffDelay, delay } from '../utils';
import { canCall, recordFailure, recordSuccess, recordTimeout } from '../health';
import { AIProviderError, PROVIDER_EVENTS } from '../types';
import type { AIProvider, AIRequest, AIResponse } from '../types';

/** Compose the caller's signal with a timeout signal (either aborts the call). */
function withTimeout(signal: AbortSignal | undefined, timeoutMs: number): { signal: AbortSignal; cancel: () => void } {
  const ctrl = new AbortController();
  const onAbort = () => ctrl.abort(signal?.reason);
  if (signal) {
    if (signal.aborted) ctrl.abort(signal.reason);
    else signal.addEventListener('abort', onAbort, { once: true });
  }
  const timer = setTimeout(() => ctrl.abort(new DOMException('Timeout', 'TimeoutError')), timeoutMs);
  return {
    signal: ctrl.signal,
    cancel: () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    },
  };
}

function isAbort(e: unknown): boolean {
  return e instanceof DOMException && (e.name === 'AbortError' || e.name === 'TimeoutError');
}

/**
 * Execute one provider's `generate` with the full resilience envelope. `nowMs` is
 * injected (no Date.now in library core) so behavior stays testable/replayable.
 */
export async function callWithResilience(
  provider: AIProvider,
  request: AIRequest,
  nowMs: number,
): Promise<AIResponse> {
  const name = provider.info.name;

  if (!canCall(name, nowMs)) {
    throw new AIProviderError(`Circuit open for provider "${name}"`, name, true);
  }

  const timeoutMs = request.timeoutMs ?? PROVIDER_CONFIG.timeoutMs;
  const maxRetries = PROVIDER_CONFIG.maxRetries;
  let lastErr: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const { signal, cancel } = withTimeout(request.signal, timeoutMs);
    platformEvents.emit(PROVIDER_EVENTS.REQUESTED, { provider: name, attempt, correlationId: request.correlationId });

    try {
      const response = await provider.generate({ ...request, signal });
      cancel();
      const latency = Math.max(0, response.responseTimeMs || 0);
      const { circuitClosed } = recordSuccess(name, latency, response.usage, nowMs);
      if (circuitClosed) platformEvents.emit(PROVIDER_EVENTS.CIRCUIT_CLOSED, { provider: name });
      platformEvents.emit(PROVIDER_EVENTS.SUCCEEDED, {
        provider: name,
        model: response.model,
        latencyMs: latency,
        tokens: response.usage.totalTokens,
        correlationId: request.correlationId,
      });
      return response;
    } catch (e) {
      cancel();
      lastErr = e;

      // Caller cancellation → do not retry, do not penalize availability.
      if (request.signal?.aborted) {
        platformEvents.emit(PROVIDER_EVENTS.CANCELLED, { provider: name, correlationId: request.correlationId });
        throw new AIProviderError('Cancelled by caller', name, false, e);
      }

      const timedOut = isAbort(e);
      if (timedOut) {
        recordTimeout(name);
        platformEvents.emit(PROVIDER_EVENTS.TIMED_OUT, { provider: name, attempt, timeoutMs });
      }

      const message = e instanceof Error ? e.message : 'Unknown provider error';
      const { circuitOpened } = recordFailure(name, message, nowMs);
      if (circuitOpened) platformEvents.emit(PROVIDER_EVENTS.CIRCUIT_OPENED, { provider: name });
      platformEvents.emit(PROVIDER_EVENTS.FAILED, { provider: name, attempt, error: message, correlationId: request.correlationId });

      const retryable = timedOut || (e instanceof AIProviderError ? e.retryable : true);
      if (!retryable || attempt === maxRetries || circuitOpened) break;

      platformEvents.emit(PROVIDER_EVENTS.RETRIED, { provider: name, nextAttempt: attempt + 1 });
      await delay(backoffDelay(attempt), request.signal).catch(() => {});
    }
  }

  throw lastErr instanceof AIProviderError
    ? lastErr
    : new AIProviderError(lastErr instanceof Error ? lastErr.message : 'Provider failed', name, false, lastErr);
}
