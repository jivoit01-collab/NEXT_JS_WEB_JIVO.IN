import 'server-only';

// ==========================================================================
// URL preview resolver — the WhatsApp-style unfurl for chat link cards.
//
// Metadata comes from the CMS `SeoMeta` table, NOT from fetching the public page
// over HTTP: the same data is already in the database, so a network round-trip
// per chat turn would add latency for nothing (and would fail for staging hosts
// that aren't reachable from the server). Priority, per spec:
//
//   1. existing CMS/SEO data   ← implemented here
//   2. page OG metadata        ← same values; SeoMeta IS what the page renders
//   3. HTML title/meta         ← n/a for our own pages
//
// The AI provider is never involved. Nothing is duplicated into any new table.
// ==========================================================================

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';
import { SITE_URL, SITE_NAME, PUBLIC_SITE_URL } from '@/lib/constants';
import { resolveImageUrl } from '@/modules/seo/utils';

/** The client-facing preview contract. */
export interface PagePreview {
  url: string;
  title: string;
  description: string | null;
  image: string | null;
  siteName: string;
  domain: string;
}

/**
 * Absolute URL on the PUBLIC origin — this is what a visitor sees and clicks, so
 * it must never read "localhost" even when developing locally.
 */
function absolute(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${PUBLIC_SITE_URL}/${pathOrUrl.replace(/^\//, '')}`;
}

/**
 * Absolute URL on the RUNNING origin. Used only for the OG image `src`, which
 * the browser must actually be able to load — in development that really is
 * localhost, and a jivo.in URL would 404 against an unpublished upload.
 */
function runtimeAbsolute(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL.replace(/\/$/, '')}/${pathOrUrl.replace(/^\//, '')}`;
}

/** Host of a URL, for the card's footer line ("abc.jivo.in"). */
function domainOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
}

/** Path from a canonical URL, used as the lookup key. */
function toPath(canonical: string | null): string | null {
  if (!canonical) return null;
  try {
    return new URL(canonical).pathname.replace(/\/$/, '') || '/';
  } catch {
    return canonical.startsWith('/') ? canonical.replace(/\/$/, '') || '/' : null;
  }
}

async function query(): Promise<Record<string, PagePreview>> {
  const rows = await prisma.seoMeta.findMany({
    select: {
      page: true,
      metaTitle: true,
      metaDescription: true,
      ogTitle: true,
      ogDescription: true,
      ogImage: true,
      canonicalUrl: true,
    },
  });

  const map: Record<string, PagePreview> = {};
  for (const r of rows) {
    const path = toPath(r.canonicalUrl) ?? (r.page === 'home' ? '/' : null);
    if (!path) continue;

    // The stored value is usually a BARE FILENAME ("og-default.png"). Run it
    // through the SEO module's resolver (→ "/api/uploads/og-default.png") and
    // then make it absolute — a relative src is what rendered as a broken image.
    const resolved = resolveImageUrl(r.ogImage);

    map[path] = {
      url: absolute(path),
      // Strip the "| Jivo Wellness" suffix; the card already shows the domain.
      title: (r.ogTitle || r.metaTitle || '').split('|')[0]?.trim() || r.metaTitle,
      description: r.ogDescription || r.metaDescription || null,
      image: resolved ? runtimeAbsolute(resolved) : null,
      siteName: SITE_NAME,
      domain: domainOf(absolute(path)),
    };
  }
  return map;
}

const readCached = unstable_cache(query, ['jivo:page-previews'], {
  tags: ['seo', 'page-previews'],
  revalidate: 3600,
});

/**
 * Cached read (1h TTL). `unstable_cache` only works inside a Next request scope,
 * so outside one (scripts, tests) fall back to an uncached query rather than
 * returning nothing — an empty map would silently drop every preview.
 */
export async function getPagePreviews(): Promise<Record<string, PagePreview>> {
  try {
    return await readCached();
  } catch {
    try {
      return await query();
    } catch {
      return {};
    }
  }
}

/** Look up one page's preview by its site-relative path (or absolute URL). */
export function previewForUrl(
  previews: Record<string, PagePreview>,
  url: string | null | undefined,
): PagePreview | null {
  if (!url) return null;
  let path = url;
  if (/^https?:\/\//i.test(url)) {
    try {
      path = new URL(url).pathname;
    } catch {
      return null;
    }
  }
  const key = path.split(/[?#]/)[0]?.replace(/\/$/, '') || '/';
  return previews[key] ?? null;
}

/**
 * The storefront preview. shop.jivo.in is a separate property with no SeoMeta
 * row, so its card copy lives here rather than being invented per request.
 */
export function shopPreview(shopUrl: string): PagePreview {
  return {
    url: shopUrl,
    title: 'Shop Jivo Products',
    description: 'Explore and buy the full range of Jivo oils and wellness products online.',
    image: null,
    siteName: 'Jivo Shop',
    domain: domainOf(shopUrl),
  };
}
