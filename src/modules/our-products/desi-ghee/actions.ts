'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/lib/action-response';
import type { OurProductsDesiGhee } from '@prisma/client';
import {
  getDesiGheeSections,
  getAllDesiGheeSections,
  getDesiGheeSection,
  upsertDesiGheeSection,
  deleteDesiGheeSectionById,
  setDesiGheeSectionActive,
  reorderDesiGheeSections,
} from './data';
import { desiGheeSectionSchemas } from './validations';
import type { DesiGheeSectionKey } from './types';

async function requireAdmin<T>(): Promise<ActionResponse<T> | null> {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' };
  }
  return null;
}

// ── Public reads ─────────────────────────────────────────────

export async function getDesiGheePageSectionsAction() {
  return getDesiGheeSections();
}

// ── Admin reads ──────────────────────────────────────────────

export async function getAllDesiGheeSectionsAction(): Promise<
  ActionResponse<OurProductsDesiGhee[]>
> {
  const guard = await requireAdmin<OurProductsDesiGhee[]>();
  if (guard) return guard;

  try {
    const sections = await getAllDesiGheeSections();
    return { success: true, data: sections };
  } catch (err) {
    console.error('[getAllDesiGheeSectionsAction]', err);
    return { success: false, error: 'Failed to load sections' };
  }
}

export async function getDesiGheeSectionAction(
  section: string,
): Promise<ActionResponse<OurProductsDesiGhee | null>> {
  const guard = await requireAdmin<OurProductsDesiGhee | null>();
  if (guard) return guard;

  try {
    const row = await getDesiGheeSection(section);
    return { success: true, data: row };
  } catch (err) {
    console.error('[getDesiGheeSectionAction]', { section, err });
    return { success: false, error: 'Failed to load section' };
  }
}

// ── Admin writes ─────────────────────────────────────────────

export async function upsertDesiGheeSectionAction(
  section: DesiGheeSectionKey,
  content: unknown,
): Promise<ActionResponse<OurProductsDesiGhee>> {
  const guard = await requireAdmin<OurProductsDesiGhee>();
  if (guard) return guard;

  const schema = desiGheeSectionSchemas[section];
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
    const row = await upsertDesiGheeSection(section, parsed.data);
    revalidatePath('/products/desi-ghee');
    revalidatePath('/jivo-dev/our-products/desi-ghee');
    return { success: true, data: row };
  } catch (err) {
    console.error('[upsertDesiGheeSectionAction]', { section, err });
    return { success: false, error: 'Failed to save section' };
  }
}

export async function deleteDesiGheeSectionAction(
  id: string,
): Promise<ActionResponse<OurProductsDesiGhee>> {
  const guard = await requireAdmin<OurProductsDesiGhee>();
  if (guard) return guard;

  try {
    const deleted = await deleteDesiGheeSectionById(id);
    revalidatePath('/products/desi-ghee');
    revalidatePath('/jivo-dev/our-products/desi-ghee');
    return { success: true, data: deleted };
  } catch (err) {
    console.error('[deleteDesiGheeSectionAction]', { id, err });
    return { success: false, error: 'Failed to delete section' };
  }
}

// ── Section visibility + order (admin) ───────────────────────

/** Show/hide a section on the public page. */
export async function setDesiGheeSectionActiveAction(
  section: string,
  isActive: boolean,
): Promise<ActionResponse<OurProductsDesiGhee>> {
  const guard = await requireAdmin<OurProductsDesiGhee>();
  if (guard) return guard;

  try {
    const row = await setDesiGheeSectionActive(section, isActive);
    revalidatePath('/products/desi-ghee');
    revalidatePath('/jivo-dev/our-products/desi-ghee');
    return { success: true, data: row };
  } catch (err) {
    console.error('[setDesiGheeSectionActiveAction]', { section, err });
    return { success: false, error: 'Failed to update section visibility' };
  }
}

/** Persist a new section order (array of section keys in display order). */
export async function reorderDesiGheeSectionsAction(
  orderedSections: string[],
): Promise<ActionResponse<null>> {
  const guard = await requireAdmin<null>();
  if (guard) return guard;

  if (!Array.isArray(orderedSections) || orderedSections.some((s) => typeof s !== 'string')) {
    return { success: false, error: 'Invalid order' };
  }

  try {
    await reorderDesiGheeSections(orderedSections);
    revalidatePath('/products/desi-ghee');
    revalidatePath('/jivo-dev/our-products/desi-ghee');
    return { success: true, data: null };
  } catch (err) {
    console.error('[reorderDesiGheeSectionsAction]', err);
    return { success: false, error: 'Failed to reorder sections' };
  }
}
