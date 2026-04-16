import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '@/lib/constants';

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
  ogImage = '/api/uploads/og-default.png',
  canonicalUrl,
  noIndex = false,
}: SeoParams): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const url = canonicalUrl ? `${SITE_URL}${canonicalUrl}` : undefined;

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
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
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
    logo: `${SITE_URL}/api/uploads/logo.svg`,
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
