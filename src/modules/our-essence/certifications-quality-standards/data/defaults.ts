import { definePageSeo } from '@/modules/seo';
import { SITE_URL } from '@/lib/constants';
import type {
  CertificationsHeroContent,
  CertificationsBadgesContent,
  CertificationsFeaturedContent,
} from '../types';

// ── Default section content (matches the reference design) ────

export const defaultHeroContent: CertificationsHeroContent = {
  heading: 'WE ARE CERTIFIED',
  subheading: 'TRUSTED. TESTED. CERTIFIED.',
  backgroundImage: '',
};

export const defaultBadgesContent: CertificationsBadgesContent = {
  items: [
    { image: '', label: 'Halal Certified' },
    { image: '', label: 'FDA Approved' },
    { image: '', label: 'FSSC 22000 Certified' },
    { image: '', label: 'Kosher Certified' },
    { image: '', label: 'Sedex Certified' },
    { image: '', label: 'Emirates Quality Mark' },
    { image: '', label: 'OHSAS 18001 Certified' },
    { image: '', label: 'BRCGS Food Safety Certified' },
    { image: '', label: 'National Ayush Mission' },
    { image: '', label: 'ISO 9001 Certified' },
    { image: '', label: 'AEO Authorised Economic Operator' },
    { image: '', label: 'FSSAI Certified' },
  ],
};

export const defaultFeaturedContent: CertificationsFeaturedContent = {
  enabled: true,
  image: '',
  label: 'U.S. Food & Drug Administration',
};

// ── SEO defaults ─────────────────────────────────────────────

export const defaultSeo = definePageSeo({
  metaTitle: 'Certifications & Quality Standards | Our Essence | Jivo Wellness',
  metaDescription:
    'FSSAI, FDA, ISO 9001, Halal, Kosher, FSSC 22000, BRCGS and more — the certifications and quality standards behind every Jivo Wellness product.',
  keywords: [
    'jivo certifications',
    'jivo quality standards',
    'fssai certified',
    'fda approved',
    'iso 9001',
    'halal certified',
    'kosher certified',
    'fssc 22000',
    'brcgs food safety',
    'sedex certified',
    'quality assurance india',
  ],
  ogTitle: 'Certifications & Quality Standards — Trusted. Tested. Certified.',
  ogDescription:
    'The globally recognised certifications and quality standards that back every Jivo Wellness product.',
  ogImage: 'og-default.png',
  twitterCard: 'summary_large_image',
  canonicalUrl: `${SITE_URL}/our-essence/certifications-quality-standards`,
  robots: 'index,follow',
  structuredData: {
    '@type': 'AboutPage',
    name: 'Certifications & Quality Standards',
    url: `${SITE_URL}/our-essence/certifications-quality-standards`,
    description:
      'The certifications and quality standards — FSSAI, FDA, ISO 9001, Halal, Kosher, FSSC 22000, BRCGS and more — that back every Jivo Wellness product.',
  },
});
