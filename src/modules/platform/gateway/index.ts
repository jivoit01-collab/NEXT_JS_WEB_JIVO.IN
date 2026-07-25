// ==========================================================================
// Platform / Gateway (Phase 7.7) — public barrel.
//
// The AI Gateway API: the SINGLE server entry point for every AI request, from
// any client (web, mobile, admin, WhatsApp, API). It authenticates, validates,
// rate-limits, runs the FULL pipeline once (Conversation → Knowledge → Context →
// Prompt → Provider → Response → Experience), and returns ONE structured
// response. It OWNS the pipeline; every other AI surface delegates to it, so
// business logic is never duplicated.
//
// Import boundaries:
//   • Server entry   → '@/modules/platform/gateway/services' (execute/executeStream, server-only)
//   • Web/admin action → '@/modules/platform/gateway/actions' (aiGatewayAction)
//   • Route handlers  → import `execute` in a Route Handler for mobile/WhatsApp
//   • Client/types    → this barrel (config, utils, types — client-safe)
//
// Docs: docs/ai-gateway-api.md
// ==========================================================================

// Server action (web/admin).
export { aiGatewayAction, type GatewayActionInput } from './actions';

// Master AI feature switch (client-safe).
export { isAiEnabled, AI_DISABLED_MESSAGE } from './feature';

// Config + flags (client-safe).
export {
  GATEWAY_FEATURES,
  GATEWAY_CONFIG,
  RATE_LIMITS,
  isGatewayFeatureEnabled,
  type GatewayFeature,
} from './config';

// Utils (client-safe).
export { gatewayError, correlationId, isGatewaySuccess } from './utils';

// Validations.
export { gatewayRequestSchema, type GatewayRequestInput } from './validations';

// Events + types.
export { GATEWAY_EVENTS } from './types';
export type {
  GatewayChannel,
  GatewayIdentity,
  AIGatewayRequest,
  AIGatewayResponse,
  AIGatewayError,
  AIGatewayResult,
  AIGatewayStreamEvent,
  GatewayEventName,
} from './types';
