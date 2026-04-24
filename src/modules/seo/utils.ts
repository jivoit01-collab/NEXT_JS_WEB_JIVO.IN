import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import { siteDefaultSeo } from './data/defaults';
import { getSeoByPage } from './data/queries';
import type { SeoDefaults, RobotsDirective } from './types';

/** Convert a stored filename (or legacy path) to an API-served URL */
function resolveImageUrl(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  // Already an absolute URL or a path — pass through
  if (value.startsWith('http') || value.startsWith('/')) return value;
  // Bare filename → serve through API
  return `/api/uploads/${value}`;
}

function parseRobots(value: string): Metadata['robots'] {
  const v = (value as RobotsDirective) ?? 'index,follow';
  return {
    index: !v.includes('noindex'),
    follow: !v.includes('nofollow'),
  };
}

/**
 * Wrap the title so Next.js's parent `title.template` (`%s | Jivo Wellness`)
 * doesn't double-append the brand suffix when the resolved title already
 * contains it.
 */
function buildTitle(title: string): { absolute: string } | string {
  if (title.includes(SITE_NAME)) return { absolute: title };
  return title;
}

/**
 * Builds Next.js Metadata with the priority chain:
 *   DB row (SeoMeta) > module default > siteDefaultSeo
 *
 * Use inside every public page's `generateMetadata`:
 *
 *   export async function generateMetadata() {
 *     return resolveSeo('home', defaultSeo);
 *   }
 */
export async function resolveSeo(
  page: string,
  moduleDefault?: SeoDefaults,
): Promise<Metadata> {
  const dbSeo = await getSeoByPage(page).catch(() => null);

  const merged = {
    ...siteDefaultSeo,
    ...(moduleDefault ?? {}),
    // Only spread DB values when they're non-null/non-empty so that absent fields
    // inherit from defaults (vs. clobbering with `null`).
    ...(dbSeo
      ? {
          metaTitle: dbSeo.metaTitle ?? siteDefaultSeo.metaTitle,
          metaDescription: dbSeo.metaDescription ?? siteDefaultSeo.metaDescription,
          keywords: dbSeo.keywords?.length ? dbSeo.keywords : siteDefaultSeo.keywords,
          ogTitle: dbSeo.ogTitle ?? siteDefaultSeo.ogTitle,
          ogDescription: dbSeo.ogDescription ?? siteDefaultSeo.ogDescription,
          ogImage: dbSeo.ogImage ?? siteDefaultSeo.ogImage,
          twitterCard: (dbSeo.twitterCard as 'summary' | 'summary_large_image') ?? siteDefaultSeo.twitterCard,
          canonicalUrl: dbSeo.canonicalUrl ?? siteDefaultSeo.canonicalUrl,
          structuredData: (dbSeo.structuredData as Record<string, unknown> | null) ?? siteDefaultSeo.structuredData,
          robots: (dbSeo.robots as RobotsDirective) ?? siteDefaultSeo.robots,
        }
      : {}),
  };

  const title = buildTitle(merged.metaTitle);
  const titleString =
    typeof title === 'string' ? title : title.absolute;

  const metadata: Metadata = {
    title,
    description: merged.metaDescription ?? undefined,
    keywords: merged.keywords,
    robots: parseRobots(merged.robots),
    openGraph: {
      title: merged.ogTitle ?? titleString,
      description: merged.ogDescription ?? merged.metaDescription ?? undefined,
      url: merged.canonicalUrl ?? `${SITE_URL}/${page === 'home' ? '' : page}`,
      siteName: SITE_NAME,
      locale: 'en_IN',
      type: 'website',
      images: resolveImageUrl(merged.ogImage)
        ? [{ url: resolveImageUrl(merged.ogImage)!, width: 1200, height: 630, alt: merged.ogTitle ?? titleString }]
        : [],
    },
    twitter: {
      card: merged.twitterCard,
      title: merged.ogTitle ?? titleString,
      description: merged.ogDescription ?? merged.metaDescription ?? undefined,
      images: resolveImageUrl(merged.ogImage) ? [resolveImageUrl(merged.ogImage)!] : undefined,
    },
    alternates: merged.canonicalUrl ? { canonical: merged.canonicalUrl } : undefined,
  };

  return metadata;
}

/**
 * Returns the JSON-LD object (or null) so a page can render
 * <JsonLd data={getStructuredData(...)} /> in the body.
 * Always injects "@context": "https://schema.org" if missing.
 */
export async function getStructuredData(
  page: string,
  moduleDefault?: SeoDefaults,
): Promise<Record<string, unknown> | Record<string, unknown>[] | null> {
  const dbSeo = await getSeoByPage(page).catch(() => null);
  const raw =
    (dbSeo?.structuredData as Record<string, unknown> | null) ??
    moduleDefault?.structuredData ??
    siteDefaultSeo.structuredData ??
    null;

  if (!raw) return null;

  const SCHEMA_CONTEXT = 'https://schema.org';
  if (Array.isArray(raw)) {
    return (raw as Record<string, unknown>[]).map((item) =>
      item['@context'] ? item : { '@context': SCHEMA_CONTEXT, ...item },
    );
  }
  return raw['@context'] ? raw : { '@context': SCHEMA_CONTEXT, ...raw };
}
