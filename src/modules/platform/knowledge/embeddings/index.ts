// ==========================================================================
// Embeddings abstraction — provider-agnostic, GENERATION NOT IMPLEMENTED.
//
// The platform never calls Gemini/OpenAI/Voyage directly. Instead each provider
// implements `EmbeddingProvider` and registers here. Today every provider is a
// stub whose `embed()` throws — the interface + registry exist so a future phase
// drops in a real provider (or several) with ZERO changes to search/retriever/
// indexing/data. An LLM feature picks a provider by name; it is never hard-coded.
// ==========================================================================

import type { EmbeddingProvider, KnowledgeEmbeddingProvider } from '../types';
import { KNOWLEDGE_CONFIG } from '../config';

const globalRef = globalThis as typeof globalThis & {
  __jivoKnowledgeEmbeddingProviders?: Map<KnowledgeEmbeddingProvider, EmbeddingProvider>;
};
const registry: Map<KnowledgeEmbeddingProvider, EmbeddingProvider> =
  globalRef.__jivoKnowledgeEmbeddingProviders ?? new Map();
if (!globalRef.__jivoKnowledgeEmbeddingProviders) {
  globalRef.__jivoKnowledgeEmbeddingProviders = registry;
}

export function registerEmbeddingProvider(provider: EmbeddingProvider): void {
  registry.set(provider.provider, provider);
}

export function getEmbeddingProvider(
  name: KnowledgeEmbeddingProvider,
): EmbeddingProvider | undefined {
  return registry.get(name);
}

export function getEmbeddingProviders(): EmbeddingProvider[] {
  return [...registry.values()];
}

/** Resolve the configured default provider (or a named one). */
export function resolveEmbeddingProvider(
  name: KnowledgeEmbeddingProvider = KNOWLEDGE_CONFIG.defaultEmbeddingProvider,
): EmbeddingProvider | undefined {
  return registry.get(name);
}

/** Build a not-yet-implemented provider stub (real generation lands later). */
function stub(
  provider: KnowledgeEmbeddingProvider,
  defaultModel: string,
  dimensions: number,
): EmbeddingProvider {
  return {
    provider,
    defaultModel,
    dimensions,
    available: false,
    async embed() {
      throw new Error(
        `[knowledge] Embedding generation for "${provider}" is not implemented yet. ` +
          `Register a real EmbeddingProvider in a future phase; the platform is ready for it.`,
      );
    },
  };
}

// Register the prepared providers (all stubs today). Dimensions are the known
// output sizes so downstream code/migrations can be sized ahead of time.
registerEmbeddingProvider(stub('GEMINI', 'text-embedding-004', 768));
registerEmbeddingProvider(stub('OPENAI', 'text-embedding-3-small', 1536));
registerEmbeddingProvider(stub('VOYAGE', 'voyage-3', 1024));

/** Cosine similarity — used by the FUTURE vector search once vectors exist. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}
