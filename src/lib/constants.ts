export const SITE_NAME = 'Jivo Wellness';
export const SITE_DESCRIPTION =
  "India's Largest Cold Press Canola Oil Seller — Premium Oils, Superfoods & Wellness Products";
/**
 * The public site origin, resolved from the environment — the ONE place the
 * domain is decided. Set NEXT_PUBLIC_APP_URL per environment
 * (e.g. https://abc.jivo.in for staging, https://jivo.in in production);
 * the literal below is only the production fallback.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://jivo.in';

/** The storefront. A separate property, so it is NOT derived from SITE_URL. */
export const SHOP_URL = process.env.NEXT_PUBLIC_SHOP_URL ?? 'https://shop.jivo.in';

/**
 * Third-party marketplaces, CONFIGURATION-DRIVEN.
 *
 * A marketplace appears in the chat only when its URL is actually configured —
 * an unset variable means no card, never a guessed storefront link. Add a
 * marketplace by adding a row plus its env var; the planner and UI need no
 * change.
 */
export const MARKETPLACES: readonly { key: string; label: string; url: string }[] = [
  { key: 'amazon', label: 'Amazon', url: process.env.NEXT_PUBLIC_MARKETPLACE_AMAZON ?? '' },
  { key: 'flipkart', label: 'Flipkart', url: process.env.NEXT_PUBLIC_MARKETPLACE_FLIPKART ?? '' },
  { key: 'jiomart', label: 'JioMart', url: process.env.NEXT_PUBLIC_MARKETPLACE_JIOMART ?? '' },
  { key: 'bigbasket', label: 'BigBasket', url: process.env.NEXT_PUBLIC_MARKETPLACE_BIGBASKET ?? '' },
].filter((m) => m.url.trim().length > 0);

/**
 * Turn a CMS-relative path ("/products/canola-oils") into an absolute URL on the
 * current environment's domain. Absolute inputs are returned untouched, so
 * database URLs stay the source of truth.
 */
export function toAbsoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

/**
 * The origin shown to VISITORS (chat previews, shared links, card domains).
 *
 * `SITE_URL` is `http://localhost:3000` in development, which is correct for
 * navigating locally but must never be *displayed* — a visitor-facing card
 * reading "localhost" is meaningless and leaks the dev setup. Set
 * `NEXT_PUBLIC_PUBLIC_SITE_URL` per environment (e.g. https://abc.jivo.in for
 * staging); localhost falls back to the production domain.
 */
export const PUBLIC_SITE_URL = (() => {
  const explicit = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');
  const site = SITE_URL.replace(/\/$/, '');
  return /localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]/i.test(site) ? 'https://jivo.in' : site;
})();

/** Absolute URL on the PUBLIC origin — safe to show or share. */
export function toPublicUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${PUBLIC_SITE_URL}/${path.replace(/^\//, '')}`;
}

export const FREE_SHIPPING_THRESHOLD = 499;
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_UPLOAD_SIZE = 400 * 1024 * 1024; // 400MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

export const ITEMS_PER_PAGE = {
  products: 12,
  blog: 9,
  admin: 20,
  reviews: 5,
  orders: 10,
} as const;

export const RATE_LIMITS = {
  auth: { requests: 5, window: '1m' },
  contact: { requests: 3, window: '1m' },
  payment: { requests: 10, window: '1m' },
  general: { requests: 60, window: '1m' },
  admin: { requests: 120, window: '1m' },
} as const;
