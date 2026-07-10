import { cache } from 'react';
import { prisma } from '@/lib/db';
import { MILESTONES_TIMELINE_PAGE_KEY } from '../constants';
import type { MilestonesTimelineSectionKey } from '../types';

export const getMilestonesTimelineSections = cache(async () => {
  return prisma.pageContent.findMany({
    where: { page: MILESTONES_TIMELINE_PAGE_KEY, isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { section: true, content: true },
  });
});

export async function getAllMilestonesTimelineSections() {
  return prisma.pageContent.findMany({
    where: { page: MILESTONES_TIMELINE_PAGE_KEY },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getMilestonesTimelineSection(section: MilestonesTimelineSectionKey) {
  return prisma.pageContent.findUnique({
    where: { page_section: { page: MILESTONES_TIMELINE_PAGE_KEY, section } },
  });
}