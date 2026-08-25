import { cache } from 'react';
import { prisma } from '@/lib/db';

/** Fetch all active sections for the public page, ordered by sortOrder. */
export const getSunflowerOilsSections = cache(async () => {
  return prisma.ourProductsSunflowerOils.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { section: true, content: true },
  });
});

/** Fetch ALL sections (active + inactive) for admin. */
export async function getAllSunflowerOilsSections() {
  return prisma.ourProductsSunflowerOils.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

/** Fetch a single section by key (e.g. "hero", "range", "benefits"). */
export async function getSunflowerOilsSection(section: string) {
  return prisma.ourProductsSunflowerOils.findUnique({
    where: { section },
  });
}
