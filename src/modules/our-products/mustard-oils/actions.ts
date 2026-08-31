'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/lib/action-response';
import type { OurProductsMustardOils } from '@prisma/client';
import {
  getMustardOilsSections,
  getAllMustardOilsSections,
  getMustardOilsSection,
  upsertMustardOilsSection,
  deleteMustardOilsSectionById,
  setMustardOilsSectionActive,
  reorderMustardOilsSections,
} from './data';
import { mustardOilsSectionSchemas } from './validations';
import type { MustardOilsSectionKey } from './types';

async function requireAdmin<T>(): Promise<ActionResponse<T> | null> {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' };
  }
  return null;
}

// ── Public reads ─────────────────────────────────────────────

export async function getMustardOilsPageSectionsAction() {
  return getMustardOilsSections();
}

// ── Admin reads ──────────────────────────────────────────────

export async function getAllMustardOilsSectionsAction(): Promise<
  ActionResponse<OurProductsMustardOils[]>
> {
  const guard = await requireAdmin<OurProductsMustardOils[]>();
  if (guard) return guard;

  try {
    const sections = await getAllMustardOilsSections();
    return { success: true, data: sections };
  } catch (err) {
    console.error('[getAllMustardOilsSectionsAction]', err);
    return { success: false, error: 'Failed to load sections' };
  }
}

export async function getMustardOilsSectionAction(
  section: string,
): Promise<ActionResponse<OurProductsMustardOils | null>> {
  const guard = await requireAdmin<OurProductsMustardOils | null>();
  if (guard) return guard;

  try {
    const row = await getMustardOilsSection(section);
    return { success: true, data: row };
  } catch (err) {
    console.error('[getMustardOilsSectionAction]', { section, err });
    return { success: false, error: 'Failed to load section' };
  }
}

// ── Admin writes ─────────────────────────────────────────────

export async function upsertMustardOilsSectionAction(
  section: MustardOilsSectionKey,
  content: unknown,
): Promise<ActionResponse<OurProductsMustardOils>> {
  const guard = await requireAdmin<OurProductsMustardOils>();
  if (guard) return guard;

  const schema = mustardOilsSectionSchemas[section];
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
    const row = await upsertMustardOilsSection(section, parsed.data);
    revalidatePath('/products/mustard-oils');
    revalidatePath('/jivo-dev/our-products/mustard-oils');
    return { success: true, data: row };
  } catch (err) {
    console.error('[upsertMustardOilsSectionAction]', { section, err });
    return { success: false, error: 'Failed to save section' };
  }
}

export async function deleteMustardOilsSectionAction(
  id: string,
): Promise<ActionResponse<OurProductsMustardOils>> {
  const guard = await requireAdmin<OurProductsMustardOils>();
  if (guard) return guard;

  try {
    const deleted = await deleteMustardOilsSectionById(id);
    revalidatePath('/products/mustard-oils');
    revalidatePath('/jivo-dev/our-products/mustard-oils');
    return { success: true, data: deleted };
  } catch (err) {
    console.error('[deleteMustardOilsSectionAction]', { id, err });
    return { success: false, error: 'Failed to delete section' };
  }
}

// ── Section visibility + order (admin) ───────────────────────

export async function setMustardOilsSectionActiveAction(
  section: string,
  isActive: boolean,
): Promise<ActionResponse<OurProductsMustardOils>> {
  const guard = await requireAdmin<OurProductsMustardOils>();
  if (guard) return guard;
  try {
    const row = await setMustardOilsSectionActive(section, isActive);
    revalidatePath('/products/mustard-oils');
    revalidatePath('/jivo-dev/our-products/mustard-oils');
    return { success: true, data: row };
  } catch (err) {
    console.error('[setMustardOilsSectionActiveAction]', { section, err });
    return { success: false, error: 'Failed to update section visibility' };
  }
}

export async function reorderMustardOilsSectionsAction(
  orderedSections: string[],
): Promise<ActionResponse<null>> {
  const guard = await requireAdmin<null>();
  if (guard) return guard;
  if (!Array.isArray(orderedSections) || orderedSections.some((x) => typeof x !== 'string')) {
    return { success: false, error: 'Invalid order' };
  }
  try {
    await reorderMustardOilsSections(orderedSections);
    revalidatePath('/products/mustard-oils');
    revalidatePath('/jivo-dev/our-products/mustard-oils');
    return { success: true, data: null };
  } catch (err) {
    console.error('[reorderMustardOilsSectionsAction]', err);
    return { success: false, error: 'Failed to reorder sections' };
  }
}

