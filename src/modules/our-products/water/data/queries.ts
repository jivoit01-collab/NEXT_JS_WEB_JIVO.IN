import { cache } from 'react';
import { prisma } from '@/lib/db';

/** Fetch all active sections for the public page, ordered by sortOrder. */
export const getWaterSections = cache(async () => {
  return prisma.ourProductsWater.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { section: true, content: true },
  });
});

/** Fetch ALL sections (active + inactive) for admin. */
export async function getAllWaterSections() {
  return prisma.ourProductsWater.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

/** Fetch a single section by key (e.g. "hero", "range", "science"). */
export async function getWaterSection(section: string) {
  return prisma.ourProductsWater.findUnique({
    where: { section },
  });
}
