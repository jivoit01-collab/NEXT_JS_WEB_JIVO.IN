import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '@/lib/constants';

/** Clean public base for uploaded media (rewritten to the runtime file server).
 *  Kept in sync with UPLOADS_PUBLIC_BASE in components/shared/safe-image.ts. */
const UPLOADS_PUBLIC_BASE = '/uploads/images';

/**
 * Make an image reference absolute and route it through the clean uploads path.
 * OG/Twitter cards and JSON-LD must use fully-qualified https URLs — social
 * scrapers and Google reject or ignore relative paths — so:
 *   - external URLs (http/https/data) pass through unchanged;
 *   - a bare filename or an /uploads|/api/uploads path is normalized to the
 *     clean /uploads/images/<file> path and prefixed with SITE_URL.
 */
export function absoluteImageUrl(raw: string): string {
  if (!raw) return `${SITE_URL}${UPLOADS_PUBLIC_BASE}/og-default.png`;
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) {
    return raw;
  }
  // Reduce any known local form to the bare filename, then rebuild on the clean path.
  const filename = raw
    .replace(/^\/api\/uploads\//, '')
    .replace(/^\/uploads\/images\//, '')
    .replace(/^\/uploads\//, '')
    .replace(/^\//, '');
  return `${SITE_URL}${UPLOADS_PUBLIC_BASE}/${filename}`;
}

interface SeoParams {
  title: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export function generateSeoMetadata({
  title,
  description = SITE_DESCRIPTION,
  keywords = [],
  ogImage = 'og-default.png',
  canonicalUrl,
  noIndex = false,
}: SeoParams): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const url = canonicalUrl ? `${SITE_URL}${canonicalUrl}` : undefined;
  // Absolute, clean-path image URL for social/Google crawlers.
  const ogImageUrl = absoluteImageUrl(ogImage);

  return {
    title: fullTitle,
    description,
    keywords,
    ...(noIndex && { robots: { index: false, follow: false } }),
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImageUrl],
    },
    ...(url && { alternates: { canonical: url } }),
  };
}

export function generateJsonLd(data: Record<string, unknown>) {
  return {
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      ...data,
    }),
  };
}

export function organizationJsonLd() {
  return generateJsonLd({
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteImageUrl('logo.svg'),
    sameAs: [
      'https://www.facebook.com/JivoWellness',
      'https://www.instagram.com/jivowellness',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-XXXXXXXXXX',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['en', 'hi'],
    },
  });
}
