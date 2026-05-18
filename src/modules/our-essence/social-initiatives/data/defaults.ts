import { SITE_URL } from '@/lib/constants';
import { definePageSeo } from '@/modules/seo';
import {
  SOCIAL_INITIATIVES_FALLBACK_IMAGE,
  SOCIAL_INITIATIVES_PAGE_TITLE,
  SOCIAL_INITIATIVES_ROUTE,
} from '../constants';
import type {
  SocialInitiativesEducateContent,
  SocialInitiativesHeroContent,
  SocialInitiativesSectionKey,
  SocialInitiativesSplitContent,
} from '../types';

export const defaultHeroContent: SocialInitiativesHeroContent = {
  title: SOCIAL_INITIATIVES_PAGE_TITLE,
  subtitle: 'Empowering communities through wellness, education, and human-centered service.',
  image: '',
  alignmentTitle: 'ALIGNMENT & INCENTIVES',
  alignmentDescription:
    'The primary incentive is the shared mission toward wellness, service, and human upliftment. Every effort remains aligned with the purpose of meaningful social impact.',
  goalTitle: 'GOAL',
  goalDescription:
    'To build sustainable community systems where every individual can grow through education, support, wellness, and empowerment.',
};

export const defaultResponsibilitiesContent: SocialInitiativesSplitContent = {
  backgroundImage: '',
  leftTitle: 'RESPONSIBILITIES',
  leftDescription:
    'The organization remains committed to serving humanity through wellness initiatives, education support, and sustainable community development.',
  rightTitle: 'POLICY',
  rightDescription:
    'Policies are designed to encourage action, responsibility, and long-term social growth while keeping the mission centered on humanity.',
};

export const defaultEducateContent: SocialInitiativesEducateContent = {
  heading: 'EDUCATE. ENSHRINE. EMPOWER.',
  paragraph:
    'We are committed to creating sustainable transformation through education, wellness support, and community-led initiatives that uplift lives with dignity and long-term impact.',
  image: '',
};

export const defaultSections = {
  hero: defaultHeroContent,
  responsibilities: defaultResponsibilitiesContent,
  educate: defaultEducateContent,
} as const;

export const sectionTitles: Record<SocialInitiativesSectionKey, string> = {
  hero: 'Hero Section',
  responsibilities: 'Responsibilities Section',
  educate: 'Educate Empower Section',
};

export const sectionSortOrder: Record<SocialInitiativesSectionKey, number> = {
  hero: 0,
  responsibilities: 1,
  educate: 2,
};

export const sectionKeys = Object.keys(defaultSections) as SocialInitiativesSectionKey[];

export const fallbackImage = SOCIAL_INITIATIVES_FALLBACK_IMAGE;

export const defaultSeo = definePageSeo({
  metaTitle: 'Social Initiatives | Jivo Wellness',
  metaDescription:
    'Explore Jivo Wellness social initiatives focused on education, empowerment, wellness, and human-centered service.',
  keywords: [
    'social initiatives',
    'jivo wellness',
    'community empowerment',
    'wellness initiatives',
    'education support',
    'human-centered service',
    'social upliftment',
  ],
  ogTitle: 'Social Initiatives | Jivo Wellness',
  ogDescription:
    'Discover mission-driven social initiatives that empower communities through wellness, education, and service.',
  ogImage: SOCIAL_INITIATIVES_FALLBACK_IMAGE,
  twitterCard: 'summary_large_image',
  canonicalUrl: `${SITE_URL}${SOCIAL_INITIATIVES_ROUTE}`,
  robots: 'index,follow',
  structuredData: {
    '@type': 'AboutPage',
    name: 'Social Initiatives',
    url: `${SITE_URL}${SOCIAL_INITIATIVES_ROUTE}`,
    description:
      'Jivo Wellness social initiatives focused on wellness, education, empowerment, and community upliftment.',
  },
});
