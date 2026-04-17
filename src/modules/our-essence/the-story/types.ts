export interface TheStoryHeroContent {
  heading: string;
  paragraph: string;
  backgroundImage: string;
}

export interface TheStoryFounderContent {
  sectionHeading: string;
  title: string;
  paragraph: string;
  founderImage: string;
}

export interface TheStoryVisionContent {
  sectionHeading: string;
  title: string;
  leftColumn: string;
  rightColumn: string;
}

export type TheStorySectionKey = 'hero' | 'founder' | 'vision';

export interface TheStorySectionRow {
  id: string;
  section: string;
  title: string | null;
  content: unknown;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
