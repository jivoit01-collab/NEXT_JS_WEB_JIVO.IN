import { definePageSeo } from '@/modules/seo';
import { SITE_URL } from '@/lib/constants';
import type {
  RefinedGoldOilsHeroContent,
  RefinedGoldOilsRangeContent,
  RefinedGoldOilsHighlightsContent,
  RefinedGoldOilsWhatIsContent,
} from '../types';

const PLACEHOLDER = '/api/uploads/placeholder.png';

export const defaultHeroContent: RefinedGoldOilsHeroContent = {
  logoImage: PLACEHOLDER,
  heading: 'GOLD REFINED OIL',
  subtitleLineOne: 'A smart blend of two oils for balanced, heart-healthy',
  subtitleLineTwo: 'goodness every day.',
  ctaLabel: 'BUY ALL',
  ctaHref: '/our-products',
  productImage: PLACEHOLDER,
  productImageSecondary: '',
};

export const defaultRangeContent: RefinedGoldOilsRangeContent = {
  heading: 'GOLD REFINED OIL RANGE OF PRODUCTS',
  variants: [
    { image: PLACEHOLDER, label: '1 Litre', href: '' },
    { image: PLACEHOLDER, label: '5 Litre', href: '' },
  ],
};

export const defaultHighlightsContent: RefinedGoldOilsHighlightsContent = {
  heading: 'KEY HIGHLIGHTS',
  highlights: [
    'Contains Natural Oryzanol from Rice Bran Oil',
    'Chemical-free cooking oil',
    'High Smoke Point for All-Purpose Cooking',
    'Light, Neutral Taste to Honor Your Ingredients',
    'An Offering to Our Mission of Wellness & Service',
  ],
  benefitsHeading: 'BENEFITS',
  benefits: [
    'Contains Oryzanol: Oryzanol, a natural component of Rice Bran Oil, supports everyday wellness-focused living.',
    'High Smoke Point: Suitable for frying, sautéing, and high-heat cooking methods.',
    'Balanced Fatty Acids: Provides an ideal balance of monounsaturated (MUFA) and polyunsaturated (PUFA) fats.',
  ],
  image: PLACEHOLDER,
};

export const defaultWhatIsContent: RefinedGoldOilsWhatIsContent = {
  heading: 'WHAT IS JIVO GOLD?',
  paragraph:
    'Jivo Gold is a carefully formulated blend of Refined Rice Bran Oil and Refined Sunflower Oil. This multi-source oil is designed to bring together the best of both ingredients: the high smoke point and unique nutrients of Rice Bran oil with the light, clean nature of Sunflower oil. The result is a superior, all-purpose oil that serves both your health and your recipes.',
  backgroundImage: PLACEHOLDER,
};

export const defaultSeo = definePageSeo({
  metaTitle: 'Gold Refined Oil | Our Products | Jivo Wellness',
  metaDescription:
    'Jivo Gold — a multi-source blend of Refined Rice Bran Oil and Refined Sunflower Oil. High smoke point, natural Oryzanol, light neutral taste for all-purpose cooking.',
  keywords: [
    'jivo gold oil',
    'gold refined oil',
    'rice bran sunflower blend oil',
    'multi source edible oil',
    'oryzanol cooking oil',
    'high smoke point oil',
    'refined rice bran oil',
    'blended cooking oil india',
    'gold oil 1 litre',
    'gold oil 5 litre',
  ],
  ogTitle: 'Jivo Gold Refined Oil — Multi-Source Edible Oil',
  ogDescription:
    'A blend of Refined Rice Bran and Sunflower oils — high smoke point, natural Oryzanol, light neutral taste.',
  ogImage: 'og-default.png',
  twitterCard: 'summary_large_image',
  canonicalUrl: `${SITE_URL}/products/refined-gold-oils`,
  robots: 'index,follow',
  structuredData: {
    '@type': 'Product',
    name: 'Jivo Gold Refined Oil',
    url: `${SITE_URL}/products/refined-gold-oils`,
    brand: { '@type': 'Brand', name: 'Jivo' },
    category: 'Edible Oil',
    description:
      'Multi-source blend of Refined Rice Bran Oil and Refined Sunflower Oil with a high smoke point and natural Oryzanol.',
  },
});
