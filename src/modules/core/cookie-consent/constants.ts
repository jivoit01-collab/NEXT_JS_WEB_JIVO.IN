import { COOKIE_CONSENT_VERSION } from '../shared/constants';

/**
 * Cookie policy version. Bumping this re-prompts EVERY visitor for consent
 * (their stored version no longer matches).
 *
 * Single source of truth: this mirrors the server-written `COOKIE_CONSENT_VERSION`
 * in `src/modules/core/shared/constants.ts`, so client + DB never drift. To force
 * re-consent, bump that shared constant.
 */
export const COOKIE_POLICY_VERSION = COOKIE_CONSENT_VERSION;

/** Where the consent decision + client identifiers live (persist across sessions). */
export const CONSENT_STORAGE_KEY = 'jivo.cookie.consent';
export const VISITOR_STORAGE_KEY = 'jivo.visitor.id';
/** Session id lives in sessionStorage — one per tab session. */
export const SESSION_STORAGE_KEY = 'jivo.session.id';

/** Category identifiers — MUST match the Prisma `CookieCategory` enum values. */
export const COOKIE_CATEGORIES = ['NECESSARY', 'ANALYTICS', 'MARKETING', 'PREFERENCES'] as const;
export type ConsentCategory = (typeof COOKIE_CATEGORIES)[number];

/** Optional categories the user can toggle (everything except NECESSARY). */
export const OPTIONAL_CATEGORIES = ['ANALYTICS', 'MARKETING', 'PREFERENCES'] as const;
export type OptionalCategory = (typeof OPTIONAL_CATEGORIES)[number];

/** Consent status — MUST match the Prisma `CookieConsentStatus` enum values. */
export const CONSENT_STATUS = {
  UNKNOWN: 'UNKNOWN',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CUSTOMIZED: 'CUSTOMIZED',
} as const;
export type ConsentStatus = (typeof CONSENT_STATUS)[keyof typeof CONSENT_STATUS];

/** Human-readable metadata for the preferences UI. */
export interface CategoryMeta {
  id: ConsentCategory;
  label: string;
  description: string;
  locked: boolean;
}

export const CATEGORY_META: Record<ConsentCategory, CategoryMeta> = {
  NECESSARY: {
    id: 'NECESSARY',
    label: 'Strictly Necessary',
    description:
      'Required for the website to function — security, consent storage and core features. These are always on and cannot be disabled.',
    locked: true,
  },
  ANALYTICS: {
    id: 'ANALYTICS',
    label: 'Analytics',
    description:
      'Help us understand how visitors use the site (pages, sessions, devices) so we can improve it. Data is anonymised.',
    locked: false,
  },
  MARKETING: {
    id: 'MARKETING',
    label: 'Marketing',
    description:
      'Used to show relevant offers and measure the effectiveness of our campaigns.',
    locked: false,
  },
  PREFERENCES: {
    id: 'PREFERENCES',
    label: 'Preferences',
    description:
      'Remember your choices (such as language or region) to give you a more personalised experience.',
    locked: false,
  },
};

/** Ordered list for rendering the modal. */
export const CATEGORY_ORDER: ConsentCategory[] = [
  'NECESSARY',
  'ANALYTICS',
  'MARKETING',
  'PREFERENCES',
];

export const PRIVACY_POLICY_HREF = '/privacy-policy';
