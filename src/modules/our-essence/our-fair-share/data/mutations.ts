import { prisma } from '@/lib/db';
import { sectionSortOrder, sectionTitles } from './defaults';
import type { OurFairShareSectionKey } from '../types';

export async function upsertOurFairShareSection(section: OurFairShareSectionKey, content: object) {
  return prisma.ourEssenceOurFairShare.upsert({
    where: { section },
    create: {
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

export async function deleteOurFairShareSectionById(id: string) {
  return prisma.ourEssenceOurFairShare.delete({ where: { id } });
}
