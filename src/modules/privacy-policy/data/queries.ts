import { cache } from 'react';
import { prisma } from '@/lib/db';

/** Fetch all active sections for the public page, ordered by sortOrder. */
export const getPrivacyPolicySections = cache(async () => {
  return prisma.privacyPolicy.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { section: true, content: true },
  });
});

/** Fetch ALL sections (active + inactive) for admin. */
export async function getAllPrivacyPolicySections() {
  return prisma.privacyPolicy.findMany({ orderBy: { sortOrder: 'asc' } });
}

/** Fetch a single section by key ("hero" | "body"). */
export async function getPrivacyPolicySection(section: string) {
  return prisma.privacyPolicy.findUnique({ where: { section } });
}
