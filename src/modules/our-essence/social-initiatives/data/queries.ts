import { cache } from 'react';
import { prisma } from '@/lib/db';

export const getSocialInitiativesSections = cache(async () => {
  return prisma.ourEssenceSocialInitiatives.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { section: true, content: true },
  });
});

export async function getAllSocialInitiativesSections() {
  return prisma.ourEssenceSocialInitiatives.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getSocialInitiativesSection(section: string) {
  return prisma.ourEssenceSocialInitiatives.findUnique({
    where: { section },
  });
}
