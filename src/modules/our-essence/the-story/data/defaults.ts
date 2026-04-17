import { definePageSeo } from '@/modules/seo';
import { SITE_URL } from '@/lib/constants';
import type {
  TheStoryHeroContent,
  TheStoryFounderContent,
  TheStoryVisionContent,
} from '../types';

// ── Default section content (matches screenshots) ────────────

export const defaultHeroContent: TheStoryHeroContent = {
  heading: 'JIVO JOURNEY',
  paragraph:
    "Inspired by Baba Iqbal Singh ji's vision, Jivo blends integrity, compassion, and innovation to promote health, uplift communities, and empower humanity.",
  backgroundImage: '',
};

export const defaultFounderContent: TheStoryFounderContent = {
  sectionHeading: 'FOR HUMANITY, WITH PURPOSE',
  title: 'WELLNESS ROOTED IN SEVA',
  paragraph:
    'Our founding father, Baba Iqbal Singh ji, offered his entire life to selfless service (sewa). He started schools in rural north India with a mission: to provide value-based education that would help create "flowering human beings" capable of spreading Universal Brotherhood and establishing permanent world peace.',
  founderImage: '',
};

export const defaultVisionContent: TheStoryVisionContent = {
  sectionHeading: 'WHERE PURPOSE BECOMES WELLNESS',
  title: 'VISION OF SEVA & GROWTH',
  leftColumn:
    "He envisioned that the organization should also be supported by the principle of 'kirat karmai' (truthful, honest work). He encouraged volunteers to engage in business activity with integrity, and then offer earnings from this work back to the mission. He saw this selfless work (sewa), not just as a path to fund the mission, but as a path to ultimate wellbeing for those performing it.",
  rightColumn:
    'Jivo was started to fulfill this vision. Its purpose is to serve all of humanity, beginning with products and services that support health and wellbeing, as a direct expression of our core mission: wellness and service.',
};

// ── SEO defaults ─────────────────────────────────────────────

export const defaultSeo = definePageSeo({
  metaTitle: 'The Story of Jivo Wellness | Inspired by Seva & Baba Iqbal Singh Ji',
  metaDescription:
    "Discover the journey of Jivo Wellness — rooted in the vision of Baba Iqbal Singh Ji, built on the principles of seva, kirat karmai, and holistic wellbeing for all of humanity.",
  keywords: [
    'jivo wellness story',
    'baba iqbal singh ji',
    'jivo journey',
    'cold press oil india',
    'seva wellness',
    'kirat karmai',
    'jivo founding story',
    'wellness rooted in seva',
    'jivo wellness about',
    'our essence jivo',
  ],
  ogTitle: 'The Jivo Journey — Wellness Rooted in Seva',
  ogDescription:
    "From selfless service to wellness for all — the story behind Jivo's mission.",
  ogImage: 'og-default.png',
  twitterCard: 'summary_large_image',
  canonicalUrl: `${SITE_URL}/our-essence/the-story`,
  robots: 'index,follow',
  structuredData: {
    '@type': 'AboutPage',
    name: 'The Story of Jivo Wellness',
    url: `${SITE_URL}/our-essence/the-story`,
    description:
      'The founding story and mission of Jivo Wellness, inspired by the vision of Baba Iqbal Singh Ji.',
  },
});
