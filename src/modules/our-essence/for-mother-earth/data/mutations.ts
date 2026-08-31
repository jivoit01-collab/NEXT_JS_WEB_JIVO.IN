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

/** Set a section's active flag (show/hide it on the public page). */
export async function setForMotherEarthSectionActive(section: string, isActive: boolean) {
  return prisma.ourEssenceForMotherEarth.update({ where: { section }, data: { isActive } });
}

/** Persist a new section order: each key's index becomes its sortOrder. */
export async function reorderForMotherEarthSections(orderedSections: string[]) {
  return prisma.$transaction(
    orderedSections.map((section, index) =>
      prisma.ourEssenceForMotherEarth.update({ where: { section }, data: { sortOrder: index } }),
    ),
  );
}

