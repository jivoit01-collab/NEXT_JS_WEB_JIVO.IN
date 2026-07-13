import { definePageSeo } from '@/modules/seo';
import { SITE_URL } from '@/lib/constants';
import { MILESTONES_TIMELINE_PAGE_TITLE, MILESTONES_TIMELINE_ROUTE } from '../constants';
import type { MilestonesTimelineVideoContent } from '../types';

export const defaultVideoContent: MilestonesTimelineVideoContent = {
  video: '',
  videoMobile: '',
};

export const defaultSections = {
  video: defaultVideoContent,
} as const;

export const sectionTitles = {
  video: 'Video',
} as const;

export const sectionSortOrder = {
  video: 0,
} as const;

export const defaultSeo = definePageSeo({
  metaTitle: `${MILESTONES_TIMELINE_PAGE_TITLE} | Our Essence | Jivo Wellness`,
  metaDescription: 'Watch the Jivo Wellness milestones timeline video.',
  keywords: ['jivo milestones', 'jivo timeline', 'jivo wellness story'],
  ogTitle: `${MILESTONES_TIMELINE_PAGE_TITLE} | Jivo Wellness`,
  ogDescription: 'A full-screen milestones timeline video from Jivo Wellness.',
  ogImage: 'og-default.png',
  twitterCard: 'summary_large_image',
  canonicalUrl: `${SITE_URL}${MILESTONES_TIMELINE_ROUTE}`,
  robots: 'index,follow',
  structuredData: {
    '@type': 'VideoObject',
    name: MILESTONES_TIMELINE_PAGE_TITLE,
    url: `${SITE_URL}${MILESTONES_TIMELINE_ROUTE}`,
    description: 'A full-screen milestones timeline video from Jivo Wellness.',
  },
});