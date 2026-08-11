import { definePageSeo } from '@/modules/seo';
import { SITE_URL } from '@/lib/constants';
import type {
  GroundnutOilsHeroContent,
  GroundnutOilsRangeContent,
  GroundnutOilsGoodnessContent,
  GroundnutOilsAuthenticityContent,
} from '../types';

// ── Default section content (matches screenshots) ─────────────

/**
 * Shown when the DB isn't seeded, a section row is missing/inactive, or an
 * admin hasn't uploaded art yet. `/api/uploads/[filename]` serves this file
 * for any unresolved path, so it is always safe.
 */
const PLACEHOLDER = '/api/uploads/placeholder.png';

export const defaultHeroContent: GroundnutOilsHeroContent = {
  logoImage: PLACEHOLDER,
  heading: 'GROUNDNUT OIL',
  subtitleLineOne: 'From the soil to your kitchen, Jivo Cold Pressed',
  subtitleLineTwo: 'Groundnut Oil carries the quiet strength of nature.',
  ctaLabel: 'BUY ALL',
  ctaHref: '/our-products',
  productImage: PLACEHOLDER,
  // Optional second bottle layered behind; empty renders a single bottle.
  productImageSecondary: '',
};

export const defaultRangeContent: GroundnutOilsRangeContent = {
  heading: 'GROUNDNUT OIL RANGE OF PRODUCTS',
  variants: [
    { image: PLACEHOLDER, label: '500 ml', href: '' },
    { image: PLACEHOLDER, label: '1 Litre', href: '' },
    { image: PLACEHOLDER, label: '5 Litre', href: '' },
  ],
};

export const defaultGoodnessContent: GroundnutOilsGoodnessContent = {
  heading: 'THE GOODNESS WITHIN',
  paragraph:
    "Pressed gently from premium groundnuts, this oil retains its natural golden colour and delicate nutty aroma. Rich in monounsaturated fats (MUFA) and omega-6 polyunsaturated fatty acids (PUFA) that help support cholesterol levels when consumed in moderation. Contains tocopherols, natural antioxidants that help maintain the oil's quality.",
  benefitsHeading: 'BENEFITS',
  benefits: [
    'Natural Extraction: Cold-pressed using traditional methods for nutrient retention',
    'Balanced Fats: Contains MUFA and omega-6 PUFA for balanced fat profile',
    'Natural Antioxidants: Includes tocopherols that support oil freshness and quality',
    'Cooking Stability: Suitable for high-temperature cooking like sautéing and frying',
    'Chemical-Free: Free from additives, preservatives, and chemical solvents',
  ],
  image: PLACEHOLDER,
};

export const defaultAuthenticityContent: GroundnutOilsAuthenticityContent = {
  heading: 'PROMISING AUTHENTICITY',
  paragraph:
    'No refining. No chemicals. No bleaching.\nJust carefully selected groundnuts, cold-pressed to preserve their natural nutrients and aroma.\nWe keep the process simple, so the result stays pure — food that’s real, wholesome, and full of quiet nourishment.',
  backgroundImage: PLACEHOLDER,
};

// ── SEO defaults ──────────────────────────────────────────────

export const defaultSeo = definePageSeo({
  metaTitle: 'Groundnut Oil | Our Products | Jivo Wellness',
  metaDescription:
    'Jivo Cold Pressed Groundnut Oil — pressed gently from premium groundnuts, rich in MUFA and omega-6 PUFA, free from additives, preservatives and chemical solvents.',
  keywords: [
    'jivo groundnut oil',
    'cold pressed groundnut oil',
    'groundnut oil india',
    'peanut oil',
    'groundnut oil 1 litre',
    'groundnut oil 5 litre',
    'mufa cooking oil',
    'chemical free cooking oil',
    'unrefined groundnut oil',
    'traditional cold pressed oil',
  ],
  ogTitle: 'Jivo Groundnut Oil — Cold-Pressed, Naturally Pure',
  ogDescription:
    'From the soil to your kitchen — cold-pressed groundnut oil with no refining, no chemicals, no bleaching.',
  ogImage: 'og-default.png',
  twitterCard: 'summary_large_image',
  canonicalUrl: `${SITE_URL}/products/groundnut-oils`,
  robots: 'index,follow',
  structuredData: {
    '@type': 'Product',
    name: 'Jivo Cold Pressed Groundnut Oil',
    url: `${SITE_URL}/products/groundnut-oils`,
    brand: { '@type': 'Brand', name: 'Jivo' },
    category: 'Edible Oil',
    description:
      'Cold-pressed groundnut oil, extracted using traditional methods for nutrient retention, rich in MUFA and omega-6 PUFA, free from additives and chemical solvents.',
  },
});
