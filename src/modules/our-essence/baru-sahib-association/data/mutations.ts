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
      // NOTE: do NOT touch isActive/sortOrder on update — the admin controls
      // those via the Manage Sections panel; a content save must not re-activate
      // or re-order a section.
    },
  });
}

export async function deleteBaruSahibAssociationSectionById(id: string) {
  return prisma.pageContent.delete({ where: { id } });
}

/** Set a section's active flag (show/hide it on the public page). */
export async function setBaruSahibAssociationSectionActive(section: string, isActive: boolean) {
  return prisma.pageContent.update({
    where: { page_section: { page: pageContentKey, section } },
    data: { isActive },
  });
}

/** Persist a new section order: each key's index becomes its sortOrder. */
export async function reorderBaruSahibAssociationSections(orderedSections: string[]) {
  return prisma.$transaction(
    orderedSections.map((section, index) =>
      prisma.pageContent.update({
        where: { page_section: { page: pageContentKey, section } },
        data: { sortOrder: index },
      }),
    ),
  );
}
