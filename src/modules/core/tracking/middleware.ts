// ==========================================================================
// Tracking "middleware" — pure, framework-free helpers that inspect the DOM
// and classify navigation. Kept side-effect-free so they are trivially testable
// and reusable by the engine, hooks and future consumers.
// ==========================================================================

import {
  DOWNLOAD_EXTENSIONS,
  NO_TRACK_ATTR,
  REFERRER_SOURCES,
  TRACK_ATTRS,
  TRACK_EVENT,
  UTM_KEYS,
  type TrackEventType,
} from './constants';
import { sanitizeString } from './validations';
import type { ReferrerInfo } from './types';

/** Same-origin check that never throws. */
export function isInternalUrl(href: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return new URL(href, window.location.href).origin === window.location.origin;
  } catch {
    return true; // relative / malformed → treat as internal
  }
}

/** External http(s) link? (mailto:, tel:, #anchors, js: are NOT external). */
export function isExternalLink(href: string | null | undefined): boolean {
  if (!href) return false;
  if (/^(mailto:|tel:|sms:|javascript:|#)/i.test(href)) return false;
  return !isInternalUrl(href);
}

/** Returns the download extension for a URL, or null. */
export function getDownloadExtension(href: string | null | undefined): string | null {
  if (!href) return null;
  let pathname = href;
  try {
    pathname = new URL(href, typeof window !== 'undefined' ? window.location.href : 'https://x').pathname;
  } catch {
    /* keep raw href */
  }
  const match = /\.([a-z0-9]{1,5})(?:$|\?|#)/i.exec(pathname);
  const ext = match?.[1]?.toLowerCase();
  return ext && (DOWNLOAD_EXTENSIONS as readonly string[]).includes(ext) ? ext : null;
}

/** Should this element (or any ancestor) be ignored entirely? */
export function isOptedOut(el: Element | null): boolean {
  return !!el?.closest(`[${NO_TRACK_ATTR}]`);
}

/** A human label for an interactive element (aria-label → data-track-name → text → title). */
export function readElementLabel(el: HTMLElement): string | undefined {
  const explicit =
    el.getAttribute(TRACK_ATTRS.name) ||
    el.getAttribute('aria-label') ||
    el.getAttribute('data-testid');
  if (explicit) return sanitizeString(explicit, 120);
  const text = el.textContent?.trim();
  if (text) return sanitizeString(text, 120);
  const title = el.getAttribute('title') || el.getAttribute('alt');
  return title ? sanitizeString(title, 120) : undefined;
}

/** The nearest element worth tracking a click on (button / link / opt-in). */
export function findTrackable(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  const el = target.closest<HTMLElement>(
    `a, button, [role="button"], [${TRACK_ATTRS.track}]`,
  );
  return el && !isOptedOut(el) ? el : null;
}

export interface ClickClassification {
  eventType: TrackEventType;
  entityType: string;
  entityId?: string;
  label?: string;
  metadata: Record<string, unknown>;
}

/** Classify a trackable element into an event (type + entity + metadata). */
export function classifyClick(el: HTMLElement): ClickClassification {
  const label = readElementLabel(el);
  const forcedType = el.getAttribute(TRACK_ATTRS.type);
  const trackId = el.getAttribute(TRACK_ATTRS.id) || el.id || undefined;
  const isCta = el.hasAttribute(TRACK_ATTRS.cta);

  const anchor = el.closest('a');
  const href = anchor?.getAttribute('href') ?? undefined;
  const metadata: Record<string, unknown> = {};
  if (label) metadata.label = label;
  if (isCta) metadata.isCta = true;

  // Explicit override wins.
  if (forcedType) {
    return {
      eventType: (forcedType as TrackEventType) || TRACK_EVENT.CUSTOM,
      entityType: 'custom',
      entityId: sanitizeString(trackId ?? label, 200),
      label,
      metadata,
    };
  }

  // Links: download vs external vs internal.
  if (anchor && href) {
    const ext = getDownloadExtension(href);
    if (ext) {
      metadata.fileType = ext;
      metadata.href = sanitizeString(href, 300);
      return { eventType: TRACK_EVENT.DOWNLOAD, entityType: 'download', entityId: sanitizeString(href, 200), label, metadata };
    }
    metadata.href = sanitizeString(href, 300);
    metadata.external = isExternalLink(href);
    return {
      eventType: TRACK_EVENT.LINK_CLICK,
      entityType: metadata.external ? 'external-link' : 'link',
      entityId: sanitizeString(trackId ?? href, 200),
      label,
      metadata,
    };
  }

  // Everything else clickable → button.
  return {
    eventType: TRACK_EVENT.BUTTON_CLICK,
    entityType: 'button',
    entityId: sanitizeString(trackId ?? label, 200),
    label,
    metadata,
  };
}

/** Classify `document.referrer` into a source/medium. */
export function classifyReferrer(referrer: string | undefined): ReferrerInfo {
  if (!referrer) return { source: 'direct', medium: 'none' };

  let host = '';
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return { source: 'direct', medium: 'none' };
  }

  if (typeof window !== 'undefined' && host === window.location.hostname) {
    return { source: 'internal', medium: 'internal' };
  }

  for (const entry of REFERRER_SOURCES) {
    if (entry.match.some((m) => host.includes(m))) {
      return { source: entry.source, medium: entry.medium, url: referrer };
    }
  }
  return { source: host || 'referral', medium: 'referral', url: referrer };
}

/** Pull the utm_* params off a URL's query string. */
export function readUtmParams(search: string): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const params = new URLSearchParams(search);
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      const clean = sanitizeString(value, 200);
      if (clean) out[key] = clean;
    }
  } catch {
    /* ignore malformed query */
  }
  return out;
}
