import { prisma } from '@/lib/db';

/** Fetch all active sections for the public page, ordered by sortOrder. */
export async function getTheStorySections() {
  return prisma.ourEssenceTheStory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
}

/** Fetch ALL sections (active + inactive) for admin. */
export async function getAllTheStorySections() {
  return prisma.ourEssenceTheStory.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

/** Fetch a single section by key (e.g. "hero", "founder", "vision"). */
export async function getTheStorySection(section: string) {
  return prisma.ourEssenceTheStory.findUnique({
    where: { section },
  });
}
