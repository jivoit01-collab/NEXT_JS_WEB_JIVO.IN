import { definePageSeo } from '@/modules/seo';
import { SITE_URL } from '@/lib/constants';
import type {
  CanolaOilsHeroContent,
  CanolaOilsRangeContent,
  CanolaOilsWhatIsContent,
  CanolaOilsScienceContent,
  CanolaOilsColdPressedContent,
} from '../types';

// ── Default section content (matches screenshots) ─────────────

/**
 * Shown when the DB isn't seeded, a section row is missing/inactive, or an
 * admin hasn't uploaded art yet. `/api/uploads/[filename]` serves this file
 * for any unresolved path, so it is always safe. Same convention as the
 * home page (`modules/home/data/home-content.ts`).
 */
const PLACEHOLDER = '/api/uploads/placeholder.png';

export const defaultHeroContent: CanolaOilsHeroContent = {
  logoImage: PLACEHOLDER,
  heading: 'CANOLA OILS',
  subtitleLineOne: "India's largest seller of cold press canola oil",
  subtitleLineTwo: "India's first patented wheatgrass products",
  ctaLabel: 'BUY ALL',
  ctaHref: '/our-products',
  productImage: PLACEHOLDER,
  // Optional second bottle layered in front; empty renders a single bottle.
  productImageSecondary: '',
};

export const defaultRangeContent: CanolaOilsRangeContent = {
  heading: 'CANOLA OIL RANGE OF PRODUCTS',
  variants: [
    { image: PLACEHOLDER, label: '1 Litre', href: '' },
    { image: PLACEHOLDER, label: '2 Litre', href: '' },
    { image: PLACEHOLDER, label: '5 Litre', href: '' },
  ],
};

export const defaultWhatIsContent: CanolaOilsWhatIsContent = {
  heading: 'WHAT IS CANOLA ?',
  paragraphLeft:
    'Born from the seed of the bright yellow Canola plant — a member of the Brassica family that includes mustard, cabbage, and broccoli — Canola oil is one of nature’s most balanced edible oils. The name "Canola" stands for Canadian Oil, Low Acid — coined in 1978 by Canadian growers.',
  paragraphRight:
    'Canola Oil is appreciated for its naturally balanced composition, primarily containing monounsaturated and polyunsaturated fatty acids, which are considered components of a balanced diet. It is light in taste, has a high smoke point, and is versatile for various cooking methods. Free from artificial colours, flavours, and preservatives, Canola Oil is a reliable choice for everyday cooking use.',
  // `image: ''` renders the upload placeholder until artwork is set in admin.
  features: [
    { image: '', label: 'Mechanically extracted under minimal heat', description: '' },
    { image: '', label: 'Fortified with Vitamins A and D', description: '' },
    { image: '', label: 'Low in saturated fats, high in Omega-3', description: '' },
    { image: '', label: 'Free from chemicals and solvents', description: '' },
    { image: '', label: "Supports Jivo's mission of wellness and service", description: '' },
    {
      image: '',
      label: 'Integrity & Dedication',
      description:
        'An unwavering commitment to these principles and a perseverance in service to the mission.',
    },
  ],
};

export const defaultScienceContent: CanolaOilsScienceContent = {
  heading: 'THE SCIENCE BEHIND THE GOLD',
  intro:
    'Behind every golden drop lies intention and restraint. Our oil is cold-pressed from carefully selected Canola seeds — no chemical solvents, no high heat — preserving natural antioxidants, nutrients, and the oil’s delicate flavour.',
  subheading: 'Nutritional Excellence',
  points: [
    'Contains the lowest saturated fat content among commonly used vegetable oils',
    'Contains a high proportion of monounsaturated fats (MUFA), which contribute to nutritional balance',
    'Includes ALA Omega-3, a plant-based essential omega-3 fatty acid found naturally in Canola oil',
    'Fortified with Vitamins A & D for balanced nutrition',
  ],
  closingLine: 'This isn’t refinement — it’s respect for what’s real.',
  // Left empty on purpose: this is a full-bleed background behind body copy.
  // The section renders a brand gradient instead, which keeps text readable —
  // a stretched placeholder photo would not.
  backgroundImage: '',
};

export const defaultColdPressedContent: CanolaOilsColdPressedContent = {
  heading: 'WHY COLD-PRESSED',
  leadLineOne: 'Cold-pressing isn’t just a method — it’s a mindset.',
  leadLineTwo: 'A promise to keep food as close to its natural goodness as possible.',
  paragraph:
    'Cold pressing means pressing seeds mechanically — not chemically — at low temperatures. It’s a gentler, more honest way to extract oil, keeping it close to its natural state.',
  coldPressedTitle: 'Cold-Pressed Oils',
  coldPressedPoints: [
    'Extracted naturally — no chemicals, no solvents',
    'No refining required — oil is naturally edible and flavourful',
    'Retains nutrients and natural aroma due to minimal heat exposure',
    'Produced at low temperatures to maintain quality',
    'Remain unrefined and free from additives',
  ],
  refinedTitle: 'Refined Oils',
  refinedPoints: [
    'Extracted using chemical solvents and high heat',
    'Require further treatment to make them edible',
    'Lose much of their nutritional value during processing',
    'May contain harmful residues such as 3-MCPD and glycidyl esters',
  ],
};

// ── SEO defaults ──────────────────────────────────────────────

export const defaultSeo = definePageSeo({
  metaTitle: 'Canola Oils | Our Products | Jivo Wellness',
  metaDescription:
    "India's largest seller of cold-pressed canola oil. Mechanically extracted under minimal heat, fortified with Vitamins A & D, low in saturated fat and high in Omega-3.",
  keywords: [
    'jivo canola oil',
    'cold pressed canola oil',
    'canola oil india',
    'cold press canola oil',
    'canola oil 1 litre',
    'canola oil 5 litre',
    'omega 3 cooking oil',
    'low saturated fat oil',
    'vitamin a d fortified oil',
    'unrefined cooking oil',
  ],
  ogTitle: 'Jivo Canola Oils — Cold-Pressed, Naturally Balanced',
  ogDescription:
    "India's largest seller of cold-pressed canola oil — no chemical solvents, no high heat.",
  ogImage: 'og-default.png',
  twitterCard: 'summary_large_image',
  canonicalUrl: `${SITE_URL}/products/canola-oils`,
  robots: 'index,follow',
  structuredData: {
    '@type': 'Product',
    name: 'Jivo Cold Pressed Canola Oil',
    url: `${SITE_URL}/products/canola-oils`,
    brand: { '@type': 'Brand', name: 'Jivo' },
    category: 'Edible Oil',
    description:
      'Cold-pressed canola oil, mechanically extracted under minimal heat, fortified with Vitamins A & D, low in saturated fat and high in Omega-3.',
  },
});
