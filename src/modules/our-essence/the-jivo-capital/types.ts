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

export interface TheJivoCapitalFarmToBottleContent {
  title: string;
  description: string;
  image: string;
}

export interface TheJivoCapitalFreshLockContent {
  title: string;
  description: string;
  backgroundImage: string;
}

export type TheJivoCapitalSectionKey =
  | 'hero'
  | 'oilPlant'
  | 'waterPlant'
  | 'farmToBottle'
  | 'freshLock';

export interface TheJivoCapitalSectionRow {
  id: string;
  section: TheJivoCapitalSectionKey;
  title: string | null;
  content:
    | TheJivoCapitalHeroContent
    | TheJivoCapitalPlantContent
    | TheJivoCapitalFarmToBottleContent
    | TheJivoCapitalFreshLockContent;
  sortOrder: number;
  isActive: boolean;
}
