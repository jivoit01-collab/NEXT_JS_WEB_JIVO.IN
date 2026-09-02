import { definePageSeo } from '@/modules/seo';
import { SITE_URL } from '@/lib/constants';
import type {
  WheatgrassHeroContent,
  WheatgrassRangeContent,
  WheatgrassWellnessContent,
  WheatgrassDifferenceContent,
  WheatgrassHighlightsContent,
} from '../types';

// ── Default section content (matches the design screenshots) ──

/**
 * Shown when the DB isn't seeded, a section row is missing/inactive, or an
 * admin hasn't uploaded art yet. `/api/uploads/[filename]` serves this file
 * for any unresolved path, so it is always safe.
 */
const PLACEHOLDER = '/api/uploads/placeholder.png';

export const defaultHeroContent: WheatgrassHeroContent = {
  logoImage: PLACEHOLDER,
  heading: 'HEALTHY WHEATGRASS',
  subtitleLineOne: 'Himalayan Greens.',
  subtitleLineTwo: 'Pure Goodness.\nSimply Refreshing.',
  ctaLabel: 'BUY',
  ctaHref: '/our-products',
  // Five flavour bottles, left → right. The middle one renders largest.
  bottles: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
};

export const defaultRangeContent: WheatgrassRangeContent = {
  heading: 'HEALTHY WHEATGRASS RANGE OF PRODUCTS',
  variants: [
    { image: PLACEHOLDER, label: 'Rose', size: '200ml', href: '' },
    { image: PLACEHOLDER, label: 'Gingerale', size: '200ml', href: '' },
    { image: PLACEHOLDER, label: 'Blueberry', size: '200ml', href: '' },
    { image: PLACEHOLDER, label: 'Mojito', size: '200ml', href: '' },
  ],
};

export const defaultWellnessContent: WheatgrassWellnessContent = {
  heading: 'MORE THAN A JUICE: A CARRIER OF WELLNESS',
  paragraph:
    'Here\u2019s what sets Jivo Wheatgrass Juice apart from ordinary drinks: a juice can hydrate, but Jivo infuses your body with nature\u2019s pharmacy. It\u2019s the ultimate carrier of vitality, unlocking detoxification and balance at the cellular level. Where other beverages merely quench, Jivo alkalizes your system, boosting immunity and energy while combating inflammation. Its core strength lies in delivering chlorophyll\u2014the \u201cgreen blood\u201d equivalent to 2kg of vegetables\u2014packed with vitamins A, C, E, iron, magnesium, and enzymes for digestion, pH harmony, and anti-ageing support. Finally, its natural, sugar-free profile ensures purity: it sustains without spikes, offering stability where sugary drinks falter, for wellness that endures.',
  image: PLACEHOLDER,
};

export const defaultDifferenceContent: WheatgrassDifferenceContent = {
  heading: 'A DIFFERENCE YOU CAN SEE AND TASTE',
  paragraph:
    'While many juices rely on concentrates or additives, true wheatgrass cannot be rushed. It emerges from a cold-pressed ritual that preserves every enzyme, vitamin, and phytonutrient from young, tender shoots.\nAs it\u2019s extracted, the vibrant green hue intensifies, blooming into a pure, chlorophyll-rich elixir. This gentle process is our hallmark for unmatched freshness and potency\u2014a difference you can see in its vivid colour and taste before it even touches your lips.',
  image: PLACEHOLDER,
};

export const defaultHighlightsContent: WheatgrassHighlightsContent = {
  heading: 'KEY HIGHLIGHTS',
  highlights: [
    {
      image: PLACEHOLDER,
      label: 'Cold-Pressed Extraction',
      description: 'Preserves live enzymes and nutrients intact.',
    },
    {
      image: PLACEHOLDER,
      label: 'Himalayan Origin',
      description: 'Grown in pristine fields for superior purity.',
    },
    {
      image: PLACEHOLDER,
      label: 'Chlorophyll Powerhouse',
      description: 'Matches nutrition of 2kg fresh veggies per bottle.',
    },
    {
      image: PLACEHOLDER,
      label: 'Vivid Green Freshnes',
      description: 'Proof of unprocessed, potent quality.',
    },
    {
      image: PLACEHOLDER,
      label: 'Flavor-Infused Bliss',
      description: 'Flavor-Infused Bliss: Ginger Ale, Mojito, Mango, Rose\u2014vegan and sugar-free.',
    },
    {
      image: PLACEHOLDER,
      label: 'Daily Detox Ally',
      description: 'Boosts immunity, aids weight management, fights fatigue.',
    },
  ],
  backgroundImage: PLACEHOLDER,
};

// ── SEO defaults ──────────────────────────────────────────────

export const defaultSeo = definePageSeo({
  metaTitle: 'Healthy Wheatgrass Juice | Our Products | Jivo Wellness',
  metaDescription:
    'Jivo Healthy Wheatgrass Juice — cold-pressed Himalayan wheatgrass with the chlorophyll of 2kg fresh vegetables per bottle. Vegan, sugar-free, in Rose, Ginger Ale, Blueberry and Mojito.',
  keywords: [
    'jivo wheatgrass juice',
    'healthy wheatgrass',
    'wheatgrass juice india',
    'cold pressed wheatgrass',
    'chlorophyll drink',
    'sugar free juice',
    'immunity booster drink',
    'detox juice',
    'himalayan wheatgrass',
    'vegan wellness drink',
  ],
  ogTitle: 'Jivo Healthy Wheatgrass — Himalayan Greens, Pure Goodness',
  ogDescription:
    'Cold-pressed wheatgrass juice with the nutrition of 2kg fresh vegetables per bottle — vegan and sugar-free.',
  ogImage: 'og-default.png',
  twitterCard: 'summary_large_image',
  canonicalUrl: `${SITE_URL}/products/wheatgrass-juice`,
  robots: 'index,follow',
  structuredData: {
    '@type': 'Product',
    name: 'Jivo Healthy Wheatgrass Juice',
    url: `${SITE_URL}/products/wheatgrass-juice`,
    brand: { '@type': 'Brand', name: 'Jivo' },
    category: 'Wellness Beverage',
    description:
      'Cold-pressed Himalayan wheatgrass juice delivering the chlorophyll equivalent of 2kg fresh vegetables per bottle. Vegan, sugar-free, available in Rose, Ginger Ale, Blueberry and Mojito.',
  },
});
