import { prisma } from '@/lib/db';

/** Fetch all active sections for the public page, ordered by sortOrder. */
export async function getCoreValuesSections() {
  return prisma.ourEssenceCoreValues.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
}

/** Fetch ALL sections (active + inactive) for admin. */
export async function getAllCoreValuesSections() {
  return prisma.ourEssenceCoreValues.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

/** Fetch a single section by key (e.g. "hero", "foundation", "principles"). */
export async function getCoreValuesSection(section: string) {
  return prisma.ourEssenceCoreValues.findUnique({
    where: { section },
  });
}
