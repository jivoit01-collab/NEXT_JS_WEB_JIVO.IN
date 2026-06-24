import { cache } from 'react';
import { prisma } from '@/lib/db';

export const getTheJivoCapitalSections = cache(async () => {
  return prisma.ourEssenceTheJivoCapital.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { section: true, content: true },
  });
});

export async function getAllTheJivoCapitalSections() {
  return prisma.ourEssenceTheJivoCapital.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getTheJivoCapitalSection(section: string) {
  return prisma.ourEssenceTheJivoCapital.findUnique({
    where: { section },
  });
}
