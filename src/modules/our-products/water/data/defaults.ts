import { definePageSeo } from '@/modules/seo';
import { SITE_URL } from '@/lib/constants';
import type {
  WaterHeroContent,
  WaterRangeContent,
  WaterBetterBottleContent,
  WaterMissionContent,
} from '../types';

const PLACEHOLDER = '/api/uploads/placeholder.png';

export const defaultHeroContent: WaterHeroContent = {
  logoImage: PLACEHOLDER,
  heading: 'NATURAL MINERAL WATER',
  subtitleLineOne: 'We bottle our natural mineral water in one clean, safe step.',
  subtitleLineTwo: 'This ensures the water you drink is as pure as its source.',
  ctaLabel: 'BUY ALL',
  ctaHref: '/our-products',
  productImage: PLACEHOLDER,
  productImageSecondary: '',
  backgroundImage: PLACEHOLDER,
};

export const defaultRangeContent: WaterRangeContent = {
  heading: 'RANGE OF PRODUCTS',
  variants: [
    { image: PLACEHOLDER, label: '250 ml', href: '' },
    { image: PLACEHOLDER, label: '500 ml', href: '' },
    { image: PLACEHOLDER, label: '1 Litre', href: '' },
  ],
};

export const defaultBetterBottleContent: WaterBetterBottleContent = {
  heading: 'A BETTER BOTTLE, INSIDE AND OUT',
  paragraphLeft:
    "The new, sterile bottle is never exposed to the open factory air and is never touched. Because it's formed and filled in one clean step, it doesn't even need to be rinsed. This means the water's purity is locked in, and we save water, too.\nThis is our promise: the water in the bottle is as pure as the water from the source.",
  paragraphRight:
    'Many bottling plants fill bottles in separate stages. The bottle is made, then moved on a conveyor, then rinsed, and then filled. This process leaves chances for dust and air to get in.\n\nWe do it differently. We use a special machine called a Combi Plant. This system does everything in one single, protected block. In one smooth motion.',
  features: [
    {
      image: PLACEHOLDER,
      label: 'Clean and safe',
      description:
        'Our all-in-one system means no outside contact. You get a perfectly clean and safe bottle, every time.',
    },
    {
      image: PLACEHOLDER,
      label: 'Using less plastic',
      description:
        "This smart system lets us make bottles that are lighter, using less plastic. It's a more responsible choice for the environment.",
    },
    {
      image: PLACEHOLDER,
      label: 'Fresh, Natural Taste',
      description:
        'By sealing the bottle right away, we lock in the fresh, crisp taste and the natural minerals.',
    },
  ],
};

export const defaultMissionContent: WaterMissionContent = {
  heading: 'OUR MISSION IN EVERY BOTTLE',
  paragraph:
    'At Jivo, our main goal is to serve your wellbeing.\nWe chose this advanced technology because it is the most honest and responsible way to bottle water.\nIt is not a marketing story; it is the truth of our process.\nThis is a direct part of our mission: to offer the "very best" products for your health. When you choose Jivo water, you are choosing a product made with genuine care and integrity.\nThis is our service (Sewa) to you.',
  backgroundImage: PLACEHOLDER,
};

export const defaultSeo = definePageSeo({
  metaTitle: 'Natural Mineral Water | Our Products | Jivo Wellness',
  metaDescription:
    'Jivo Natural Mineral Water — bottled in one clean, sealed step so the water you drink is as pure as its source. Available in 250ml, 500ml and 1 litre.',
  keywords: [
    'jivo natural mineral water',
    'jivo water',
    'mineral water india',
    'packaged drinking water',
    'natural minerals water',
    'water 250ml',
    'water 500ml',
    'water 1 litre',
    'combi plant bottled water',
    'pure mineral water',
  ],
  ogTitle: 'Jivo Natural Mineral Water — Pure as its Source',
  ogDescription:
    'Bottled in one clean, sealed step — the water you drink is as pure as its source.',
  ogImage: 'og-default.png',
  twitterCard: 'summary_large_image',
  canonicalUrl: `${SITE_URL}/products/water`,
  robots: 'index,follow',
  structuredData: {
    '@type': 'Product',
    name: 'Jivo Natural Mineral Water',
    url: `${SITE_URL}/products/water`,
    brand: { '@type': 'Brand', name: 'Jivo' },
    category: 'Mineral Water',
    description:
      'Natural mineral water bottled in one clean, sealed step for source-pure quality.',
  },
});
