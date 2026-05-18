import { SITE_URL } from '@/lib/constants';
import { definePageSeo } from '@/modules/seo';
import { OUR_FAIR_SHARE_FALLBACK_IMAGE, OUR_FAIR_SHARE_ROUTE } from '../constants';
import type {
  OurFairShareHealthcareContent,
  OurFairShareHeroContent,
  OurFairShareSectionKey,
  OurFairShareWomenContent,
} from '../types';

export const defaultHeroContent: OurFairShareHeroContent = {
  title: 'Value Based Education : Vidya',
  subtitle: 'BLEND OF MODERN EDUCATION WITH SPIRITUAL VALUES',
  description:
    'We have an obligation to be empathic, principled and considerate, even in our pursuit of material gratification. A compassionate mind and sustainable lifestyle is nurtured through knowledge and action that works in synchronicity with good human values',
  image: '',
};

export const defaultHealthcareContent: OurFairShareHealthcareContent = {
  title: 'Restoring Health and Happiness through Divinity & Loving Medical Care',
  paragraph1:
    'Free-of-cost healthcare facilities are provided to underprivileged rural and hilly people, locally at their doorsteps.',
  paragraph2:
    'The Akal Charitable Hospital organizes 4-5 free medical camps a year. Medical specialists from across the world volunteer to offer their services at these camps. People from all castes, creeds, colours, and religions are welcome to the camp and receive free medical checkups and treatments, dental care, surgical procedures and post-operative medical care. All patients and their accompanying family members receive free accommodations and meals.',
  image: '',
};

export const defaultWomenContent: OurFairShareWomenContent = {
  title: 'WOMEN EMPOWERMENT',
  subtitle: 'EMPOWERING WOMEN FOR BUILDING NATION',
  description:
    'The Kalgidhar Society has introduced this program AIRWE which provides education and employment opportunities to women so that they can lead a respectable and independent life. In addition to that, rehabilitation of women in very vulnerable situations so that they can lead a life of dignity.',
  image: '',
};

export const defaultSections = {
  hero: defaultHeroContent,
  healthcare: defaultHealthcareContent,
  women: defaultWomenContent,
} as const;

export const sectionTitles: Record<OurFairShareSectionKey, string> = {
  hero: 'Hero Section',
  healthcare: 'Healthcare Section',
  women: 'Women Empowerment Section',
};

export const sectionSortOrder: Record<OurFairShareSectionKey, number> = {
  hero: 0,
  healthcare: 1,
  women: 2,
};

export const sectionKeys = Object.keys(defaultSections) as OurFairShareSectionKey[];

export const fallbackImage = OUR_FAIR_SHARE_FALLBACK_IMAGE;

export const defaultSeo = definePageSeo({
  metaTitle: 'Our Fair Share | Jivo Wellness',
  metaDescription:
    'Explore Jivo Wellness initiatives in value-based education, healthcare, and women empowerment through immersive storytelling.',
  keywords: [
    'our fair share',
    'jivo wellness',
    'value based education',
    'vidya',
    'healthcare service',
    'women empowerment',
    'spiritual values',
    'humanitarian care',
  ],
  ogTitle: 'Our Fair Share | Jivo Wellness',
  ogDescription:
    'Discover value-based education, loving medical care, and women empowerment through Jivo Wellness storytelling.',
  ogImage: OUR_FAIR_SHARE_FALLBACK_IMAGE,
  twitterCard: 'summary_large_image',
  canonicalUrl: `${SITE_URL}${OUR_FAIR_SHARE_ROUTE}`,
  robots: 'index,follow',
  structuredData: {
    '@type': 'AboutPage',
    name: 'Our Fair Share',
    url: `${SITE_URL}${OUR_FAIR_SHARE_ROUTE}`,
    description:
      'Jivo Wellness initiatives across value-based education, healthcare, and women empowerment.',
  },
});
