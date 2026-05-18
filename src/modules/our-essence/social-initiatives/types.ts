export interface SocialInitiativesHeroContent {
  title: string;
  subtitle: string;
  image: string;
  alignmentTitle: string;
  alignmentDescription: string;
  goalTitle: string;
  goalDescription: string;
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

export type SocialInitiativesSectionKey = 'hero' | 'responsibilities' | 'educate';

export interface SocialInitiativesSectionRow {
  id: string;
  section: SocialInitiativesSectionKey;
  title: string | null;
  content:
    | SocialInitiativesHeroContent
    | SocialInitiativesSplitContent
    | SocialInitiativesEducateContent;
  sortOrder: number;
  isActive: boolean;
}
