// ==========================================================================
// Platform / Response (Phase 7.4) — public barrel.
//
// The reusable AI Response Platform: validate → normalize → safe-parse → extract
// (citations, entities, links, actions) → detect leads/contact → produce ONE
// provider-independent StructuredResponse for the Experience Engine.
//
// It consumes an AIResponse from the AI Provider Platform and citations from the
// Context Builder. It calls NO LLM, no external API, renders no Chat UI. Pure &
// isomorphic — safe in client and server.
//
// Import boundaries:
//   • Client/runtime → this barrel (pure pipeline, config, types)
//   • Server actions  → '@/modules/platform/response/actions' (admin-guarded)
//
// Docs: docs/ai-response-platform.md
// ==========================================================================

// Facade + pipeline stages (all pure/isomorphic).
export { processResponse } from './services';
export { normalize, type NormalizedResponse } from './normalizers';
export { validate } from './validators';
export { parseMarkdown } from './parsers';
export {
  extractCitations,
  extractEntities,
  extractLinks,
  detectLead,
  suggestActions,
} from './extractors';
export { emitResponseEvents } from './analytics';

// Admin-guarded action.
export { processResponseAction } from './actions';

// Config + flags (client-safe).
export {
  RESPONSE_FEATURES,
  RESPONSE_CONFIG,
  INTENT_KEYWORDS,
  isResponseFeatureEnabled,
  type ResponseFeature,
} from './config';

// Utils (client-safe).
export { cleanText, stripInlineMarkdown, clamp01, stableId } from './utils';

// Events + types.
export { RESPONSE_EVENTS } from './types';
export type {
  ProcessResponseRequest,
  StructuredResponse,
  ResponseCitation,
  ResponseEntity,
  EntityKind,
  ResponseLink,
  SuggestedAction,
  ActionType,
  LeadSignal,
  ValidationResult,
  ValidationIssue,
  ValidationSeverity,
  ContentBlock,
  BlockType,
  ResponseEventName,
} from './types';
