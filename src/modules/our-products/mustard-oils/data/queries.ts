import { cache } from 'react';
import { prisma } from '@/lib/db';

/** Fetch all active sections for the public page, ordered by sortOrder. */
export const getMustardOilsSections = cache(async () => {
  return prisma.ourProductsMustardOils.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { section: true, content: true },
  });
});

/** Fetch ALL sections (active + inactive) for admin. */
export async function getAllMustardOilsSections() {
  return prisma.ourProductsMustardOils.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

/** Fetch a single section by key (e.g. "hero", "range", "extraction"). */
export async function getMustardOilsSection(section: string) {
  return prisma.ourProductsMustardOils.findUnique({
    where: { section },
  });
}
