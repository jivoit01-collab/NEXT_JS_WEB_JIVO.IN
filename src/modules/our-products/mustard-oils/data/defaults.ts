import { definePageSeo } from '@/modules/seo';
import { SITE_URL } from '@/lib/constants';
import type {
  MustardOilsHeroContent,
  MustardOilsRangeContent,
  MustardOilsExtractionContent,
  MustardOilsWarmthContent,
} from '../types';

// ── Default section content (matches screenshots) ─────────────

/**
 * Shown when the DB isn't seeded, a section row is missing/inactive, or an
 * admin hasn't uploaded art yet. `/api/uploads/[filename]` serves this file
 * for any unresolved path, so it is always safe.
 */
const PLACEHOLDER = '/api/uploads/placeholder.png';

export const defaultHeroContent: MustardOilsHeroContent = {
  logoImage: PLACEHOLDER,
  heading: 'MUSTARD OIL',
  subtitleLineOne: 'A proud member of the Brassica family, mustard oil has been',
  subtitleLineTwo: 'known for its earthy aroma, deep flavour, and age-old wellness benefits.',
  ctaLabel: 'BUY ALL',
  ctaHref: '/our-products',
  productImage: PLACEHOLDER,
  // Optional second bottle layered behind; empty renders a single bottle.
  productImageSecondary: '',
};

export const defaultRangeContent: MustardOilsRangeContent = {
  heading: 'MUSTARD OIL RANGE OF PRODUCTS',
  variants: [
    { image: PLACEHOLDER, label: '500 ml', href: '' },
    { image: PLACEHOLDER, label: '1 Litre', href: '' },
    { image: PLACEHOLDER, label: '5 Litre', href: '' },
  ],
};

export const defaultExtractionContent: MustardOilsExtractionContent = {
  heading: 'GENUINE KACHI GHANI EXTRACTION',
  paragraph:
    'Our oil is made using the traditional “kachi ghani” method — the first cold mechanical pressing of mustard seeds with minimal heat and zero chemicals. This process retains the mustard seed’s essential nutrients, including monounsaturated fats and omega-3 fatty acids, which help maintain normal blood cholesterol levels as part of a balanced diet.',
  benefitsHeading: 'NUTRITIONAL STRENGTH',
  benefits: [
    'Natural Extraction: Cold-pressed from handpicked mustard seeds, ensuring authenticity',
    'Healthy Fats: MUFA and omega-3 fatty acids help maintain normal blood cholesterol',
    'Balanced Fatty Acids: Ideal proportion of MUFA and PUFA for nutrition',
    'Freshness Protection: Contains natural compounds preserving the oil’s quality',
    'Chemical-Free: Free from additives and chemical refining',
  ],
  image: PLACEHOLDER,
};

export const defaultWarmthContent: MustardOilsWarmthContent = {
  heading: 'A LITTLE WARMTH, EVERY DAY.',
  paragraph:
    'Crafted with care and pressed with patience, Jivo Kachi Ghani Mustard Oil brings together everything that makes food feel like home — nourishment, aroma, and the quiet comfort of something made with heart. For the hands that cook and the hearts they feed,\nit’s warmth you can taste — every single day.',
  backgroundImage: PLACEHOLDER,
};

// ── SEO defaults ──────────────────────────────────────────────

export const defaultSeo = definePageSeo({
  metaTitle: 'Mustard Oil | Our Products | Jivo Wellness',
  metaDescription:
    'Jivo Kachi Ghani Mustard Oil — cold-pressed from handpicked mustard seeds with minimal heat and zero chemicals, rich in MUFA and omega-3 fatty acids.',
  keywords: [
    'jivo mustard oil',
    'kachi ghani mustard oil',
    'cold pressed mustard oil',
    'mustard oil india',
    'mustard oil 1 litre',
    'mustard oil 5 litre',
    'omega 3 cooking oil',
    'chemical free mustard oil',
    'unrefined mustard oil',
    'traditional kachi ghani',
  ],
  ogTitle: 'Jivo Mustard Oil — Kachi Ghani, Cold-Pressed',
  ogDescription:
    'Earthy aroma, deep flavour and age-old wellness benefits — cold-pressed with minimal heat and zero chemicals.',
  ogImage: 'og-default.png',
  twitterCard: 'summary_large_image',
  canonicalUrl: `${SITE_URL}/products/mustard-oils`,
  robots: 'index,follow',
  structuredData: {
    '@type': 'Product',
    name: 'Jivo Kachi Ghani Mustard Oil',
    url: `${SITE_URL}/products/mustard-oils`,
    brand: { '@type': 'Brand', name: 'Jivo' },
    category: 'Edible Oil',
    description:
      'Kachi ghani mustard oil, cold-pressed from handpicked mustard seeds with minimal heat and zero chemicals, rich in MUFA and omega-3 fatty acids.',
  },
});
