// ==========================================================================
// Prompt Builder configuration — flags + defaults. Client-safe.
// ==========================================================================

export const PROMPT_FEATURES = {
  templates: true,
  businessRules: true,
  memoryInjection: true,
  knowledgeInjection: true,
  outputInstructions: true,
  versioning: true,
  tokenEstimation: true,

  // Prepared, off until implemented.
  fewShotExamples: false,
  providerFormatting: false, // formatter registry ready; providers not implemented
  promptCaching: false, // Redis hooks (future)
} as const;

export type PromptFeature = keyof typeof PROMPT_FEATURES;

export function isPromptFeatureEnabled(feature: PromptFeature): boolean {
  return PROMPT_FEATURES[feature] === true;
}

export const PROMPT_CONFIG = {
  defaultTemplateId: 'assistant',
  /** Whole-prompt token ceiling (model-agnostic; override per request). */
  maxPromptTokens: 6000,
  /** Reserve for the model's answer. */
  reserveForAnswerTokens: 1000,
  charsPerToken: 4,
  /** Max memory items injected into a prompt. */
  maxMemoryItems: 10,
} as const;
