import { prisma } from '@/lib/db';

export async function getSocialInitiativesSections() {
  return prisma.ourEssenceSocialInitiatives.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
}

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
