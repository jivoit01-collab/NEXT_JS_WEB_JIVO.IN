import { definePageSeo } from '@/modules/seo';
import { SITE_URL } from '@/lib/constants';
import type {
  DesiGheeHeroContent,
  DesiGheeRangeContent,
  DesiGheeHighlightsContent,
  DesiGheeBilonaContent,
} from '../types';

// ── Default section content (matches screenshots) ─────────────

/**
 * Shown when the DB isn't seeded, a section row is missing/inactive, or an
 * admin hasn't uploaded art yet. `/api/uploads/[filename]` serves this file
 * for any unresolved path, so it is always safe.
 */
const PLACEHOLDER = '/api/uploads/placeholder.png';

export const defaultHeroContent: DesiGheeHeroContent = {
  logoImage: PLACEHOLDER,
  heading: 'A2 COW GHEE',
  subtitleLineOne: 'A smart blend of two oils for balanced, heart-healthy',
  subtitleLineTwo: 'goodness every day.',
  ctaLabel: 'BUY ALL',
  ctaHref: '/our-products',
  productImage: PLACEHOLDER,
  // Optional second jar layered in front; empty renders a single jar.
  productImageSecondary: '',
};

export const defaultRangeContent: DesiGheeRangeContent = {
  heading: 'A2 COW GHEE RANGE OF PRODUCTS',
  variants: [
    { image: PLACEHOLDER, label: '500 ml', href: '' },
    { image: PLACEHOLDER, label: '1 Litre', href: '' },
  ],
};

export const defaultHighlightsContent: DesiGheeHighlightsContent = {
  heading: 'KEY HIGHLIGHTS',
  highlights: [
    {
      label: 'From a Pure Source:',
      description: 'A2 milk from free-grazing, indigenous cow breeds.',
    },
    {
      label: 'The Ancestral Method:',
      description: 'Patiently churned from whole curd, not industrial cream.',
    },
    {
      label: 'Vital Fat-Soluble Vitamins:',
      description:
        'Contains vitamins A, D, and E, aiding normal nutrient absorption and body functions.',
    },
  ],
  backgroundImage: PLACEHOLDER,
};

export const defaultBilonaContent: DesiGheeBilonaContent = {
  heading: 'THE ART OF BILONA CHURNING',
  paragraph: [
    'While most modern ghee is made quickly from cream, we embrace the slow, rhythmic art of the Bilona method. This is a craft of patience, not production.',
    'Whole A2 milk is first cultured into curd, preserving its complete nutritional goodness. This living curd is then slow-churned in the traditional two-way motion to gently separate the purest butter, or makhan.',
    'It is this precious, cultured butter that is then clarified over a slow fire, its essence patiently revealed. This method preserves the complete, life-giving nourishment of the milk, resulting in a Ghee that is profoundly richer in aroma and flavour.',
  ].join('\n\n'),
  backgroundImage: PLACEHOLDER,
};

export const defaultSeo = definePageSeo({
  metaTitle: 'A2 Cow Ghee | Our Products | Jivo Wellness',
  metaDescription:
    'Jivo A2 Cow Ghee — made the traditional Bilona way from cultured whole curd of free-grazing indigenous cows. Rich in vitamins A, D and E.',
  keywords: [
    'jivo a2 cow ghee',
    'a2 desi ghee',
    'bilona ghee',
    'vedic bilona ghee',
    'desi cow ghee',
    'a2 ghee 1 litre',
    'a2 ghee 500ml',
    'cultured curd ghee',
    'indigenous cow ghee',
    'pure desi ghee india',
  ],
  ogTitle: 'Jivo A2 Cow Ghee — Traditional Bilona Churned',
  ogDescription:
    'Slow-churned from cultured whole curd of free-grazing indigenous cows — richer in aroma and flavour.',
  ogImage: 'og-default.png',
  twitterCard: 'summary_large_image',
  canonicalUrl: `${SITE_URL}/products/desi-ghee`,
  robots: 'index,follow',
  structuredData: {
    '@type': 'Product',
    name: 'Jivo A2 Cow Ghee',
    url: `${SITE_URL}/products/desi-ghee`,
    brand: { '@type': 'Brand', name: 'Jivo' },
    category: 'Ghee',
    description:
      'A2 Cow Ghee made the traditional Bilona way — cultured whole curd, slow-churned and clarified over a slow fire.',
  },
});
