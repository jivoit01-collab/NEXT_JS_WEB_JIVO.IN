import { CONSENT_STATUS, COOKIE_POLICY_VERSION, type ConsentCategory } from './constants';
import type { ConsentState } from './types';

/**
 * Reusable consent guards — pure functions, safe on client AND server.
 * Every future module (analytics tracker, marketing pixels, preference storage,
 * Google login, AI features) should gate behaviour through these.
 *
 * All accept a nullable `ConsentState` so callers never have to null-check first.
 */

/** Has the visitor made a decision that is still valid for the CURRENT policy version? */
export function hasConsent(state: ConsentState | null | undefined): boolean {
  return (
    !!state &&
    state.status !== CONSENT_STATUS.UNKNOWN &&
    state.version === COOKIE_POLICY_VERSION
  );
}

/** Is a specific category allowed right now? (NECESSARY is always allowed.) */
export function isCategoryAllowed(
  state: ConsentState | null | undefined,
  category: ConsentCategory,
): boolean {
  if (category === 'NECESSARY') return true;
  return hasConsent(state) ? !!state?.categories.includes(category) : false;
}

export function canTrackAnalytics(state: ConsentState | null | undefined): boolean {
  return isCategoryAllowed(state, 'ANALYTICS');
}

export function canUseMarketing(state: ConsentState | null | undefined): boolean {
  return isCategoryAllowed(state, 'MARKETING');
}

export function canUsePreferences(state: ConsentState | null | undefined): boolean {
  return isCategoryAllowed(state, 'PREFERENCES');
}
