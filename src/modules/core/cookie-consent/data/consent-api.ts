import type { ConsentCategory, ConsentStatus } from '../constants';

/**
 * Thin client for the EXISTING Phase 1 analytics endpoints.
 * No new endpoints are introduced — this module reuses:
 *   POST/GET /api/analytics/cookie   POST /api/analytics/visitor
 *   POST     /api/analytics/session  POST /api/analytics/events
 */

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function postJson<T>(url: string, body: unknown): Promise<ApiEnvelope<T>> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true, // survives page unload (beacon-like)
  });
  return (await res.json()) as ApiEnvelope<T>;
}

// ── Consent ──────────────────────────────────────────────────

export interface ServerConsent {
  visitorId: string;
  status: ConsentStatus;
  acceptedCategories: ConsentCategory[];
  version: string;
  acceptedAt: string | null;
}

export async function recordConsent(payload: {
  visitorId: string;
  status: ConsentStatus;
  acceptedCategories: ConsentCategory[];
}): Promise<ServerConsent | null> {
  const res = await postJson<ServerConsent>('/api/analytics/cookie', payload);
  return res.success ? (res.data ?? null) : null;
}

export async function fetchServerConsent(visitorId: string): Promise<ServerConsent | null> {
  try {
    const res = await fetch(
      `/api/analytics/cookie?visitorId=${encodeURIComponent(visitorId)}`,
      { cache: 'no-store' },
    );
    const json = (await res.json()) as ApiEnvelope<ServerConsent | null>;
    return json.success ? (json.data ?? null) : null;
  } catch {
    return null;
  }
}

// ── Analytics (only called when ANALYTICS consent is granted) ──

export interface VisitorIdentifyPayload {
  visitorId: string;
  language?: string;
  timezone?: string;
  screenWidth?: number;
  screenHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  platform?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export async function identifyVisitor(payload: VisitorIdentifyPayload): Promise<boolean> {
  const res = await postJson('/api/analytics/visitor', payload);
  return res.success;
}

export async function startSession(payload: {
  sessionId: string;
  visitorId: string;
  entryPage?: string;
}): Promise<boolean> {
  const res = await postJson('/api/analytics/session', payload);
  return res.success;
}

export async function endSession(payload: {
  sessionId: string;
  visitorId: string;
  exitPage?: string;
}): Promise<boolean> {
  const res = await postJson('/api/analytics/session', { ...payload, end: true });
  return res.success;
}

export interface EventPayload {
  eventType: string;
  page?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  visitorId?: string;
  sessionId?: string;
}

export async function sendEvent(payload: EventPayload): Promise<boolean> {
  const res = await postJson('/api/analytics/events', payload);
  return res.success;
}
