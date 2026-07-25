// ==========================================================================
// AI Observability configuration — flags + cost table. Client-safe.
// ==========================================================================

export const OBSERVABILITY_FEATURES = {
  recording: true,
  costEstimation: true,
  stats: true,

  // Prepared, off until wired.
  sampling: false, // record only a sample of requests at high volume
  export: false, // export executions to an external sink
  tracing: false, // distributed tracing spans
} as const;

export type ObservabilityFeature = keyof typeof OBSERVABILITY_FEATURES;

export function isObservabilityFeatureEnabled(feature: ObservabilityFeature): boolean {
  return OBSERVABILITY_FEATURES[feature] === true;
}

/**
 * Model-agnostic cost table (USD per 1K tokens). Provider-independent estimate —
 * used for optimization signals, not billing. Unknown models fall back to
 * `default`. Extend without touching callers.
 */
export const COST_PER_1K_TOKENS: Record<string, { input: number; output: number }> = {
  'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
  'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
  'gemini-2.0-flash': { input: 0.0001, output: 0.0004 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4o': { input: 0.005, output: 0.015 },
  'claude-3-5-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-5-haiku': { input: 0.0008, output: 0.004 },
  'deepseek-chat': { input: 0.00027, output: 0.0011 },
  default: { input: 0.0005, output: 0.0015 },
};

export const OBSERVABILITY_CONFIG = {
  /** Recording must never block a user response — cap the write time. */
  recordTimeoutMs: 3000,
  /** Rows returned to the dashboard by default. */
  recentLimit: 25,
} as const;
