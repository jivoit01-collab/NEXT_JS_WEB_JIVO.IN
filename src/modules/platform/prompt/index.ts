// ==========================================================================
// Platform / Prompt (Phase 7.2) — public barrel.
//
// The reusable AI Prompt Builder Platform. It assembles the FINAL prompt from
// Conversation memory + Knowledge Context + the User Question, using reusable,
// versioned templates that separate System Prompt / Business Rules / User Prompt
// / Output Instructions. It is INDEPENDENT of any AI provider — no Gemini/OpenAI/
// Claude and no LLM call live here. A future provider consumes a BuiltPrompt
// (optionally via a provider formatter); the Prompt Builder never calls it.
//
// Import boundaries (keep server code out of client bundles):
//   • Client/runtime → this barrel (pure builder, templates, providers, config, types)
//   • Server actions  → '@/modules/platform/prompt/actions'                (admin-guarded)
//   • Orchestration   → '@/modules/platform/prompt/services/for-conversation' (server-only)
//
// Docs: docs/prompt-builder-platform.md
// ==========================================================================

// Pure builder facade (isomorphic — safe in client & server).
export { buildPrompt, buildPromptForProvider } from './services';

// Versioned template registry.
export {
  registerPromptTemplate,
  getPromptTemplate,
  listPromptTemplates,
} from './templates';

// Provider formatter seam (future LLMs).
export {
  registerProviderFormatter,
  getProviderFormatter,
  listProviderFormatters,
} from './providers';

// Assembly pipeline steps (for reuse / testing / custom builders).
export {
  collectVariables,
  renderSystem,
  renderMemory,
  renderKnowledge,
  renderUser,
  assemble,
} from './builders';

// Config + flags (client-safe).
export {
  PROMPT_FEATURES,
  PROMPT_CONFIG,
  isPromptFeatureEnabled,
  type PromptFeature,
} from './config';

// Utils (client-safe).
export { estimateTokens, interpolate, joinSections, trimToTokens } from './utils';

// Events + types.
export { PROMPT_EVENTS } from './types';
export type {
  PromptSection,
  PromptMessage,
  PromptTemplate,
  PromptRequest,
  BuiltPrompt,
  ProviderFormatter,
  PromptEventName,
} from './types';

export { promptOptionsSchema, type PromptOptionsInput } from './validations';
