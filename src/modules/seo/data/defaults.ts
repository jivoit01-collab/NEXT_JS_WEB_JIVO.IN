import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants';
import type { SeoData, SeoDefaults } from '../types';

/**
 * Brand-level fallback. Used when neither the DB row nor a module's
 * `defaultSeo` provides a value.
 */
export const siteDefaultSeo: Omit<SeoData, 'page'> = {
  metaTitle: `${SITE_NAME} — ${SITE_DESCRIPTION}`,
  metaDescription: SITE_DESCRIPTION,
  keywords: [
    'jivo wellness',
    'cold press oil',
    'canola oil',
    'wheatgrass juice',
    'healthy oils india',
    'wellness products india',
  ],
  ogTitle: SITE_NAME,
  ogDescription: SITE_DESCRIPTION,
  ogImage: 'og-default.png',
  twitterCard: 'summary_large_image',
  canonicalUrl: SITE_URL,
  structuredData: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
  },
  robots: 'index,follow',
};

/**
 * Convenience helper to declare a page's defaults with strong fallbacks
 * to siteDefaultSeo. Use inside each module's data/defaults.ts.
 */
export function definePageSeo(overrides: SeoDefaults): SeoDefaults {
  return overrides;
}
