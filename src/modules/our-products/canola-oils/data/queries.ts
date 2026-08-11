import { cache } from 'react';
import { prisma } from '@/lib/db';

/** Fetch all active sections for the public page, ordered by sortOrder. */
export const getCanolaOilsSections = cache(async () => {
  return prisma.ourProductsCanolaOils.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { section: true, content: true },
  });
});

/** Fetch ALL sections (active + inactive) for admin. */
export async function getAllCanolaOilsSections() {
  return prisma.ourProductsCanolaOils.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

/** Fetch a single section by key (e.g. "hero", "range", "science"). */
export async function getCanolaOilsSection(section: string) {
  return prisma.ourProductsCanolaOils.findUnique({
    where: { section },
  });
}
