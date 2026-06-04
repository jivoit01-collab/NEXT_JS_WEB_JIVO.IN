import { cache } from 'react';
import { prisma } from '@/lib/db';

export const getForMotherEarthSections = cache(async () => {
  return prisma.ourEssenceForMotherEarth.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { section: true, content: true },
  });
});

export async function getAllForMotherEarthSections() {
  return prisma.ourEssenceForMotherEarth.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getForMotherEarthSection(section: string) {
  return prisma.ourEssenceForMotherEarth.findUnique({
    where: { section },
  });
}
