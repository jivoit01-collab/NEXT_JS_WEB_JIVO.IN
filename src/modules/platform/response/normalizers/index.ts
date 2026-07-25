// ==========================================================================
// Normalizers — collapse ANY provider's AIResponse into one common shape.
//
// Providers differ in finish reasons, usage reporting and text framing. The
// normalizer produces a provider-neutral core (text/usage/finish/flags) so every
// downstream step (validate/parse/extract) is provider-independent.
// ==========================================================================

import type { AIResponse, TokenUsage } from '@/modules/platform/ai-provider';
import { cleanText } from '../utils';

export interface NormalizedResponse {
  provider: string;
  model: string;
  text: string;
  usage: TokenUsage;
  responseTimeMs: number;
  finishReason: AIResponse['finishReason'];
  fromFallback: boolean;
  truncated: boolean;
  empty: boolean;
}

const ZERO_USAGE: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

/** Normalize a raw provider response into the common shape. Never throws. */
export function normalize(raw: AIResponse): NormalizedResponse {
  const text = cleanText(typeof raw?.text === 'string' ? raw.text : '');
  const usage = raw?.usage ?? ZERO_USAGE;
  return {
    provider: raw?.provider ?? 'unknown',
    model: raw?.model ?? 'unknown',
    text,
    usage: {
      promptTokens: usage.promptTokens ?? 0,
      completionTokens: usage.completionTokens ?? 0,
      totalTokens: usage.totalTokens ?? (usage.promptTokens ?? 0) + (usage.completionTokens ?? 0),
    },
    responseTimeMs: Math.max(0, raw?.responseTimeMs ?? 0),
    finishReason: raw?.finishReason ?? 'unknown',
    fromFallback: Boolean(raw?.fromFallback),
    truncated: raw?.finishReason === 'length',
    empty: text.length === 0,
  };
}
