'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/lib/action-response';
import type { OurProductsSunflowerOils } from '@prisma/client';
import {
  getSunflowerOilsSections,
  getAllSunflowerOilsSections,
  getSunflowerOilsSection,
  upsertSunflowerOilsSection,
  deleteSunflowerOilsSectionById,
  setSunflowerOilsSectionActive,
  reorderSunflowerOilsSections,
} from './data';
import { sunflowerOilsSectionSchemas } from './validations';
import type { SunflowerOilsSectionKey } from './types';

async function requireAdmin<T>(): Promise<ActionResponse<T> | null> {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' };
  }
  return null;
}

// ── Public reads ─────────────────────────────────────────────

export async function getSunflowerOilsPageSectionsAction() {
  return getSunflowerOilsSections();
}

// ── Admin reads ──────────────────────────────────────────────

export async function getAllSunflowerOilsSectionsAction(): Promise<
  ActionResponse<OurProductsSunflowerOils[]>
> {
  const guard = await requireAdmin<OurProductsSunflowerOils[]>();
  if (guard) return guard;

  try {
    const sections = await getAllSunflowerOilsSections();
    return { success: true, data: sections };
  } catch (err) {
    console.error('[getAllSunflowerOilsSectionsAction]', err);
    return { success: false, error: 'Failed to load sections' };
  }
}

export async function getSunflowerOilsSectionAction(
  section: string,
): Promise<ActionResponse<OurProductsSunflowerOils | null>> {
  const guard = await requireAdmin<OurProductsSunflowerOils | null>();
  if (guard) return guard;

  try {
    const row = await getSunflowerOilsSection(section);
    return { success: true, data: row };
  } catch (err) {
    console.error('[getSunflowerOilsSectionAction]', { section, err });
    return { success: false, error: 'Failed to load section' };
  }
}

// ── Admin writes ─────────────────────────────────────────────

export async function upsertSunflowerOilsSectionAction(
  section: SunflowerOilsSectionKey,
  content: unknown,
): Promise<ActionResponse<OurProductsSunflowerOils>> {
  const guard = await requireAdmin<OurProductsSunflowerOils>();
  if (guard) return guard;

  const schema = sunflowerOilsSectionSchemas[section];
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
    const row = await upsertSunflowerOilsSection(section, parsed.data);
    revalidatePath('/products/sunflower-oils');
    revalidatePath('/jivo-dev/our-products/sunflower-oils');
    return { success: true, data: row };
  } catch (err) {
    console.error('[upsertSunflowerOilsSectionAction]', { section, err });
    return { success: false, error: 'Failed to save section' };
  }
}

export async function deleteSunflowerOilsSectionAction(
  id: string,
): Promise<ActionResponse<OurProductsSunflowerOils>> {
  const guard = await requireAdmin<OurProductsSunflowerOils>();
  if (guard) return guard;

  try {
    const deleted = await deleteSunflowerOilsSectionById(id);
    revalidatePath('/products/sunflower-oils');
    revalidatePath('/jivo-dev/our-products/sunflower-oils');
    return { success: true, data: deleted };
  } catch (err) {
    console.error('[deleteSunflowerOilsSectionAction]', { id, err });
    return { success: false, error: 'Failed to delete section' };
  }
}

// ── Section visibility + order (admin) ───────────────────────

export async function setSunflowerOilsSectionActiveAction(
  section: string,
  isActive: boolean,
): Promise<ActionResponse<OurProductsSunflowerOils>> {
  const guard = await requireAdmin<OurProductsSunflowerOils>();
  if (guard) return guard;
  try {
    const row = await setSunflowerOilsSectionActive(section, isActive);
    revalidatePath('/products/sunflower-oils');
    revalidatePath('/jivo-dev/our-products/sunflower-oils');
    return { success: true, data: row };
  } catch (err) {
    console.error('[setSunflowerOilsSectionActiveAction]', { section, err });
    return { success: false, error: 'Failed to update section visibility' };
  }
}

export async function reorderSunflowerOilsSectionsAction(
  orderedSections: string[],
): Promise<ActionResponse<null>> {
  const guard = await requireAdmin<null>();
  if (guard) return guard;
  if (!Array.isArray(orderedSections) || orderedSections.some((x) => typeof x !== 'string')) {
    return { success: false, error: 'Invalid order' };
  }
  try {
    await reorderSunflowerOilsSections(orderedSections);
    revalidatePath('/products/sunflower-oils');
    revalidatePath('/jivo-dev/our-products/sunflower-oils');
    return { success: true, data: null };
  } catch (err) {
    console.error('[reorderSunflowerOilsSectionsAction]', err);
    return { success: false, error: 'Failed to reorder sections' };
  }
}

