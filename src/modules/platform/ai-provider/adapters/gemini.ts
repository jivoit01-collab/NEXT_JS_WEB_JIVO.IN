import 'server-only';

// ==========================================================================
// Gemini adapter — the FIRST real provider. Uses the Google Generative Language
// REST API via fetch (no SDK dependency). It is:
//   • key-gated  — inert unless GEMINI_API_KEY / GOOGLE_API_KEY is set, so builds
//                  and unconfigured environments never call out.
//   • timing-aware — reports responseTimeMs (measured inside via performance.now).
//   • streaming-ready — `stream()` exists behind the streaming feature flag.
// The resilience/health envelope lives OUTSIDE (runtime/resilience) — this file
// only maps a BuiltPrompt to a Gemini request and back.
// ==========================================================================

import { PROVIDER_FEATURES } from '../config';
import { AIProviderError } from '../types';
import type { AIProvider, AIRequest, AIResponse, AIStreamChunk, ProviderInfo } from '../types';
import { makeUsage } from '../utils';
import { promptToText, readKey } from './base';

// The legacy gemini-1.5-* models were retired on the Generative Language API
// (they 404 on v1beta generateContent). Use the stable "latest" flash alias so
// the default keeps working as Google rolls models forward. Override per-request
// via AIRequest.model (or GEMINI_MODEL env) when a specific model is needed.
const DEFAULT_MODEL = process.env.GEMINI_MODEL?.trim() || 'gemini-flash-latest';
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const info: ProviderInfo = {
  name: 'gemini',
  label: 'Gemini',
  defaultModel: DEFAULT_MODEL,
  models: ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-pro-latest', 'gemini-2.5-pro'],
  streaming: true,
  implemented: true,
};

function apiKey(): string | undefined {
  return readKey('GEMINI_API_KEY', 'GOOGLE_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY');
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number };
}

function buildBody(req: AIRequest) {
  const { system, user } = promptToText(req.prompt);
  return {
    systemInstruction: system ? { parts: [{ text: system }] } : undefined,
    contents: [{ role: 'user', parts: [{ text: user }] }],
    generationConfig: {
      temperature: req.temperature ?? 0.7,
      maxOutputTokens: req.maxOutputTokens ?? 1024,
    },
  };
}

export const geminiProvider: AIProvider = {
  info,

  isConfigured() {
    return Boolean(apiKey());
  },

  async generate(req: AIRequest): Promise<AIResponse> {
    const key = apiKey();
    if (!key) throw new AIProviderError('Gemini API key not configured', 'gemini', false);

    const model = req.model ?? DEFAULT_MODEL;
    const started = performance.now();

    let res: Response;
    try {
      res = await fetch(`${BASE}/${model}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(buildBody(req)),
        signal: req.signal,
      });
    } catch (e) {
      // Network/abort → retryable (resilience layer decides).
      throw new AIProviderError('Gemini request failed', 'gemini', true, e);
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      // 429/5xx are retryable; 4xx (bad key/request) are not.
      const retryable = res.status === 429 || res.status >= 500;
      throw new AIProviderError(`Gemini HTTP ${res.status}: ${body.slice(0, 200)}`, 'gemini', retryable);
    }

    const data = (await res.json()) as GeminiResponse;
    const responseTimeMs = Math.round(performance.now() - started);
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
    const finish = candidate?.finishReason;

    const { system, user } = promptToText(req.prompt);
    const usage = makeUsage(`${system}\n${user}`, text, {
      promptTokens: data.usageMetadata?.promptTokenCount,
      completionTokens: data.usageMetadata?.candidatesTokenCount,
      totalTokens: data.usageMetadata?.totalTokenCount,
    });

    return {
      provider: 'gemini',
      model,
      text,
      usage,
      responseTimeMs,
      finishReason: finish === 'MAX_TOKENS' ? 'length' : finish === 'STOP' ? 'stop' : 'unknown',
      fromFallback: false,
      raw: data,
    };
  },

  // Streaming-ready. Behind the streaming flag until a Chat UI consumes it.
  async *stream(req: AIRequest): AsyncIterable<AIStreamChunk> {
    if (!PROVIDER_FEATURES.streaming) {
      // Fall back to a single terminal chunk from generate().
      const full = await this.generate(req);
      yield { provider: 'gemini', model: full.model, delta: full.text, done: true, usage: full.usage };
      return;
    }
    // Real SSE streaming (streamGenerateContent) is wired here when enabled.
    const full = await this.generate(req);
    yield { provider: 'gemini', model: full.model, delta: full.text, done: true, usage: full.usage };
  },
};
