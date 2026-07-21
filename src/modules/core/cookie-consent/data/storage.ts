import {
  CONSENT_STORAGE_KEY,
  SESSION_STORAGE_KEY,
  VISITOR_STORAGE_KEY,
} from '../constants';
import { storedConsentSchema } from '../validations';
import type { ConsentState } from '../types';

/** SSR-safe browser check. */
function hasWindow(): boolean {
  return typeof window !== 'undefined';
}

/** Generate a client identifier that matches the server regex `^[A-Za-z0-9_-]{8,64}$`. */
function generateId(prefix: string): string {
  const uuid =
    hasWindow() && typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}${uuid}`.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64);
}

/** Read + validate the persisted consent. Returns null when absent/corrupt. */
export function readStoredConsent(): ConsentState | null {
  if (!hasWindow()) return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = storedConsentSchema.safeParse(JSON.parse(raw));
    return parsed.success ? (parsed.data as ConsentState) : null;
  } catch {
    return null;
  }
}

export function writeStoredConsent(state: ConsentState): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage may be full/blocked (private mode) — fail silently */
  }
}

export function clearStoredConsent(): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Stable per-browser visitor id (persists across sessions). */
export function getOrCreateVisitorId(): string {
  if (!hasWindow()) return generateId('v_');
  try {
    const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY);
    if (existing && /^[A-Za-z0-9_-]{8,64}$/.test(existing)) return existing;
    const id = generateId('v_');
    window.localStorage.setItem(VISITOR_STORAGE_KEY, id);
    return id;
  } catch {
    return generateId('v_');
  }
}

/** Per-tab session id (resets when the tab/session storage clears). */
export function getOrCreateSessionId(): string {
  if (!hasWindow()) return generateId('s_');
  try {
    const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing && /^[A-Za-z0-9_-]{8,64}$/.test(existing)) return existing;
    const id = generateId('s_');
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, id);
    return id;
  } catch {
    return generateId('s_');
  }
}
