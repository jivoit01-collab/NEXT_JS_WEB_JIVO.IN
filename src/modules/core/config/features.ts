// ==========================================================================
// Platform feature flags — one switch per platform capability.
//
// Gate new/optional platform capabilities here so a feature can be turned on/off
// centrally without hunting through the codebase. Business modules should read
// these (never hard-code "is AI on?" checks of their own).
// ==========================================================================

export const PLATFORM_FEATURES = {
  /** Core analytics ingestion + event log (Phase 1). */
  analytics: true,
  /** Universal Visitor Tracking Engine (Phase 3). */
  tracking: true,
  /** Cookie consent management (Phase 2). */
  cookieConsent: true,
  /** In-process platform event bus (platform emits, business subscribes). */
  eventBus: true,

  // ── Not built yet — flip on when the module lands (keeps callers stable). ──
  ai: false,
  chatbot: false,
  recommendations: false,
  productAnalytics: false,
  ecommerce: false,
  funnelAnalytics: false,
} as const;

export type PlatformFeature = keyof typeof PLATFORM_FEATURES;

/** Single place every module asks "is this capability enabled?". */
export function isFeatureEnabled(feature: PlatformFeature): boolean {
  return PLATFORM_FEATURES[feature] === true;
}
