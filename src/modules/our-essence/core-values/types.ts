export interface CoreValuesHeroContent {
  heading: string;
  subtitle: string;
  paragraph: string;
  backgroundImage: string;
}

export interface CoreValueBlock {
  label: string;
  description: string;
}

export interface CoreValuesFoundationContent {
  heading: string;
  backgroundImage: string;
  blocks: CoreValueBlock[];
}

export interface CoreValuesPrinciplesContent {
  backgroundImage: string;
  blocks: CoreValueBlock[];
}

export type CoreValuesSectionKey = 'hero' | 'foundation' | 'principles';

export interface CoreValuesSectionRow {
  id: string;
  section: string;
  title: string | null;
  content: unknown;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
