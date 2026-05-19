import { SITE_URL } from '@/lib/constants';
import { definePageSeo } from '@/modules/seo';
import { FOR_MOTHER_EARTH_FALLBACK_IMAGE, FOR_MOTHER_EARTH_ROUTE } from '../constants';
import type {
  ForMotherEarthCleanTreeContent,
  ForMotherEarthDisasterContent,
  ForMotherEarthHeroContent,
  ForMotherEarthSectionKey,
} from '../types';

export const defaultHeroContent: ForMotherEarthHeroContent = {
  title: 'THINGS WE DO FOR THE PLANET - FOR MOTHER EARTH',
  quote: '“Air is the Guru, Water is the Father, and Earth is the Great Mother of all.”',
  quoteAuthor: 'Guru Nanak Dev Ji',
  description:
    'The Kalgidhar Society has always taken the initiative to keep the environment clean and green and the large solar energy plants are proof of this. Multiple initiatives taken by the Society, such as Solar energy plants, waste management and plantation drives speak volumes about the commitment of the organization towards the environment and saving Mother Earth.',
  image: '',
};

export const defaultCleanTreeContent: ForMotherEarthCleanTreeContent = {
  image: '',
  cleanTitle: 'Most Cleanest Village of Himachal Pradesh',
  cleanDescription:
    'Waste management has become a major concern today in India. But this small village panchayat named Lana Bhalta in Himachal Pradesh under the guidance of Baru Sahib has solved this menacing issue.',
  treeTitle: 'Tree Plantation in Rural Villages',
  treeDescription:
    'Students of Akal Academies are shouldering their responsibilities towards nature and contributing their bit towards a green environment. Tree Plantation drive is conducted each year in all Akal Academies. The students plant saplings of fruits, flower-bearing trees and also shade-giving trees. The motto of this drive is to educate kids to Plant a Tree and follow the principle of “Green Earth, Clean Earth!”',
};

export const defaultDisasterContent: ForMotherEarthDisasterContent = {
  title: 'When Disaster Strikes',
  description:
    'The Kalgidhar Society is at the forefront of providing support at the time of any disaster across the country, including Punjab Floods, Kerala floods, Kashmir earthquake, Covid-19 pandemic etc. The services are activated at short notice with the objective of providing long-term relief.',
  image: '',
};

export const defaultSections = {
  hero: defaultHeroContent,
  cleanTree: defaultCleanTreeContent,
  disaster: defaultDisasterContent,
} as const;

export const sectionTitles: Record<ForMotherEarthSectionKey, string> = {
  hero: 'Hero Section',
  cleanTree: 'Clean Village + Tree Plantation Section',
  disaster: 'Disaster Support Section',
};

export const sectionSortOrder: Record<ForMotherEarthSectionKey, number> = {
  hero: 0,
  cleanTree: 1,
  disaster: 2,
};

export const sectionKeys = Object.keys(defaultSections) as ForMotherEarthSectionKey[];

export const fallbackImage = FOR_MOTHER_EARTH_FALLBACK_IMAGE;

export const defaultSeo = definePageSeo({
  metaTitle: 'For Mother Earth | Jivo Wellness',
  metaDescription:
    'Explore Jivo Wellness environmental initiatives for clean villages, tree plantation, disaster support, and Mother Earth.',
  keywords: [
    'for mother earth',
    'jivo wellness',
    'environment initiatives',
    'clean village',
    'tree plantation',
    'disaster support',
    'green earth clean earth',
    'solar energy',
  ],
  ogTitle: 'For Mother Earth | Jivo Wellness',
  ogDescription:
    'Discover cinematic storytelling around environmental care, tree plantation, clean villages, and disaster relief.',
  ogImage: FOR_MOTHER_EARTH_FALLBACK_IMAGE,
  twitterCard: 'summary_large_image',
  canonicalUrl: `${SITE_URL}${FOR_MOTHER_EARTH_ROUTE}`,
  robots: 'index,follow',
  structuredData: {
    '@type': 'AboutPage',
    name: 'For Mother Earth',
    url: `${SITE_URL}${FOR_MOTHER_EARTH_ROUTE}`,
    description:
      'Jivo Wellness environmental initiatives for Mother Earth, clean villages, tree plantation, and disaster support.',
  },
});
