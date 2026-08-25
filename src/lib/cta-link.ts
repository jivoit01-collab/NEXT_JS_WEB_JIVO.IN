/**
 * Resolves an admin-entered CTA link into a usable href.
 *
 * Admins type links the way they say them — "shop.jivo.in", not
 * "https://shop.jivo.in". A bare domain in an <a href> is treated as a RELATIVE
 * path, so on /products/canola-oils it resolved to
 * /products/shop.jivo.in and 404'd. This normalises the value and reports
 * whether it points off-site, so the caller can add target/rel correctly.
 *
 * Handled shapes:
 *   https://shop.jivo.in   → external, unchanged
 *   //shop.jivo.in         → external, protocol-relative
 *   shop.jivo.in           → external, https:// added
 *   mailto:a@b.com, tel:…  → external-ish scheme, unchanged, no target=_blank
 *   /our-products, #buy    → internal, unchanged
 */

import { SITE_URL } from './constants';

export interface ResolvedCtaLink {
  href: string;
  /** True when the link leaves the site and should open in a new tab. */
  isExternal: boolean;
}

/**
 * Hostnames that count as "our own site" — a full URL pointing at any of these
 * opens in the SAME tab, even when the admin typed the whole https://host/path.
 * Includes the configured SITE_URL host plus localhost (dev), so a link like
 * `https://jivo.in/products/sunflower-oils` is treated as internal.
 *
 * NOTE: the storefront (shop.jivo.in) is a DIFFERENT host and is intentionally
 * NOT listed — buy links stay external and open in a new tab.
 */
const OWN_HOSTS = (() => {
  const hosts = new Set<string>(['localhost', '127.0.0.1']);
  try {
    hosts.add(new URL(SITE_URL).hostname.toLowerCase());
  } catch {
    // SITE_URL malformed — fall back to the literal below.
    hosts.add('jivo.in');
  }
  return hosts;
})();

/**
 * True when an absolute http(s) URL points at one of our own hosts.
 *
 * `currentHost` (optional) is the live browser hostname. It is passed in by the
 * caller AFTER hydration rather than read from `window` here, so this function
 * stays pure and deterministic — server and first-client render classify
 * identically (no hydration mismatch), and the live host is honoured only once
 * the caller supplies it.
 */
function isOwnHost(url: string, currentHost?: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (OWN_HOSTS.has(host)) return true;
    if (currentHost && host === currentHost.toLowerCase()) return true;
    return false;
  } catch {
    return false;
  }
}

/** Schemes that are valid but must NOT get target="_blank" (mail/phone apps). */
const NON_HTTP_SCHEME = /^(mailto:|tel:|sms:)/i;

/** Any explicit scheme, e.g. https:, http:, ftp:. */
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/**
 * A bare host: at least one dot, no spaces, no leading slash — e.g.
 * "shop.jivo.in", "jivo.in/offers". Deliberately conservative so internal
 * paths and fragments are never rewritten.
 */
const BARE_DOMAIN = /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/.*)?$/i;

export function resolveCtaLink(
  raw: string | null | undefined,
  fallback = '/',
  /** Live browser hostname (passed post-hydration) — see isOwnHost. */
  currentHost?: string,
): ResolvedCtaLink {
  const value = (raw ?? '').trim();
  if (!value) return { href: fallback, isExternal: false };

  // mailto:/tel:/sms: — valid targets, but opening a new tab leaves a blank one.
  if (NON_HTTP_SCHEME.test(value)) {
    return { href: value, isExternal: false };
  }

  // Already has a scheme (https://, http://…).
  if (HAS_SCHEME.test(value)) {
    // A full URL on OUR OWN host is internal — open in the same tab. Reduce it
    // to a path+query+hash so next/link navigates client-side instead of doing
    // a full external page load.
    if (isOwnHost(value, currentHost)) {
      try {
        const u = new URL(value);
        return { href: `${u.pathname}${u.search}${u.hash}` || '/', isExternal: false };
      } catch {
        return { href: value, isExternal: false };
      }
    }
    return { href: value, isExternal: true };
  }

  // Protocol-relative //host/path.
  if (value.startsWith('//')) {
    return { href: `https:${value}`, isExternal: true };
  }

  // Internal path, query or fragment.
  if (value.startsWith('/') || value.startsWith('#') || value.startsWith('?')) {
    return { href: value, isExternal: false };
  }

  // Bare domain typed without a scheme — the case this helper exists for.
  if (BARE_DOMAIN.test(value)) {
    const withScheme = `https://${value}`;
    // Bare own-host (e.g. "jivo.in/products/..") is internal → same tab.
    if (isOwnHost(withScheme, currentHost)) {
      try {
        const u = new URL(withScheme);
        return { href: `${u.pathname}${u.search}${u.hash}` || '/', isExternal: false };
      } catch {
        return { href: `/${value}`, isExternal: false };
      }
    }
    return { href: withScheme, isExternal: true };
  }

  // Anything else (e.g. "our-products") is treated as an internal relative path.
  return { href: value.startsWith('/') ? value : `/${value}`, isExternal: false };
}
