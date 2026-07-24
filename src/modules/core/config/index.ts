// ==========================================================================
// Core / Config — one place to read platform configuration + feature flags.
//
//   import { ANALYTICS_CONFIG, TRACKING_CONFIG, COOKIE_CONFIG,
//            PLATFORM_FEATURES, isFeatureEnabled } from '@/modules/core/config';
//
// All values are client-safe (pure constants only — no server imports), so this
// barrel is safe in both server and client components. The underlying
// definitions are unchanged; this module is the canonical, non-duplicating
// read surface future modules should prefer.
// ==========================================================================

export { ANALYTICS_CONFIG } from './analytics';
export { TRACKING_CONFIG } from './tracking';
export { COOKIE_CONFIG } from './cookie';
export { PLATFORM_FEATURES, isFeatureEnabled, type PlatformFeature } from './features';
