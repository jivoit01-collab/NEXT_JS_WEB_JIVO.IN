import { cache } from 'react';
import { prisma } from '@/lib/db';

/** Fetch all active sections for the public page, ordered by sortOrder. */
export const getDesiGheeSections = cache(async () => {
  return prisma.ourProductsDesiGhee.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { section: true, content: true },
  });
});

/** Fetch ALL sections (active + inactive) for admin. */
export async function getAllDesiGheeSections() {
  return prisma.ourProductsDesiGhee.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

/** Fetch a single section by key (e.g. "hero", "range", "bilona"). */
export async function getDesiGheeSection(section: string) {
  return prisma.ourProductsDesiGhee.findUnique({
    where: { section },
  });
}
