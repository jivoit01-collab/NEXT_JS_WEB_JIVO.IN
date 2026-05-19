export interface OurFairShareHeroContent {
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

export interface OurFairShareHealthcareContent {
  title: string;
  paragraph1: string;
  paragraph2: string;
  image: string;
}

export interface OurFairShareWomenContent {
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

export type OurFairShareSectionKey = 'hero' | 'healthcare' | 'women';

export interface OurFairShareSectionRow {
  id: string;
  section: OurFairShareSectionKey;
  title: string | null;
  content: OurFairShareHeroContent | OurFairShareHealthcareContent | OurFairShareWomenContent;
  sortOrder: number;
  isActive: boolean;
}
