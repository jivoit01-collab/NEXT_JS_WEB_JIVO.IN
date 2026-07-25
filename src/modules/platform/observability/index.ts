// ==========================================================================
// Platform / Observability (Phase 7.9) — public barrel.
//
// The reusable AI Observability module: stores execution METADATA (one row per
// AI Gateway request) for debugging + optimization. It stores NO conversation
// content — only soft references. The Gateway pipeline is the single caller of
// `recordExecution`. Dashboard reads flow through the analytics data source.
//
// Import boundaries:
//   • Server recorder/data → '@/modules/platform/observability/services' (server-only)
//   • Client/types         → this barrel (config, utils, types — client-safe)
//
// Docs: docs/ai-observability-platform.md
// ==========================================================================

// Config + flags (client-safe).
export {
  OBSERVABILITY_FEATURES,
  OBSERVABILITY_CONFIG,
  COST_PER_1K_TOKENS,
  isObservabilityFeatureEnabled,
  type ObservabilityFeature,
} from './config';

// Utils (client-safe) — the shared cost estimator.
export { estimateCost, ratio } from './utils';

// Events + types.
export { OBSERVABILITY_EVENTS } from './types';
export type {
  AIExecutionRecord,
  AIExecutionDTO,
  ObservabilityStats,
  ObservabilityEventName,
} from './types';
