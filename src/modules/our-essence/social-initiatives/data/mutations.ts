import { prisma } from '@/lib/db';
import { sectionSortOrder, sectionTitles } from './defaults';
import type { SocialInitiativesSectionKey } from '../types';

export async function upsertSocialInitiativesSection(
  section: SocialInitiativesSectionKey,
  content: object,
) {
  return prisma.ourEssenceSocialInitiatives.upsert({
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

export async function deleteSocialInitiativesSectionById(id: string) {
  return prisma.ourEssenceSocialInitiatives.delete({ where: { id } });
}

/** Set a section's active flag (show/hide it on the public page). */
export async function setSocialInitiativesSectionActive(section: string, isActive: boolean) {
  return prisma.ourEssenceSocialInitiatives.update({ where: { section }, data: { isActive } });
}

/** Persist a new section order: each key's index becomes its sortOrder. */
export async function reorderSocialInitiativesSections(orderedSections: string[]) {
  return prisma.$transaction(
    orderedSections.map((section, index) =>
      prisma.ourEssenceSocialInitiatives.update({ where: { section }, data: { sortOrder: index } }),
    ),
  );
}

