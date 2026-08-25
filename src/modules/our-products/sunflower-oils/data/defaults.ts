import { definePageSeo } from '@/modules/seo';
import { SITE_URL } from '@/lib/constants';
import type {
  SunflowerOilsHeroContent,
  SunflowerOilsRangeContent,
  SunflowerOilsBenefitsContent,
  SunflowerOilsWhyItMattersContent,
} from '../types';

// ── Default section content (matches screenshots) ─────────────

/**
 * Shown when the DB isn't seeded, a section row is missing/inactive, or an
 * admin hasn't uploaded art yet. `/api/uploads/[filename]` serves this file
 * for any unresolved path, so it is always safe.
 */
const PLACEHOLDER = '/api/uploads/placeholder.png';

export const defaultHeroContent: SunflowerOilsHeroContent = {
  logoImage: PLACEHOLDER,
  heading: 'SUNFLOWER OIL',
  subtitleLineOne: 'From breakfast to dinner, from one meal to the next,',
  subtitleLineTwo: 'Jivo Sunflower Oil brings a quiet radiance to the table.',
  ctaLabel: 'BUY ALL',
  ctaHref: '/our-products',
  productImage: PLACEHOLDER,
  productImageSecondary: '',
};

export const defaultRangeContent: SunflowerOilsRangeContent = {
  heading: 'SUNFLOWER OIL RANGE OF PRODUCTS',
  variants: [
    { image: PLACEHOLDER, label: '500 ml', href: '' },
    { image: PLACEHOLDER, label: '1 Litre', href: '' },
    { image: PLACEHOLDER, label: '5 Litre', href: '' },
  ],
};

export const defaultBenefitsContent: SunflowerOilsBenefitsContent = {
  benefitsHeading: 'BENEFITS',
  benefits: [
    'Preserves Nutrients: Extracted via cold-press method retaining natural nutrients',
    'Balanced Fats: Contains MUFA and PUFA for balanced nutrition',
    'Natural Antioxidants: Includes tocopherols that protect oil stability and quality',
    'Light Flavour: Mild and natural taste suitable for everyday cooking',
    'High Smoke Point: Ideal for sautéing, frying, and versatile culinary uses',
  ],
  image: PLACEHOLDER,
};

export const defaultWhyItMattersContent: SunflowerOilsWhyItMattersContent = {
  heading: 'WHY IT MATTERS ?',
  paragraph:
    'It contains the right blend of monounsaturated (MUFA) and polyunsaturated fats (PUFA) that help maintain normal blood cholesterol levels when consumed as part of a balanced diet.\nNatural antioxidants help protect its stability and quality. It’s light enough for daily use, yet powerful enough to sustain your energy and wellbeing.',
  backgroundImage: PLACEHOLDER,
};

// ── SEO defaults ──────────────────────────────────────────────

export const defaultSeo = definePageSeo({
  metaTitle: 'Sunflower Oil | Our Products | Jivo Wellness',
  metaDescription:
    'Jivo Cold Pressed Sunflower Oil — light, mild and versatile, rich in MUFA and PUFA with a high smoke point, ideal for everyday Indian cooking.',
  keywords: [
    'jivo sunflower oil',
    'cold pressed sunflower oil',
    'sunflower oil india',
    'sunflower cooking oil',
    'sunflower oil 1 litre',
    'sunflower oil 5 litre',
    'high smoke point oil',
    'light cooking oil',
    'mufa pufa oil',
    'refined sunflower oil alternative',
  ],
  ogTitle: 'Jivo Sunflower Oil — Light, Mild & Versatile',
  ogDescription:
    'Cold-pressed sunflower oil with a high smoke point — light enough for daily use, ideal for sautéing, frying and everyday cooking.',
  ogImage: 'og-default.png',
  twitterCard: 'summary_large_image',
  canonicalUrl: `${SITE_URL}/products/sunflower-oils`,
  robots: 'index,follow',
  structuredData: {
    '@type': 'Product',
    name: 'Jivo Cold Pressed Sunflower Oil',
    url: `${SITE_URL}/products/sunflower-oils`,
    brand: { '@type': 'Brand', name: 'Jivo' },
    category: 'Edible Oil',
    description:
      'Cold-pressed sunflower oil, light and mild with a high smoke point, rich in MUFA and PUFA.',
  },
});
