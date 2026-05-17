export interface SocialInitiativesHeroContent {
  title: string;
  subtitle: string;
  image: string;
}

export interface SocialInitiativesSplitContent {
  backgroundImage: string;
  leftTitle: string;
  leftDescription: string;
  rightTitle: string;
  rightDescription: string;
}

export interface SocialInitiativesEducateContent {
  heading: string;
  paragraph: string;
  image: string;
}

export interface SocialInitiativesCtaContent {
  heading: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  backgroundImage: string;
}

export type SocialInitiativesSectionKey =
  | 'hero'
  | 'alignment'
  | 'responsibilities'
  | 'educate'
  | 'cta';

export interface SocialInitiativesSectionRow {
  id: string;
  section: SocialInitiativesSectionKey;
  title: string | null;
  content:
    | SocialInitiativesHeroContent
    | SocialInitiativesSplitContent
    | SocialInitiativesEducateContent
    | SocialInitiativesCtaContent;
  sortOrder: number;
  isActive: boolean;
}
