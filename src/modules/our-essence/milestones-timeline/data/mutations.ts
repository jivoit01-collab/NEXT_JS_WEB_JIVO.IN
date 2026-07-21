import { prisma } from '@/lib/db';
import { MILESTONES_TIMELINE_PAGE_KEY, MILESTONES_TIMELINE_PAGE_TITLE } from '../constants';
import { sectionSortOrder, sectionTitles } from './defaults';
import type { MilestonesTimelineSectionKey } from '../types';

export async function upsertMilestonesTimelineSection(
  section: MilestonesTimelineSectionKey,
  content: unknown,
) {
  return prisma.pageContent.upsert({
    where: { page_section: { page: MILESTONES_TIMELINE_PAGE_KEY, section } },
    create: {
      page: MILESTONES_TIMELINE_PAGE_KEY,
      section,
      title: sectionTitles[section] ?? MILESTONES_TIMELINE_PAGE_TITLE,
      content: content as object,
      sortOrder: sectionSortOrder[section] ?? 0,
      isActive: true,
    },
    update: {
      title: sectionTitles[section] ?? MILESTONES_TIMELINE_PAGE_TITLE,
      content: content as object,
      sortOrder: sectionSortOrder[section] ?? 0,
      isActive: true,
    },
  });
}

export async function deleteMilestonesTimelineSectionById(id: string) {
  return prisma.pageContent.delete({ where: { id } });
}