export interface TheJivoCapitalHeroContent {
  title: string;
  description: string;
  image: string;
}

export interface TheJivoCapitalPlantContent {
  title: string;
  description: string;
  image: string;
  align: 'left' | 'right';
}

export type TheJivoCapitalSectionKey = 'hero' | 'oilPlant' | 'waterPlant';

export interface TheJivoCapitalSectionRow {
  id: string;
  section: TheJivoCapitalSectionKey;
  title: string | null;
  content: TheJivoCapitalHeroContent | TheJivoCapitalPlantContent;
  sortOrder: number;
  isActive: boolean;
}
