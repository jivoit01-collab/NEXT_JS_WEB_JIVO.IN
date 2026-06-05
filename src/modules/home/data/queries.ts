import { cache } from 'react';
import { prisma } from '@/lib/db';

export type HomePageSectionForRender = {
  section: string;
  content: unknown;
};

export type HeroSlideForRender = {
  id: string;
  backgroundImage: string;
  headline: string;
  subtitle: string;
  sortOrder: number;
  isActive: boolean;
};

export const getHomePageSectionsForRender = cache(async (): Promise<HomePageSectionForRender[]> => {
  return prisma.homePage.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      section: true,
      content: true,
    },
  });
});

export const getActiveHeroSlidesForRender = cache(async (): Promise<HeroSlideForRender[]> => {
  return prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      backgroundImage: true,
      headline: true,
      subtitle: true,
      sortOrder: true,
      isActive: true,
    },
  });
});
