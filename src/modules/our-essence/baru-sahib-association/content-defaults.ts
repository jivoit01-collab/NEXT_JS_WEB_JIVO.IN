import { BARU_SAHIB_ASSOCIATION_PAGE_KEY, BARU_SAHIB_ASSOCIATION_PAGE_TITLE } from './constants';
import type {
  BaruSahibAssociationHeroContent,
  BaruSahibAssociationHumanityContent,
  BaruSahibAssociationVideoContent,
} from './types';

export const baruSahibAssociationHeroFallbackImage =
  '1780639908366-chatgpt-image-may-8-2026-03-53-04-pm-1.webp';
export const baruSahibAssociationHumanityFallbackImage = '1779436577668-img-5268-jpg-1.webp';

export const heroSectionData: BaruSahibAssociationHeroContent = {
  title: BARU_SAHIB_ASSOCIATION_PAGE_TITLE,
  description:
    'Just as a tiny banyan seed grows into a huge tree, this place will develop into a great centre of spiritual and high quality scientific education.',
  image: baruSahibAssociationHeroFallbackImage,
};

export const videoSectionData: BaruSahibAssociationVideoContent = {
  video: '',
  videoWebm: '',
  poster: '',
  videoWidth: 0,
  videoHeight: 0,
};

export const humanitySectionData: BaruSahibAssociationHumanityContent = {
  title: 'BRINGING GRACE TO HUMAN RACE',
  description:
    'Baru Sahib has been working tirelessly towards transforming the lives of rural children through the tool of value-based education. At the same time, the Trust has placed equal focus on empowering women, providing health care, and ensuring social welfare for the vulnerable people in society. With the firm belief that everyone deserves to lead a life of dignity, each initiative is embedded in the core thought of bringing grace to the human race.',
  image: baruSahibAssociationHumanityFallbackImage,
};

export const defaultSections = {
  hero: heroSectionData,
  video: videoSectionData,
  humanity: humanitySectionData,
} as const;

export const sectionTitles = {
  hero: 'Hero',
  video: 'Video Section',
  humanity: 'Humanity Section',
} as const;

export const sectionSortOrder = {
  hero: 0,
  video: 1,
  humanity: 2,
} as const;

export const fallbackImage = baruSahibAssociationHumanityFallbackImage;

export const pageContentKey = BARU_SAHIB_ASSOCIATION_PAGE_KEY;
