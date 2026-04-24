/**
 * PUBLIC_ROUTES — the single source of truth for all public pages in the sitemap.
 *
 * ✅ Add a path here when you create a new public page.
 * ❌ Never add admin, api, auth, cart, checkout, or private paths.
 *
 * Dynamic pages (products, blog posts) are picked up automatically from the
 * database — no entry needed here for individual slugs.
 */
export const PUBLIC_ROUTES = [
  '/',
  '/our-essence/the-story',
  '/our-essence/core-values',
  '/community',
  '/media',
  '/our-products',
] as const;

export type PublicRoute = (typeof PUBLIC_ROUTES)[number];
