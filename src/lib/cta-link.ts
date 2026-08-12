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

export interface ResolvedCtaLink {
  href: string;
  /** True when the link leaves the site and should open in a new tab. */
  isExternal: boolean;
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

export function resolveCtaLink(raw: string | null | undefined, fallback = '/'): ResolvedCtaLink {
  const value = (raw ?? '').trim();
  if (!value) return { href: fallback, isExternal: false };

  // mailto:/tel:/sms: — valid targets, but opening a new tab leaves a blank one.
  if (NON_HTTP_SCHEME.test(value)) {
    return { href: value, isExternal: false };
  }

  // Already has a scheme (https://, http://…).
  if (HAS_SCHEME.test(value)) {
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
    return { href: `https://${value}`, isExternal: true };
  }

  // Anything else (e.g. "our-products") is treated as an internal relative path.
  return { href: value.startsWith('/') ? value : `/${value}`, isExternal: false };
}
