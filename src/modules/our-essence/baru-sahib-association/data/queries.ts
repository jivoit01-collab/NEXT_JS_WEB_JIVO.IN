import { prisma } from '@/lib/db';
import { pageContentKey } from '../content-defaults';
import type { BaruSahibAssociationSectionKey } from '../types';

export async function getBaruSahibAssociationSections() {
  return prisma.pageContent.findMany({
    where: { page: pageContentKey, isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
}

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
