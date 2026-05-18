import { prisma } from '@/lib/db';

export async function getOurFairShareSections() {
  return prisma.ourEssenceOurFairShare.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getAllOurFairShareSections() {
  return prisma.ourEssenceOurFairShare.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getOurFairShareSection(section: string) {
  return prisma.ourEssenceOurFairShare.findUnique({
    where: { section },
  });
}
