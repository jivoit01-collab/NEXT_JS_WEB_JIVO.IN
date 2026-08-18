import { cache } from 'react';
import { prisma } from '@/lib/db';

/** Fetch all active sections for the public page, ordered by sortOrder. */
export const getGroundnutOilsSections = cache(async () => {
  return prisma.ourProductsGroundnutOils.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { section: true, content: true },
  });
});

/** Fetch ALL sections (active + inactive) for admin. */
export async function getAllGroundnutOilsSections() {
  return prisma.ourProductsGroundnutOils.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

/** Fetch a single section by key (e.g. "hero", "range", "goodness"). */
export async function getGroundnutOilsSection(section: string) {
  return prisma.ourProductsGroundnutOils.findUnique({
    where: { section },
  });
}
