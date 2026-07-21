'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/lib/action-response';
import type { PageContent } from '@prisma/client';
import {
  deleteMilestonesTimelineSectionById,
  getAllMilestonesTimelineSections,
  getMilestonesTimelineSection,
  getMilestonesTimelineSections,
  upsertMilestonesTimelineSection,
} from './data';
import {
  MILESTONES_TIMELINE_ADMIN_ROUTE,
  MILESTONES_TIMELINE_ROUTE,
} from './constants';
import { milestonesTimelineSectionSchemas } from './validations';
import type { MilestonesTimelineSectionKey } from './types';

async function requireAdmin<T>(): Promise<ActionResponse<T> | null> {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' };
  }
  return null;
}

export async function getMilestonesTimelinePageSectionsAction() {
  return getMilestonesTimelineSections();
}

export async function getAllMilestonesTimelineSectionsAction(): Promise<ActionResponse<PageContent[]>> {
  const guard = await requireAdmin<PageContent[]>();
  if (guard) return guard;

  try {
    const sections = await getAllMilestonesTimelineSections();
    return { success: true, data: sections };
  } catch (error) {
    console.error('[getAllMilestonesTimelineSectionsAction]', error);
    return { success: false, error: 'Failed to load sections' };
  }
}

export async function getMilestonesTimelineSectionAction(
  section: MilestonesTimelineSectionKey,
): Promise<ActionResponse<PageContent | null>> {
  const guard = await requireAdmin<PageContent | null>();
  if (guard) return guard;

  try {
    const row = await getMilestonesTimelineSection(section);
    return { success: true, data: row };
  } catch (error) {
    console.error('[getMilestonesTimelineSectionAction]', { section, error });
    return { success: false, error: 'Failed to load section' };
  }
}

export async function upsertMilestonesTimelineSectionAction(
  section: MilestonesTimelineSectionKey,
  content: unknown,
): Promise<ActionResponse<PageContent>> {
  const guard = await requireAdmin<PageContent>();
  if (guard) return guard;

  const schema = milestonesTimelineSectionSchemas[section];
  if (!schema) {
    return { success: false, error: `Unknown section: ${section}` };
  }

  const parsed = schema.safeParse(content);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const row = await upsertMilestonesTimelineSection(section, parsed.data);
    revalidatePath(MILESTONES_TIMELINE_ROUTE);
    revalidatePath(MILESTONES_TIMELINE_ADMIN_ROUTE);
    revalidatePath('/sitemap.xml');
    return { success: true, data: row };
  } catch (error) {
    console.error('[upsertMilestonesTimelineSectionAction]', { section, error });
    return { success: false, error: 'Failed to save section' };
  }
}

export async function deleteMilestonesTimelineSectionAction(
  id: string,
): Promise<ActionResponse<PageContent>> {
  const guard = await requireAdmin<PageContent>();
  if (guard) return guard;

  try {
    const deleted = await deleteMilestonesTimelineSectionById(id);
    revalidatePath(MILESTONES_TIMELINE_ROUTE);
    revalidatePath(MILESTONES_TIMELINE_ADMIN_ROUTE);
    return { success: true, data: deleted };
  } catch (error) {
    console.error('[deleteMilestonesTimelineSectionAction]', { id, error });
    return { success: false, error: 'Failed to delete section' };
  }
}