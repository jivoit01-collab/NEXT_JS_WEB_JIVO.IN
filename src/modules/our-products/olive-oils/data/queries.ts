import { cache } from 'react';
import { prisma } from '@/lib/db';

/** Fetch all active sections for the public page, ordered by sortOrder. */
export const getOliveOilsSections = cache(async () => {
  return prisma.ourProductsOliveOils.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { section: true, content: true },
  });
});

/** Fetch ALL sections (active + inactive) for admin. */
export async function getAllOliveOilsSections() {
  return prisma.ourProductsOliveOils.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

/** Fetch a single section by key (e.g. "hero", "extraVirgin", "pomace"). */
export async function getOliveOilsSection(section: string) {
  return prisma.ourProductsOliveOils.findUnique({
    where: { section },
  });
}
