// Canonical read surface for analytics platform configuration.
// Definitions live in `../shared/constants` (unchanged, to stay non-breaking);
// this groups them so future modules import ONE config object.

import {
  ANALYTICS_WRITE_LIMIT,
  ANALYTICS_WINDOW_MS,
  MAX_EVENT_BATCH,
  ANALYTICS_PAGE_SIZE,
  ANALYTICS_MAX_PAGE_SIZE,
  BOUNCE_EVENT_THRESHOLD,
  COOKIE_CONSENT_VERSION,
} from '../shared/constants';

export const ANALYTICS_CONFIG = {
  /** Public ingestion rate limit (per IP). */
  writeLimit: ANALYTICS_WRITE_LIMIT,
  windowMs: ANALYTICS_WINDOW_MS,
  /** Max events accepted in one `{ events: [...] }` request. */
  maxEventBatch: MAX_EVENT_BATCH,
  /** Admin list pagination. */
  pageSize: ANALYTICS_PAGE_SIZE,
  maxPageSize: ANALYTICS_MAX_PAGE_SIZE,
  /** Sessions with ≤ this many page events are bounces. */
  bounceThreshold: BOUNCE_EVENT_THRESHOLD,
  /** Consent policy version (bump to re-prompt everyone). */
  consentVersion: COOKIE_CONSENT_VERSION,
} as const;
