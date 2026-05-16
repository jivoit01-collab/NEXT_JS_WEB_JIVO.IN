import { prisma } from '@/lib/db';
import { pageContentKey, sectionSortOrder, sectionTitles } from '../content-defaults';
import type { BaruSahibAssociationSectionKey } from '../types';

export async function upsertBaruSahibAssociationSection(
  section: BaruSahibAssociationSectionKey,
  content: object,
) {
  return prisma.pageContent.upsert({
    where: { page_section: { page: pageContentKey, section } },
    create: {
      page: pageContentKey,
      section,
      title: sectionTitles[section],
      content,
      sortOrder: sectionSortOrder[section],
      isActive: true,
    },
    update: {
      title: sectionTitles[section],
      content,
      sortOrder: sectionSortOrder[section],
      isActive: true,
    },
  });
}

export async function deleteBaruSahibAssociationSectionById(id: string) {
  return prisma.pageContent.delete({ where: { id } });
}
