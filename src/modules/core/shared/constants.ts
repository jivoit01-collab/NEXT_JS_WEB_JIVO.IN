/**
 * Core analytics — shared constants.
 * Single source of truth for enum-like values used across every core module.
 */

export const COOKIE_CONSENT_VERSION = '1.0';

/** Rate-limit budget for public analytics ingestion (per IP, per minute). */
export const ANALYTICS_WRITE_LIMIT = 200;
export const ANALYTICS_WINDOW_MS = 60 * 1000;

/** Cap how many events one request may submit in a single batch. */
export const MAX_EVENT_BATCH = 20;

/** Default page size for admin list queries. */
export const ANALYTICS_PAGE_SIZE = 50;
export const ANALYTICS_MAX_PAGE_SIZE = 200;

/** A session is considered a bounce until it records more than one event/page. */
export const BOUNCE_EVENT_THRESHOLD = 1;
