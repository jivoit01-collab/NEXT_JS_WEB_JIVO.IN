// ==========================================================================
// Platform / AI Provider (Phase 7.3) — public barrel.
//
// The reusable AI Provider Platform: the ONLY module allowed to talk to external
// AI APIs. It separates the provider INTERFACE (types) from IMPLEMENTATIONS
// (adapters/*), wraps every call with retries / timeout / cancellation / circuit
// breaker / health tracking, and is streaming- and fallback-ready. Gemini is the
// first real provider; OpenAI/Claude/DeepSeek are prepared stubs.
//
// It consumes a provider-neutral BuiltPrompt from the Prompt Builder; it does not
// build prompts, retrieve knowledge, or render Chat UI — those are other layers.
//
// Import boundaries (keep server/network code out of client bundles):
//   • Client/runtime → this barrel (types, config, registry, utils, actions)
//   • Server service  → '@/modules/platform/ai-provider/services'  (server-only, calls APIs)
//   • Adapters        → '@/modules/platform/ai-provider/adapters'  (server-only)
//
// Docs: docs/ai-provider-platform.md
// ==========================================================================

// Admin-guarded read-only actions (catalog + health).
export { listProvidersAction, providerHealthAction } from './actions';

// Registry + health snapshots (client-safe: no adapter/network imports).
export {
  registerProvider,
  getProvider,
  listProviders,
  listProviderInfo,
  allProviderHealth,
  resolveProviderChain,
} from './registry';
export { getHealth } from './health';

// Config + flags (client-safe).
export {
  PROVIDER_FEATURES,
  PROVIDER_CONFIG,
  isProviderFeatureEnabled,
  type ProviderFeature,
} from './config';

// Utils + events + types.
export { estimateTokens } from './utils';
export { PROVIDER_EVENTS, AIProviderError } from './types';
export type {
  AIProvider,
  AIRequest,
  AIResponse,
  AIStreamChunk,
  TokenUsage,
  ProviderHealth,
  ProviderInfo,
  CircuitState,
  ProviderEventName,
} from './types';
