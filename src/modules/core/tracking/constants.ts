// ==========================================================================
// Universal Visitor Tracking Engine — configuration & vocabulary (Phase 3)
// Pure constants, safe to import anywhere (client + server).
// ==========================================================================

import { MAX_EVENT_BATCH } from '../shared/constants';

/**
 * Event vocabulary. String literals mirror the Prisma `AnalyticsEventType`
 * enum exactly, so the client never has to import Prisma (keeps the bundle lean)
 * yet the server still validates against the real enum.
 */
export const TRACK_EVENT = {
  PAGE_VIEW: 'PAGE_VIEW',
  BUTTON_CLICK: 'BUTTON_CLICK',
  LINK_CLICK: 'LINK_CLICK',
  SCROLL: 'SCROLL',
  SEARCH: 'SEARCH',
  DOWNLOAD: 'DOWNLOAD',
  VIDEO_PLAY: 'VIDEO_PLAY',
  VIDEO_PAUSE: 'VIDEO_PAUSE',
  VIDEO_COMPLETE: 'VIDEO_COMPLETE',
  FORM_OPEN: 'FORM_OPEN',
  FORM_START: 'FORM_START',
  FORM_SUBMIT: 'FORM_SUBMIT',
  FORM_SUCCESS: 'FORM_SUCCESS',
  FORM_ERROR: 'FORM_ERROR',
  CUSTOM: 'CUSTOM',
} as const;

export type TrackEventType = (typeof TRACK_EVENT)[keyof typeof TRACK_EVENT];

/** Event-queue tuning. */
export const QUEUE_CONFIG = {
  /** Server caps a batch at MAX_EVENT_BATCH — never exceed it. */
  batchSize: MAX_EVENT_BATCH,
  /** Idle flush cadence (ms). Events are also flushed on visibility/unload. */
  flushIntervalMs: 5_000,
  /** Give up on a batch after this many failed sends (avoids infinite retry). */
  maxRetries: 3,
  /** Backoff base (ms) between retries — multiplied by attempt count. */
  retryBackoffMs: 2_000,
  /** Hard cap on buffered events (protects memory if the network is down for long). */
  maxBufferSize: 100,
  /** localStorage key for offline persistence of the buffer. */
  storageKey: 'jivo.track.queue',
} as const;

/** Scroll-depth milestones (percent) — each fires once per page. */
export const SCROLL_DEPTHS = [25, 50, 75, 100] as const;

/** How often the scroll handler may run (ms). */
export const SCROLL_THROTTLE_MS = 250;

/**
 * File extensions treated as downloads (case-insensitive, no dot).
 * A click on a link ending in one of these emits a DOWNLOAD event.
 */
export const DOWNLOAD_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'zip', 'rar', '7z', 'tar', 'gz',
  'csv', 'txt', 'json', 'xml',
  'mp3', 'mp4', 'mov', 'avi', 'wav',
  'png', 'jpg', 'jpeg', 'webp', 'svg', 'gif',
  'apk', 'dmg', 'exe', 'pkg',
] as const;

/**
 * Opt-out marker. Any element (or ancestor) carrying `data-no-track`
 * is ignored by automatic click tracking.
 */
export const NO_TRACK_ATTR = 'data-no-track';

/**
 * Explicit opt-in / naming markers read off the DOM:
 *   data-track        → force-track this element + acts as the event name
 *   data-track-name   → human label for the event
 *   data-track-type   → override the inferred event type
 *   data-track-id     → entityId
 *   data-track-cta    → mark as a CTA (adds metadata.isCta)
 */
export const TRACK_ATTRS = {
  track: 'data-track',
  name: 'data-track-name',
  type: 'data-track-type',
  id: 'data-track-id',
  cta: 'data-track-cta',
} as const;

/** Caps that keep payloads small and safe. */
export const LIMITS = {
  /** Max characters for any single string field (label, page, id). */
  maxStringLength: 300,
  /** Max serialized size (bytes) of a metadata bag before it is dropped. */
  maxMetadataBytes: 2_048,
  /** Max entries kept in the client navigation path. */
  maxNavPath: 30,
} as const;

/**
 * Referrer source classification. First matching host substring wins;
 * `direct` when there is no referrer, `internal` for same-origin, else `referral`.
 */
export const REFERRER_SOURCES: Array<{ source: string; medium: string; match: string[] }> = [
  { source: 'google', medium: 'organic', match: ['google.'] },
  { source: 'bing', medium: 'organic', match: ['bing.com'] },
  { source: 'yahoo', medium: 'organic', match: ['yahoo.'] },
  { source: 'duckduckgo', medium: 'organic', match: ['duckduckgo.com'] },
  { source: 'facebook', medium: 'social', match: ['facebook.com', 'fb.com', 'fb.me'] },
  { source: 'instagram', medium: 'social', match: ['instagram.com'] },
  { source: 'twitter', medium: 'social', match: ['twitter.com', 't.co', 'x.com'] },
  { source: 'linkedin', medium: 'social', match: ['linkedin.com', 'lnkd.in'] },
  { source: 'youtube', medium: 'social', match: ['youtube.com', 'youtu.be'] },
  { source: 'whatsapp', medium: 'social', match: ['whatsapp.com', 'wa.me'] },
  { source: 'pinterest', medium: 'social', match: ['pinterest.'] },
  { source: 'reddit', medium: 'social', match: ['reddit.com'] },
];

/** UTM query keys captured + persisted for the session. */
export const UTM_KEYS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
] as const;

/** sessionStorage key holding the first-touch UTM/referrer for this session. */
export const ATTRIBUTION_STORAGE_KEY = 'jivo.track.attribution';
