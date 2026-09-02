import { cache } from 'react';
import { prisma } from '@/lib/db';

/** Fetch all active sections for the public page, ordered by sortOrder. */
export const getWheatgrassSections = cache(async () => {
  return prisma.ourProductsWheatgrassJuice.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { section: true, content: true },
  });
});

/** Fetch ALL sections (active + inactive) for admin. */
export async function getAllWheatgrassSections() {
  return prisma.ourProductsWheatgrassJuice.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

/** Fetch a single section by key (e.g. "hero", "range", "science"). */
export async function getWheatgrassSection(section: string) {
  return prisma.ourProductsWheatgrassJuice.findUnique({
    where: { section },
  });
}
