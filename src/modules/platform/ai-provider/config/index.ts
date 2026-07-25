// ==========================================================================
// AI Provider configuration — flags + resilience defaults. Client-safe (no keys).
// ==========================================================================

export const PROVIDER_FEATURES = {
  providers: true,
  gemini: true, // first real provider
  retries: true,
  timeout: true,
  cancellation: true,
  healthTracking: true,
  circuitBreaker: true,
  usageTracking: true,

  // Prepared, off until implemented.
  streaming: false, // architecture ready; adapters not streaming yet
  fallback: false, // fallback chain ready; off until >1 provider is live
  openai: false,
  claude: false,
  deepseek: false,
} as const;

export type ProviderFeature = keyof typeof PROVIDER_FEATURES;

export function isProviderFeatureEnabled(feature: ProviderFeature): boolean {
  return PROVIDER_FEATURES[feature] === true;
}

export const PROVIDER_CONFIG = {
  /** Provider used when none is requested. */
  defaultProvider: 'gemini',
  /** Ordered fallback chain (only implemented+configured entries are tried). */
  fallbackOrder: ['gemini', 'openai', 'claude', 'deepseek'] as const,

  // Resilience
  timeoutMs: 30_000,
  maxRetries: 2,
  retryBaseDelayMs: 400,
  retryMaxDelayMs: 4_000,

  // Circuit breaker
  circuitErrorThreshold: 5, // consecutive errors → open
  circuitResetMs: 30_000, // open → half-open after this

  // Health smoothing
  latencyEmaAlpha: 0.3,
} as const;
