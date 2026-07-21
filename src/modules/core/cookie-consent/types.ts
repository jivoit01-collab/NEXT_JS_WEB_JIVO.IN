import type { ConsentCategory, ConsentStatus } from './constants';

/** The consent decision persisted locally and mirrored to the server. */
export interface ConsentState {
  visitorId: string;
  status: ConsentStatus;
  /** Accepted categories — NECESSARY is always present. */
  categories: ConsentCategory[];
  version: string;
  /** ISO timestamp of the decision. */
  updatedAt: string;
}

/** Toggle state for the optional categories in the preferences modal. */
export interface CategoryPreferences {
  ANALYTICS: boolean;
  MARKETING: boolean;
  PREFERENCES: boolean;
}

/** Everything the `useCookieConsent()` hook / context exposes. */
export interface CookieConsentContextValue {
  /** Current decision, or null before any choice is made. */
  consent: ConsentState | null;
  /** True until the initial local/server reconciliation finishes. */
  loading: boolean;
  /** True when the first-visit banner should be shown. */
  bannerVisible: boolean;
  /** True when the preferences modal is open. */
  preferencesOpen: boolean;

  acceptAll: () => void;
  rejectAll: () => void;
  updatePreferences: (prefs: CategoryPreferences) => void;

  openPreferences: () => void;
  closePreferences: () => void;

  /** Has the visitor made ANY decision for the current policy version? */
  hasConsent: () => boolean;
  /** Is a given category currently allowed? */
  isAllowed: (category: ConsentCategory) => boolean;

  /** Consent-gated event tracker (no-op unless ANALYTICS is allowed). */
  track: (event: TrackableEvent) => void;
}

/** Minimal event shape a consumer can send through the consent-gated tracker. */
export interface TrackableEvent {
  eventType: string;
  page?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}
