import { cache } from 'react';
import { prisma } from '@/lib/db';

/** Fetch all active sections for the public page, ordered by sortOrder. */
export const getCoffeeSections = cache(async () => {
  return prisma.ourProductsCoffee.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { section: true, content: true },
  });
});

/** Fetch ALL sections (active + inactive) for admin. */
export async function getAllCoffeeSections() {
  return prisma.ourProductsCoffee.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

/** Fetch a single section by key (e.g. "hero", "range", "keyHighlights"). */
export async function getCoffeeSection(section: string) {
  return prisma.ourProductsCoffee.findUnique({
    where: { section },
  });
}
