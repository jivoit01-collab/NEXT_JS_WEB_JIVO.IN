// Core / Cookie Consent module barrel
//
// Consumers:
//   • Layout          → import { CookieProvider } from '@/modules/core/cookie-consent'
//   • Components/hooks → import { useCookieConsent, CookieSettingsButton } from '...'
//   • Gating (server-safe, pure) → prefer importing from '.../consent-guards' directly.

export {
  CookieProvider,
  CookieBanner,
  CookiePreferencesModal,
  CookieSettingsButton,
} from './components';

export { useCookieConsent } from './hooks/use-cookie-consent';

export {
  hasConsent,
  isCategoryAllowed,
  canTrackAnalytics,
  canUseMarketing,
  canUsePreferences,
} from './consent-guards';

// Feature-level permission gates (AI, tracking, chat, personalization, recommendations).
// Change the mapping HERE only when a feature earns its own privacy rules.
export {
  canInitializeAI,
  canTrackVisitor,
  canStoreChat,
  canUsePersonalization,
  canShowRecommendations,
} from './analytics-permission';

export {
  COOKIE_POLICY_VERSION,
  COOKIE_CATEGORIES,
  OPTIONAL_CATEGORIES,
  CONSENT_STATUS,
  CATEGORY_META,
  CATEGORY_ORDER,
  PRIVACY_POLICY_HREF,
  type ConsentCategory,
  type ConsentStatus,
  type OptionalCategory,
  type CategoryMeta,
} from './constants';

export { getConsentAction, listConsentsAction } from './actions';

export type {
  ConsentState,
  CategoryPreferences,
  CookieConsentContextValue,
  TrackableEvent,
} from './types';
