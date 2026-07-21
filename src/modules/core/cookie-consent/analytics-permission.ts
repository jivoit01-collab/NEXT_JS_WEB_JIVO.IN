import { canTrackAnalytics, canUseMarketing, canUsePreferences } from './consent-guards';
import type { ConsentState } from './types';

/**
 * Feature-level permission gates.
 *
 * These are the ONLY functions future modules (AI, chatbot, personalization,
 * recommendations, product analytics) should call to decide whether a capability
 * is allowed. Today they map onto the existing cookie categories — but when AI
 * gains its own settings / privacy rules, you update THIS file only, instead of
 * touching dozens of call sites.
 *
 * All accept a nullable `ConsentState` (from `useCookieConsent().consent`).
 */

/** May we boot AI features (insights, assistant)? Needs analytics-grade consent today. */
export function canInitializeAI(consent: ConsentState | null | undefined): boolean {
  return canTrackAnalytics(consent);
}

/** May we identify + track this visitor's behaviour? */
export function canTrackVisitor(consent: ConsentState | null | undefined): boolean {
  return canTrackAnalytics(consent);
}

/** May we persist chatbot conversations for this visitor? */
export function canStoreChat(consent: ConsentState | null | undefined): boolean {
  return canTrackAnalytics(consent);
}

/** May we personalise the experience (remembered preferences)? */
export function canUsePersonalization(consent: ConsentState | null | undefined): boolean {
  return canUsePreferences(consent);
}

/** May we show targeted product recommendations? */
export function canShowRecommendations(consent: ConsentState | null | undefined): boolean {
  return canUseMarketing(consent);
}
