import { cache } from 'react';
import { prisma } from '@/lib/db';

/** Fetch all active sections for the public page, ordered by sortOrder. */
export const getRefinedGoldOilsSections = cache(async () => {
  return prisma.ourProductsRefinedGoldOils.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { section: true, content: true },
  });
});

/** Fetch ALL sections (active + inactive) for admin. */
export async function getAllRefinedGoldOilsSections() {
  return prisma.ourProductsRefinedGoldOils.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

/** Fetch a single section by key (e.g. "hero", "range", "bilona"). */
export async function getRefinedGoldOilsSection(section: string) {
  return prisma.ourProductsRefinedGoldOils.findUnique({
    where: { section },
  });
}
