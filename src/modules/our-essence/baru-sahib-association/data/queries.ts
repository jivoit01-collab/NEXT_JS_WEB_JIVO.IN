import { cache } from 'react';
import { prisma } from '@/lib/db';
import { pageContentKey } from '../content-defaults';
import type { BaruSahibAssociationSectionKey } from '../types';

export const getBaruSahibAssociationSections = cache(async () => {
  return prisma.pageContent.findMany({
    where: { page: pageContentKey, isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { section: true, content: true },
  });
});

export async function getAllBaruSahibAssociationSections() {
  return prisma.pageContent.findMany({
    where: { page: pageContentKey },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getBaruSahibAssociationSection(section: BaruSahibAssociationSectionKey) {
  return prisma.pageContent.findUnique({
    where: { page_section: { page: pageContentKey, section } },
  });
}
