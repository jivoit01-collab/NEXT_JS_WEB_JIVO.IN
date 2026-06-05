import { prisma } from '@/lib/db';
import { sectionSortOrder, sectionTitles } from './defaults';
import type { TheJivoCapitalSectionKey } from '../types';

export async function upsertTheJivoCapitalSection(
  section: TheJivoCapitalSectionKey,
  content: object,
) {
  return prisma.ourEssenceTheJivoCapital.upsert({
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

export async function deleteTheJivoCapitalSectionById(id: string) {
  return prisma.ourEssenceTheJivoCapital.delete({ where: { id } });
}
