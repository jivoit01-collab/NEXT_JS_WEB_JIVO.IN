import { cache } from 'react';
import { prisma } from '@/lib/db';

/** Fetch all active sections for the public page, ordered by sortOrder. */
export const getCertificationsSections = cache(async () => {
  return prisma.ourEssenceCertifications.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { section: true, content: true },
  });
});

/** Fetch ALL sections (active + inactive) for admin. */
export async function getAllCertificationsSections() {
  return prisma.ourEssenceCertifications.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

/** Fetch a single section by key (e.g. "hero", "badges", "featured"). */
export async function getCertificationsSection(section: string) {
  return prisma.ourEssenceCertifications.findUnique({
    where: { section },
  });
}
