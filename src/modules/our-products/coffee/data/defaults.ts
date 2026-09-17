import { definePageSeo } from '@/modules/seo';
import { SITE_URL } from '@/lib/constants';
import type {
  CoffeeHeroContent,
  CoffeeRangeContent,
  CoffeeKeyHighlightsContent,
  CoffeeBeyondBeansContent,
} from '../types';

// ── Default section content (matches the design screenshots) ──

/**
 * Shown when the DB isn't seeded, a section row is missing/inactive, or an
 * admin hasn't uploaded art yet. `/api/uploads/[filename]` serves this file
 * for any unresolved path, so it is always safe.
 */
const PLACEHOLDER = '/api/uploads/placeholder.png';

export const defaultHeroContent: CoffeeHeroContent = {
  logoImage: PLACEHOLDER,
  heading: 'KOFFIE',
  subtitleLineOne: "Dawn's Bold Awakening.",
  subtitleLineTwo: '',
  ctaLabel: 'BUY',
  ctaHref: '/our-products',
  productImage: PLACEHOLDER,
  // Optional second jar to the left; empty renders a single jar.
  productImageSecondary: '',
};

export const defaultRangeContent: CoffeeRangeContent = {
  heading: 'OUR RANGE OF PRODUCTS',
  variants: [
    { image: PLACEHOLDER, label: '50g', href: '' },
    { image: PLACEHOLDER, label: '100g', href: '' },
  ],
};

export const defaultKeyHighlightsContent: CoffeeKeyHighlightsContent = {
  heading: 'KEY HIGHLIGHTS',
  paragraph: '',
  highlightsHeading: '',
  highlights: [
    'Ethical Sourcing: Select arabica from responsible estates.',
    'Precision Roasting: Captures complexity without excess.',
    'Antioxidant Rich: Matches elite sources for protection.',
    'Even Roast Profile: Mark of expert handling.',
    'Layered Taste Notes: Cocoa, nut, subtle fruit—refined delight.',
    'Steady Energy Boost: Sharpens focus, eases digestion, lifts spirit.',
  ],
  image: PLACEHOLDER,
};

export const defaultBeyondBeansContent: CoffeeBeyondBeansContent = {
  heading: 'BEYOND BEANS: WELLNESS INFUSED',
  paragraph:
    "What elevates Jivo Coffee beyond standard roasts: it doesn't just stimulate—it orchestrates your day. The supreme conduit for alertness, it unleashes antioxidants and balanced vigor throughout. Ordinary cups falter with tremors; Jivo aligns—laden with polyphenols for cardiovascular support, mental acuity, and subtle metabolic lift. Core elements like chlorogenic acid foster stable glucose and reduce oxidative stress, nurturing holistic health sans downturns. Moreover, its optimal roast maintains integrity: flavors persist across methods, outlasting scorched alternatives for consistently pure enjoyment.",
  backgroundImage: '',
};

// ── SEO defaults ──────────────────────────────────────────────

export const defaultSeo = definePageSeo({
  metaTitle: 'Koffie — Instant Smooth Premium Coffee | Jivo Wellness',
  metaDescription:
    'Jivo Koffie — instant smooth premium coffee from ethically sourced arabica, precision roasted for layered cocoa and nut notes with a steady, balanced energy lift. Available in 50g and 100g.',
  keywords: [
    'jivo koffie',
    'jivo coffee',
    'instant coffee india',
    'premium instant coffee',
    'arabica instant coffee',
    'smooth instant coffee',
    'coffee 50g',
    'coffee 100g',
    'antioxidant rich coffee',
    'chlorogenic acid coffee',
  ],
  ogTitle: "Jivo Koffie — Dawn's Bold Awakening",
  ogDescription:
    'Instant smooth premium coffee — ethically sourced arabica, precision roasted for layered taste and steady energy.',
  ogImage: 'og-default.png',
  twitterCard: 'summary_large_image',
  canonicalUrl: `${SITE_URL}/products/coffee`,
  robots: 'index,follow',
  structuredData: {
    '@type': 'Product',
    name: 'Jivo Koffie Instant Smooth Premium Coffee',
    url: `${SITE_URL}/products/coffee`,
    brand: { '@type': 'Brand', name: 'Jivo' },
    category: 'Instant Coffee',
    description:
      'Instant smooth premium coffee from ethically sourced arabica, precision roasted for layered cocoa and nut notes with a steady, balanced energy lift.',
  },
});
