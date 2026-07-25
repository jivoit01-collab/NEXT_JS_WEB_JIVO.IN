import 'server-only';

// ==========================================================================
// AI Provider service — the reusable facade the rest of the app calls to reach
// an external AI API. This is the SEAM: nothing else in the codebase talks to a
// provider directly. It resolves the provider chain (default → fallbacks), runs
// each through the resilience envelope, and emits provider analytics events.
//
// Importing this registers the adapters (side effect). No Chat UI, no prompt
// building — it consumes a BuiltPrompt from the Prompt Builder.
// ==========================================================================

import { platformEvents } from '@/modules/core/events';
import '../adapters'; // register providers
import { PROVIDER_FEATURES } from '../config';
import { getProvider, resolveProviderChain, allProviderHealth, listProviderInfo } from '../registry';
import { recordFallback } from '../health';
import { callWithResilience } from '../runtime/resilience';
import { AIProviderError, PROVIDER_EVENTS } from '../types';
import type { AIRequest, AIResponse, AIStreamChunk, ProviderHealth, ProviderInfo } from '../types';

export interface GenerateOptions extends AIRequest {
  /** Preferred provider (else PROVIDER_CONFIG.defaultProvider). */
  provider?: string;
  /** Allow falling back to other configured providers on failure. */
  allowFallback?: boolean;
}

/**
 * Generate a completion for a BuiltPrompt. Tries the preferred provider, then —
 * when enabled — the configured fallback chain. Every attempt is resilience-
 * wrapped (timeout, retries, cancellation, circuit breaker, health tracking).
 */
export async function generate(options: GenerateOptions): Promise<AIResponse> {
  const chain = resolveProviderChain(options.provider);
  if (chain.length === 0) {
    throw new AIProviderError(
      'No implemented, configured AI provider is available',
      options.provider ?? 'none',
      false,
    );
  }

  const useFallback = (options.allowFallback ?? false) && PROVIDER_FEATURES.fallback;
  const candidates = useFallback ? chain : [chain[0]];

  let lastErr: unknown;
  for (let i = 0; i < candidates.length; i += 1) {
    const provider = candidates[i];
    try {
      const response = await callWithResilience(provider, options, Date.now());
      if (i > 0) {
        response.fromFallback = true;
        recordFallback(candidates[0].info.name);
        platformEvents.emit(PROVIDER_EVENTS.FELL_BACK, {
          from: candidates[0].info.name,
          to: provider.info.name,
        });
      }
      return response;
    } catch (e) {
      lastErr = e;
      // Caller cancellation should not roll over to the next provider.
      if (options.signal?.aborted) throw e;
    }
  }
  throw lastErr;
}

/**
 * Streaming generate (streaming-ready). Uses the provider's `stream` when the
 * streaming feature is enabled; otherwise yields one terminal chunk. No fallback
 * mid-stream (a future enhancement).
 */
export async function* stream(options: GenerateOptions): AsyncIterable<AIStreamChunk> {
  const provider = getProvider(options.provider);
  if (!provider || !provider.info.implemented || !provider.isConfigured()) {
    throw new AIProviderError('No streaming-capable provider available', options.provider ?? 'none', false);
  }
  if (provider.stream) {
    yield* provider.stream(options);
    return;
  }
  const full = await callWithResilience(provider, options, Date.now());
  yield { provider: full.provider, model: full.model, delta: full.text, done: true, usage: full.usage };
}

/** Health snapshots for every registered provider (dashboard/actions). */
export function getProviderHealth(): ProviderHealth[] {
  return allProviderHealth();
}

/** Static info for every registered provider. */
export function getProviderCatalog(): ProviderInfo[] {
  return listProviderInfo();
}
