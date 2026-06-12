import { SITE_URL } from '@/lib/constants';
import { definePageSeo } from '@/modules/seo';
import {
  THE_JIVO_CAPITAL_FALLBACK_IMAGE,
  THE_JIVO_CAPITAL_ROUTE,
} from '../constants';
import type {
  TheJivoCapitalFarmToBottleContent,
  TheJivoCapitalFreshLockContent,
  TheJivoCapitalHeroContent,
  TheJivoCapitalPlantContent,
  TheJivoCapitalSectionKey,
} from '../types';

export const defaultHeroContent: TheJivoCapitalHeroContent = {
  title: 'THE JIVO CAPITAL',
  description:
    'Our products and services reflect our mission to serve humanity through wellness. Every offering is aligned with purpose, built with integrity, and crafted to deliver the very best in health and wellbeing. State-of-the-Art plant dedicated to wellness, integrity, and quality.',
  image: '',
};

export const defaultOilPlantContent: TheJivoCapitalPlantContent = {
  title: 'The 100 BPM Rotary Net Weight Oil Plant',
  description:
    'This is a high-performance, automated packaging line designed for maximum accuracy and throughput. It integrates filling, capping, and labeling at a consistent speed of 100 bottles per minute (BPM). Its core advantages are net weight filling, rotary operation, and oil-specific handling.',
  image: '',
  align: 'left',
};

export const defaultWaterPlantContent: TheJivoCapitalPlantContent = {
  title: "India's First 300 BPM Combi Plant for Natural Mineral Water",
  description:
    "Engineered for purity and performance, India's first 300 BPM Combi Plant combines bottle creation, filling, and capping within a single hygienic system. Delivering contamination-free production, reduced plastic usage, lower energy consumption, and unmatched operational efficiency, it represents the future of sustainable beverage manufacturing.",
  image: '',
  align: 'right',
};

export const defaultFarmToBottleContent: TheJivoCapitalFarmToBottleContent = {
  title: 'World’s First: The "Farm-to-Bottle" Facility',
  description:
    "We are the world's first and only facility to fully integrate grass production from farm to bottle. This model gives us unparalleled control over quality, providing 100% traceability from the soil in our own farms directly to the final, sealed product because our factory is on-site, our harvest is processed within minutes, not days. This allows us to capture the grass at its absolute peak, locking in maximum freshness and nutrients.",
  image: '',
};

export const defaultFreshLockContent: TheJivoCapitalFreshLockContent = {
  title: 'Our Patented "Fresh-Lock" Technology',
  description:
    'The challenge with wheatgrass is that its most potent nutrients degrade almost immediately after juicing.\nTo solve this, we developed a proprietary, patented “Fresh-Lock” technology.\nThis novel, cold-press stabilization process is the crucial next step. It preserves the heat-sensitive enzymes, vital chlorophyll, and delicate phytonutrients that are destroyed by traditional heat pasteurization or dehydration.\nThis combination of our "Farm-to-Bottle" system and our patented technology is what makes our product unique. It allows us to deliver the full nutritional potency of a live, fresh-squeezed juice in a convenient, ready-to-consume format.',
  backgroundImage: '',
};

export const defaultSections = {
  hero: defaultHeroContent,
  oilPlant: defaultOilPlantContent,
  waterPlant: defaultWaterPlantContent,
  farmToBottle: defaultFarmToBottleContent,
  freshLock: defaultFreshLockContent,
} as const;

export const sectionTitles: Record<TheJivoCapitalSectionKey, string> = {
  hero: 'Hero Section',
  oilPlant: '100 BPM Rotary Net Weight Oil Plant',
  waterPlant: '300 BPM Natural Mineral Water Combi Plant',
  farmToBottle: 'Farm-to-Bottle Facility',
  freshLock: 'Fresh-Lock Technology',
};

export const sectionSortOrder: Record<TheJivoCapitalSectionKey, number> = {
  hero: 0,
  oilPlant: 1,
  waterPlant: 2,
  farmToBottle: 3,
  freshLock: 4,
};

export const sectionKeys = Object.keys(defaultSections) as TheJivoCapitalSectionKey[];

export const fallbackImage = THE_JIVO_CAPITAL_FALLBACK_IMAGE;

export const defaultSeo = definePageSeo({
  metaTitle: 'The Jivo Capital | Our Essence | Jivo Wellness',
  metaDescription:
    'Explore The Jivo Capital, Jivo Wellness manufacturing excellence across automated oil packaging and natural mineral water production.',
  keywords: [
    'the jivo capital',
    'jivo wellness plant',
    'jivo manufacturing',
    '100 bpm oil plant',
    '300 bpm combi plant',
    'natural mineral water plant',
    'automated packaging',
    'wellness products india',
  ],
  ogTitle: 'The Jivo Capital | Jivo Wellness',
  ogDescription:
    'A cinematic look at Jivo Wellness manufacturing, quality, integrity, and purpose-driven production.',
  ogImage: THE_JIVO_CAPITAL_FALLBACK_IMAGE,
  twitterCard: 'summary_large_image',
  canonicalUrl: `${SITE_URL}${THE_JIVO_CAPITAL_ROUTE}`,
  robots: 'index,follow',
  structuredData: {
    '@type': 'AboutPage',
    name: 'The Jivo Capital',
    url: `${SITE_URL}${THE_JIVO_CAPITAL_ROUTE}`,
    description:
      'Jivo Wellness manufacturing page covering oil packaging and natural mineral water plant capabilities.',
  },
});
