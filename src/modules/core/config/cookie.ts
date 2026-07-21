// Canonical read surface for cookie-consent configuration.
// Definitions live in `../cookie-consent/constants` (unchanged); grouped here.

import {
  COOKIE_POLICY_VERSION,
  COOKIE_CATEGORIES,
  OPTIONAL_CATEGORIES,
  CONSENT_STORAGE_KEY,
  VISITOR_STORAGE_KEY,
  SESSION_STORAGE_KEY,
  PRIVACY_POLICY_HREF,
} from '../cookie-consent/constants';

export const COOKIE_CONFIG = {
  policyVersion: COOKIE_POLICY_VERSION,
  categories: COOKIE_CATEGORIES,
  optionalCategories: OPTIONAL_CATEGORIES,
  storageKeys: {
    consent: CONSENT_STORAGE_KEY,
    visitor: VISITOR_STORAGE_KEY,
    session: SESSION_STORAGE_KEY,
  },
  privacyPolicyHref: PRIVACY_POLICY_HREF,
} as const;
