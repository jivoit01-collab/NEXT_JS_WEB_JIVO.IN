// ==========================================================================
// Provider Formatter Registry — the seam for FUTURE LLM providers.
//
// The Prompt Builder produces a provider-neutral BuiltPrompt. A formatter maps
// it to a provider's request shape. This phase implements ONLY the `generic`
// formatter (works with any chat API) and registers Gemini/OpenAI/Claude STUBS
// that fall back to generic — so a provider can be added later WITHOUT redesign.
// No LLM is called anywhere here.
// ==========================================================================

import type { BuiltPrompt, ProviderFormatter } from '../types';

type Registry = Map<string, ProviderFormatter>;

const KEY = '__jivo_prompt_formatters__';
function registry(): Registry {
  const g = globalThis as Record<string, unknown>;
  if (!g[KEY]) g[KEY] = new Map<string, ProviderFormatter>();
  return g[KEY] as Registry;
}

export function registerProviderFormatter(formatter: ProviderFormatter): void {
  registry().set(formatter.provider, formatter);
}

/** Get a formatter; falls back to `generic` for unknown/unimplemented providers. */
export function getProviderFormatter(provider?: string | null): ProviderFormatter {
  if (provider) {
    const f = registry().get(provider);
    if (f) return f;
  }
  return registry().get('generic')!;
}

export function listProviderFormatters(): string[] {
  return [...registry().keys()];
}

// ── Built-in: generic (implemented) ──────────────────────────
// Splits a BuiltPrompt into a system string + user message. Any chat-style API
// can consume this directly.
const generic: ProviderFormatter = {
  provider: 'generic',
  format: (prompt: BuiltPrompt) => ({
    system: prompt.system,
    messages: prompt.messages.filter((m) => m.role !== 'system'),
  }),
};
registerProviderFormatter(generic);

// ── Prepared provider stubs (NOT implemented) ────────────────
// They currently delegate to `generic`. When a provider is implemented, replace
// its `format` with the provider-specific mapping — no other file changes.
for (const provider of ['gemini', 'openai', 'claude'] as const) {
  registerProviderFormatter({ provider, format: generic.format });
}
