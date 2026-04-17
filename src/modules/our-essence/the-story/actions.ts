'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/lib/action-response';
import type { OurEssenceTheStory } from '@prisma/client';
import {
  getTheStorySections,
  getAllTheStorySections,
  getTheStorySection,
  upsertTheStorySection,
  deleteTheStorySectionById,
} from './data';
import { theStorySectionSchemas } from './validations';
import type { TheStorySectionKey } from './types';

async function requireAdmin<T>(): Promise<ActionResponse<T> | null> {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' };
  }
  return null;
}

// ── Public reads ─────────────────────────────────────────────

export async function getTheStoryPageSectionsAction() {
  return getTheStorySections();
}

// ── Admin reads ──────────────────────────────────────────────

export async function getAllTheStorySectionsAction(): Promise<
  ActionResponse<OurEssenceTheStory[]>
> {
  const guard = await requireAdmin<OurEssenceTheStory[]>();
  if (guard) return guard;

  try {
    const sections = await getAllTheStorySections();
    return { success: true, data: sections };
  } catch (err) {
    console.error('[getAllTheStorySectionsAction]', err);
    return { success: false, error: 'Failed to load sections' };
  }
}

export async function getTheStorySectionAction(
  section: string,
): Promise<ActionResponse<OurEssenceTheStory | null>> {
  const guard = await requireAdmin<OurEssenceTheStory | null>();
  if (guard) return guard;

  try {
    const row = await getTheStorySection(section);
    return { success: true, data: row };
  } catch (err) {
    console.error('[getTheStorySectionAction]', { section, err });
    return { success: false, error: 'Failed to load section' };
  }
}

// ── Admin writes ─────────────────────────────────────────────

export async function upsertTheStorySectionAction(
  section: TheStorySectionKey,
  content: unknown,
): Promise<ActionResponse<OurEssenceTheStory>> {
  const guard = await requireAdmin<OurEssenceTheStory>();
  if (guard) return guard;

  // Validate content shape
  const schema = theStorySectionSchemas[section];
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
    const row = await upsertTheStorySection(section, parsed.data);
    revalidatePath('/our-essence/the-story');
    revalidatePath('/admin/our-essence-the-story');
    return { success: true, data: row };
  } catch (err) {
    console.error('[upsertTheStorySectionAction]', { section, err });
    return { success: false, error: 'Failed to save section' };
  }
}

export async function deleteTheStorySectionAction(
  id: string,
): Promise<ActionResponse<OurEssenceTheStory>> {
  const guard = await requireAdmin<OurEssenceTheStory>();
  if (guard) return guard;

  try {
    const deleted = await deleteTheStorySectionById(id);
    revalidatePath('/our-essence/the-story');
    revalidatePath('/admin/our-essence-the-story');
    return { success: true, data: deleted };
  } catch (err) {
    console.error('[deleteTheStorySectionAction]', { id, err });
    return { success: false, error: 'Failed to delete section' };
  }
}
