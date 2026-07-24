import type { TrackEventType } from './constants';

/** What a caller passes to `track(...)`. Ids/session are added by the engine. */
export interface TrackEventInput {
  eventType: TrackEventType;
  /** Page path this event belongs to. Defaults to the current path. */
  page?: string;
  /** Semantic group, e.g. 'button', 'video', 'form', 'download'. */
  entityType?: string;
  /** Stable identifier for the thing interacted with. */
  entityId?: string;
  /** Small JSON bag of extra context (size-capped + sanitized). */
  metadata?: Record<string, unknown>;
}

/** An event as it sits in the queue (adds bookkeeping the sender needs). */
export interface QueuedEvent {
  eventType: TrackEventType;
  page?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  visitorId: string;
  sessionId: string;
  /** ISO timestamp captured at enqueue time (client clock; server clamps it). */
  timestamp: string;
  /** Failed-send counter (never serialized to the API payload). */
  _retries?: number;
}

/** Result of classifying `document.referrer`. */
export interface ReferrerInfo {
  /** 'direct' | 'internal' | a known engine/social source | 'referral'. */
  source: string;
  /** 'none' | 'internal' | 'organic' | 'social' | 'referral'. */
  medium: string;
  /** Raw referrer URL (external only). */
  url?: string;
}

/** First-touch attribution captured once per session. */
export interface Attribution {
  referrer: ReferrerInfo;
  /** UTM params present on the landing URL (keys are the `utm_*` names). */
  utm: Record<string, string>;
  landingPage: string;
  capturedAt: string;
}

/** Identity + session context the engine runs with. */
export interface TrackingContext {
  visitorId: string;
  sessionId: string;
}

/** Public surface returned by `useTracking()`. */
export interface TrackingApi {
  /** True when consent allows tracking (otherwise every call below is a no-op). */
  enabled: boolean;
  track: (event: TrackEventInput) => void;
  trackEvent: (name: string, metadata?: Record<string, unknown>) => void;
  trackClick: (name: string, metadata?: Record<string, unknown>) => void;
  trackSearch: (query: string, resultsCount?: number) => void;
  trackDownload: (fileUrl: string, metadata?: Record<string, unknown>) => void;
  trackVideo: (
    action: 'play' | 'pause' | 'complete' | 'progress',
    videoId: string,
    metadata?: Record<string, unknown>,
  ) => void;
  trackForm: (
    action: 'open' | 'start' | 'submit' | 'success' | 'error',
    formId: string,
    metadata?: Record<string, unknown>,
  ) => void;
  /** Force-flush the queue (rarely needed; the engine flushes automatically). */
  flush: () => void;
}
