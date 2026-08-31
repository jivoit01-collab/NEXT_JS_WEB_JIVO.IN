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

/** Set a section's active flag (show/hide it on the public page). */
export async function setOurFairShareSectionActive(section: string, isActive: boolean) {
  return prisma.ourEssenceOurFairShare.update({ where: { section }, data: { isActive } });
}

/** Persist a new section order: each key's index becomes its sortOrder. */
export async function reorderOurFairShareSections(orderedSections: string[]) {
  return prisma.$transaction(
    orderedSections.map((section, index) =>
      prisma.ourEssenceOurFairShare.update({ where: { section }, data: { sortOrder: index } }),
    ),
  );
}

