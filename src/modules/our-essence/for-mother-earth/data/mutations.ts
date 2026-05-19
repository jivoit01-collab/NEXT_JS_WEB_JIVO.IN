import { prisma } from '@/lib/db';
import { sectionSortOrder, sectionTitles } from './defaults';
import type { ForMotherEarthSectionKey } from '../types';

export async function upsertForMotherEarthSection(
  section: ForMotherEarthSectionKey,
  content: object,
) {
  return prisma.ourEssenceForMotherEarth.upsert({
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

export async function deleteForMotherEarthSectionById(id: string) {
  return prisma.ourEssenceForMotherEarth.delete({ where: { id } });
}
