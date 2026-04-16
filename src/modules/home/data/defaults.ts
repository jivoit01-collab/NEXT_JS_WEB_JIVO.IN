import { definePageSeo } from '@/modules/seo';
import { SITE_URL } from '@/lib/constants';

/**
 * Strong SEO defaults for the Home page.
 * Used as fallback in `generateMetadata()` via `resolveSeo("home", defaultSeo)`
 * when the admin hasn't yet customized SEO from `/admin/seo`.
 */
export const defaultSeo = definePageSeo({
  metaTitle: "Jivo Wellness — India's Largest Cold Press Canola Oil Seller",
  metaDescription:
    'Premium cold press canola oil, wheatgrass juice, natural minerals & superfoods — crafted with truth, devotion, and sewa. Discover wellness products you can trust.',
  keywords: [
    'jivo wellness',
    'cold press canola oil',
    'canola oil india',
    'wheatgrass juice',
    'cooking oil',
    'super foods',
    'natural mineral water',
    'pure desi ghee',
    'mustard oil',
    'olive oil india',
  ],
  ogTitle: "Jivo Wellness — Pure, Honest, Wellness-First Products",
  ogDescription:
    'Cold press oils, wheatgrass juice, superfoods & wellness products born from a mission of service.',
  ogImage: 'og-default.png',
  twitterCard: 'summary_large_image',
  canonicalUrl: SITE_URL,
  robots: 'index,follow',
  structuredData: {
    '@type': 'WebSite',
    name: 'Jivo Wellness',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/products?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  },
});
