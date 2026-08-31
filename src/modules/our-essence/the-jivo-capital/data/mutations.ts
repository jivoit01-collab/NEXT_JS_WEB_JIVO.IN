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

/** Set a section's active flag (show/hide it on the public page). */
export async function setTheJivoCapitalSectionActive(section: string, isActive: boolean) {
  return prisma.ourEssenceTheJivoCapital.update({ where: { section }, data: { isActive } });
}

/** Persist a new section order: each key's index becomes its sortOrder. */
export async function reorderTheJivoCapitalSections(orderedSections: string[]) {
  return prisma.$transaction(
    orderedSections.map((section, index) =>
      prisma.ourEssenceTheJivoCapital.update({ where: { section }, data: { sortOrder: index } }),
    ),
  );
}

