import { SITE_URL } from '@/lib/constants';
import { definePageSeo } from '@/modules/seo';
import { BARU_SAHIB_ASSOCIATION_FALLBACK_IMAGE, BARU_SAHIB_ASSOCIATION_ROUTE } from '../constants';

export {
  defaultSections,
  fallbackImage,
  heroSectionData,
  humanitySectionData,
  pageContentKey,
  sectionSortOrder,
  sectionTitles,
  videoSectionData,
} from '../content-defaults';

export const defaultSeo = definePageSeo({
  metaTitle: 'Baru Sahib Association | Jivo Wellness',
  metaDescription:
    'Explore the spiritual journey, humanitarian mission, and wellness philosophy behind Baru Sahib Association.',
  keywords: [
    'baru sahib association',
    'jivo wellness',
    'our essence',
    'spiritual journey',
    'humanitarian mission',
    'wellness philosophy',
    'value based education',
    'spiritual education',
  ],
  ogTitle: 'Baru Sahib Association | Jivo Wellness',
  ogDescription:
    'Explore the spiritual journey, humanitarian mission, and wellness philosophy behind Baru Sahib Association.',
  ogImage: BARU_SAHIB_ASSOCIATION_FALLBACK_IMAGE,
  twitterCard: 'summary_large_image',
  canonicalUrl: `${SITE_URL}${BARU_SAHIB_ASSOCIATION_ROUTE}`,
  robots: 'index,follow',
  structuredData: {
    '@type': 'AboutPage',
    name: 'Baru Sahib Association',
    url: `${SITE_URL}${BARU_SAHIB_ASSOCIATION_ROUTE}`,
    description:
      'The spiritual journey, humanitarian mission, and wellness philosophy behind Baru Sahib Association.',
  },
});
