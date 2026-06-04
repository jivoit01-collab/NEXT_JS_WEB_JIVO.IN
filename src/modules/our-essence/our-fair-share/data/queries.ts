import { cache } from 'react';
import { prisma } from '@/lib/db';

export const getOurFairShareSections = cache(async () => {
  return prisma.ourEssenceOurFairShare.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { section: true, content: true },
  });
});

export async function getAllOurFairShareSections() {
  return prisma.ourEssenceOurFairShare.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getOurFairShareSection(section: string) {
  return prisma.ourEssenceOurFairShare.findUnique({
    where: { section },
  });
}
