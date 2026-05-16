export interface BaruSahibAssociationHeroContent {
  title: string;
  description: string;
  image: string;
}

export interface BaruSahibAssociationVideoContent {
  video: string;
}

export interface BaruSahibAssociationHumanityContent {
  title: string;
  description: string;
  image: string;
}

export type BaruSahibAssociationSectionKey = 'hero' | 'video' | 'humanity';

export interface BaruSahibAssociationSectionRow {
  id: string;
  section: BaruSahibAssociationSectionKey;
  title: string | null;
  content:
    | BaruSahibAssociationHeroContent
    | BaruSahibAssociationVideoContent
    | BaruSahibAssociationHumanityContent;
  sortOrder: number;
  isActive: boolean;
}
