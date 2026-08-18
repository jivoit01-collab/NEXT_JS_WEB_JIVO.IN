import { definePageSeo } from '@/modules/seo';
import { SITE_URL } from '@/lib/constants';
import type {
  OliveOilsHeroContent,
  OliveOilsVariantContent,
  OliveOilsDifferenceContent,
} from '../types';

// ── Default section content (matches screenshots) ─────────────

/**
 * Shown when the DB isn't seeded, a section row is missing/inactive, or an
 * admin hasn't uploaded art yet. `/api/uploads/[filename]` serves this file
 * for any unresolved path, so it is always safe.
 */
const PLACEHOLDER = '/api/uploads/placeholder.png';

export const defaultHeroContent: OliveOilsHeroContent = {
  logoImage: PLACEHOLDER,
  heading: 'THE OLIVE FAMILY',
  subtitleLineOne: 'Three distinct expressions from the same golden heart —',
  subtitleLineTwo: 'each crafted for a different kitchen, and a shared pursuit of better living.',
  ctaLabel: 'BUY ALL',
  ctaHref: '/our-products',
  // Three upright packs in ascending size, smallest first.
  productImage: PLACEHOLDER,
  productImageSecondary: '',
  productImageThree: '',
};

export const defaultExtraVirginContent: OliveOilsVariantContent = {
  heading: 'EXTRA VIRGIN OLIVE OIL',
  paragraph:
    'Cold-pressed from handpicked Spanish olives, this is the purest form of olive oil — full-bodied, aromatic, and alive with flavour.',
  paragraphTwo:
    'Naturally high in monounsaturated fatty acids, this oil also contains tocopherols and polyphenols—natural antioxidants that contribute to its stability and help maintain freshness—making it ideal for those who appreciate clean, raw, and authentic flavour.',
  bestFor: 'Best for: salad dressings, dips, marinades, and gentle cooking.',
  sideImage: PLACEHOLDER,
  variants: [
    { image: PLACEHOLDER, label: '500 ml', href: '' },
    { image: PLACEHOLDER, label: '1 Litre', href: '' },
    { image: PLACEHOLDER, label: '5 Litre', href: '' },
  ],
};

export const defaultExtraLightContent: OliveOilsVariantContent = {
  heading: 'EXTRA LIGHT OLIVE OIL',
  paragraph:
    'With a naturally high smoke point and a balanced fatty acid profile containing monounsaturated fats and low saturated fat, it suits everyday Indian cooking — frying, roasting, baking — making it a versatile choice for those who enjoy light and wholesome meals.',
  paragraphTwo: '',
  bestFor: 'Best for: everyday sautéing, frying, and baking.',
  sideImage: PLACEHOLDER,
  variants: [
    { image: PLACEHOLDER, label: '500 ml', href: '' },
    { image: PLACEHOLDER, label: '1 Litre', href: '' },
    { image: PLACEHOLDER, label: '5 Litre', href: '' },
  ],
};

export const defaultPomaceContent: OliveOilsVariantContent = {
  heading: 'POMACE OLIVE OIL',
  paragraph:
    'From the hearty flame of Indian kitchens comes a companion built for endurance. Refined from olive pulp and perfected with care, it’s the strong, neutral oil that lets flavours shine while standing the test of heat. Pomace olive oil is light and absorbs less in food, making every day cooking simple and balanced with its healthy monounsaturated fats',
  paragraphTwo: '',
  bestFor: 'Best for: deep frying, grilling, and robust Indian dishes.',
  sideImage: PLACEHOLDER,
  variants: [
    { image: PLACEHOLDER, label: '1 Litre', href: '' },
    { image: PLACEHOLDER, label: '2 Litre', href: '' },
    { image: PLACEHOLDER, label: '5 Litre', href: '' },
  ],
};

export const defaultDifferenceContent: OliveOilsDifferenceContent = {
  heading: 'THE JIVO DIFFERENCE',
  paragraph:
    'We source our olives directly from Spain’s most trusted groves and process them through advanced cold-press and refinement methods. Every batch is tested for purity, freshness, and nutrient retention — so what reaches your kitchen is the perfect blend of science, nature, and care.\nFrom extraction to packaging, the process is designed to preserve quality, traceability, and flavour integrity across every variant.',
  backgroundImage: PLACEHOLDER,
};

// ── SEO defaults ──────────────────────────────────────────────

export const defaultSeo = definePageSeo({
  metaTitle: 'Olive Oil | Our Products | Jivo Wellness',
  metaDescription:
    'Jivo Olive Oil — extra virgin, extra light and pomace, sourced from Spain’s most trusted groves and cold-pressed for purity, freshness and flavour.',
  keywords: [
    'jivo olive oil',
    'extra virgin olive oil',
    'extra light olive oil',
    'pomace olive oil',
    'olive oil india',
    'spanish olive oil',
    'olive oil 500 ml',
    'olive oil 1 litre',
    'olive oil 5 litre',
    'cold pressed olive oil',
  ],
  ogTitle: 'Jivo Olive Oil — The Olive Family',
  ogDescription:
    'Three distinct expressions from the same golden heart — extra virgin, extra light and pomace olive oil from Spain.',
  ogImage: 'og-default.png',
  twitterCard: 'summary_large_image',
  canonicalUrl: `${SITE_URL}/products/olive-oils`,
  robots: 'index,follow',
  structuredData: {
    '@type': 'Product',
    name: 'Jivo Olive Oil',
    url: `${SITE_URL}/products/olive-oils`,
    brand: { '@type': 'Brand', name: 'Jivo' },
    category: 'Edible Oil',
    description:
      'Extra virgin, extra light and pomace olive oil sourced from Spain’s most trusted groves, tested for purity, freshness and nutrient retention.',
  },
});
