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
  subtitle: 'The structure is not a rigid hierarchy but a dynamic, mission-driven network.',
  image: '',
  alignmentTitle: 'ALIGNMENT & INCENTIVES:',
  alignmentDescription:
    'The primary incentive is the shared “why” — a devotion to wellness and Sewa. The structure removes barriers so every effort stays aligned with the mission.',
  goalTitle: 'GOAL:',
  goalDescription:
    'To create a structure where every person acts as an owner, accountable for their “micro-levers” and aligned with the organization’s macro-goal: to serve.',
};

const previousHeroContent = {
  title: 'SOCIAL INITIATIVES',
  subtitle: 'Empowering communities through wellness, education, and human-centered service.',
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
    'As an expression of these principles, the organization is responsible for: Offering the very best products and services that contribute to wellness.Being in service to all of humanity through its work.\n\nDevoting its earnings back into this same purpose of service and wellness.',
  rightTitle: 'POLICY',
  rightDescription:
    'Policies are not a set of rigid rules, but simple, clear guidelines derived directly from our Operating Principles. Their purpose is to enable mission-focused action and speed, not to create bureaucracy.\n\nPolicy of Mission-First: If a policy and the mission ever conflict, the mission comes first.',
};

const previousResponsibilitiesContent = {
  leftDescription:
    'The organization remains committed to serving humanity through wellness initiatives, education support, and sustainable community development.',
  rightDescription:
    'Policies are designed to encourage action, responsibility, and long-term social growth while keeping the mission centered on humanity.',
};

export const defaultEducateContent: SocialInitiativesEducateContent = {
  heading: 'EDUCATE. ENSHRINE. EMPOWER.',
  paragraph:
    'We are working towards a long-term and sustainable transformation in communities by addressing the root causes. We are working towards social change, which is a constant and complex phenomenon. It requires a slow, gradual and long term process through a strong policy framework as it involves changes in traditions, customs.',
  image: '',
};

const previousEducateContent = {
  paragraph:
    'We are committed to creating sustainable transformation through education, wellness support, and community-led initiatives that uplift lives with dignity and long-term impact.',
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

export function normalizeSocialInitiativesSection(
  section: SocialInitiativesSectionKey,
  content: unknown,
):
  | Partial<SocialInitiativesHeroContent>
  | Partial<SocialInitiativesSplitContent>
  | Partial<SocialInitiativesEducateContent> {
  if (!content || typeof content !== 'object') return {};

  if (section === 'hero') {
    const value = content as Partial<SocialInitiativesHeroContent>;
    return {
      ...value,
      title:
        !value.title || value.title === previousHeroContent.title
          ? defaultHeroContent.title
          : value.title,
      subtitle:
        !value.subtitle || value.subtitle === previousHeroContent.subtitle
          ? defaultHeroContent.subtitle
          : value.subtitle,
      alignmentTitle:
        !value.alignmentTitle || value.alignmentTitle === previousHeroContent.alignmentTitle
          ? defaultHeroContent.alignmentTitle
          : value.alignmentTitle,
      alignmentDescription:
        !value.alignmentDescription ||
        value.alignmentDescription === previousHeroContent.alignmentDescription
          ? defaultHeroContent.alignmentDescription
          : value.alignmentDescription,
      goalTitle:
        !value.goalTitle || value.goalTitle === previousHeroContent.goalTitle
          ? defaultHeroContent.goalTitle
          : value.goalTitle,
      goalDescription:
        !value.goalDescription || value.goalDescription === previousHeroContent.goalDescription
          ? defaultHeroContent.goalDescription
          : value.goalDescription,
    };
  }

  if (section === 'responsibilities') {
    const value = content as Partial<SocialInitiativesSplitContent>;
    return {
      ...value,
      leftTitle: value.leftTitle || defaultResponsibilitiesContent.leftTitle,
      leftDescription:
        !value.leftDescription ||
        value.leftDescription === previousResponsibilitiesContent.leftDescription
          ? defaultResponsibilitiesContent.leftDescription
          : value.leftDescription,
      rightTitle: value.rightTitle || defaultResponsibilitiesContent.rightTitle,
      rightDescription:
        !value.rightDescription ||
        value.rightDescription === previousResponsibilitiesContent.rightDescription
          ? defaultResponsibilitiesContent.rightDescription
          : value.rightDescription,
    };
  }

  const value = content as Partial<SocialInitiativesEducateContent>;
  return {
    ...value,
    heading: value.heading || defaultEducateContent.heading,
    paragraph:
      !value.paragraph || value.paragraph === previousEducateContent.paragraph
        ? defaultEducateContent.paragraph
        : value.paragraph,
  };
}

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
