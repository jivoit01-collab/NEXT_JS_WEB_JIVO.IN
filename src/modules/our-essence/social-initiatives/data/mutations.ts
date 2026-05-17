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
