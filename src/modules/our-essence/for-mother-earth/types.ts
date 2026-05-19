export interface ForMotherEarthHeroContent {
  title: string;
  quote: string;
  quoteAuthor: string;
  description: string;
  image: string;
}

export interface ForMotherEarthCleanTreeContent {
  image: string;
  cleanTitle: string;
  cleanDescription: string;
  treeTitle: string;
  treeDescription: string;
}

export interface ForMotherEarthDisasterContent {
  title: string;
  description: string;
  image: string;
}

export type ForMotherEarthSectionKey = 'hero' | 'cleanTree' | 'disaster';

export interface ForMotherEarthSectionRow {
  id: string;
  section: ForMotherEarthSectionKey;
  title: string | null;
  content:
    | ForMotherEarthHeroContent
    | ForMotherEarthCleanTreeContent
    | ForMotherEarthDisasterContent;
  sortOrder: number;
  isActive: boolean;
}
