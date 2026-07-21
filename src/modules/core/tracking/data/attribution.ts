// First-touch attribution: capture referrer + UTM ONCE per session and persist
// them so every later event/session can be attributed to the original source.

import { ATTRIBUTION_STORAGE_KEY } from '../constants';
import { classifyReferrer, readUtmParams } from '../middleware';
import type { Attribution } from '../types';

/**
 * Return this session's first-touch attribution, capturing + persisting it on
 * the first call. Later calls in the same session return the stored value
 * (so a mid-session navigation never overwrites the true entry source).
 */
export function getOrCaptureAttribution(nowIso: string): Attribution {
  if (typeof window === 'undefined') {
    return {
      referrer: { source: 'direct', medium: 'none' },
      utm: {},
      landingPage: '/',
      capturedAt: nowIso,
    };
  }

  const stored = readStoredAttribution();
  if (stored) return stored;

  const attribution: Attribution = {
    referrer: classifyReferrer(document.referrer || undefined),
    utm: readUtmParams(window.location.search),
    landingPage: window.location.pathname + window.location.search,
    capturedAt: nowIso,
  };

  try {
    window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    /* private mode — attribution just won't persist across reloads */
  }
  return attribution;
}

function readStoredAttribution(): Attribution | null {
  try {
    const raw = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Attribution;
    return parsed && parsed.referrer ? parsed : null;
  } catch {
    return null;
  }
}
