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
      // Do NOT touch isActive/sortOrder on update — the admin controls those via
      // the Manage Sections panel; a content save must not re-activate/re-order.
    },
  });
}

export async function deleteMilestonesTimelineSectionById(id: string) {
  return prisma.pageContent.delete({ where: { id } });
}

/** Set a section's active flag (show/hide it on the public page). */
export async function setMilestonesTimelineSectionActive(section: string, isActive: boolean) {
  return prisma.pageContent.update({
    where: { page_section: { page: MILESTONES_TIMELINE_PAGE_KEY, section } },
    data: { isActive },
  });
}

/** Persist a new section order: each key's index becomes its sortOrder. */
export async function reorderMilestonesTimelineSections(orderedSections: string[]) {
  return prisma.$transaction(
    orderedSections.map((section, index) =>
      prisma.pageContent.update({
        where: { page_section: { page: MILESTONES_TIMELINE_PAGE_KEY, section } },
        data: { sortOrder: index },
      }),
    ),
  );
}