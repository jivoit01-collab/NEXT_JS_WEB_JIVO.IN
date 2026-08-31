'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/lib/action-response';
import type { OurProductsWater } from '@prisma/client';
import {
  getWaterSections,
  getAllWaterSections,
  getWaterSection,
  upsertWaterSection,
  deleteWaterSectionById,
  setWaterSectionActive,
  reorderWaterSections,
} from './data';
import { waterSectionSchemas } from './validations';
import { cleanupRemovedImages } from '@/lib/uploads-usage';
import type { WaterSectionKey } from './types';

async function requireAdmin<T>(): Promise<ActionResponse<T> | null> {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' };
  }
  return null;
}

// ── Public reads ─────────────────────────────────────────────

export async function getWaterPageSectionsAction() {
  return getWaterSections();
}

// ── Admin reads ──────────────────────────────────────────────

export async function getAllWaterSectionsAction(): Promise<
  ActionResponse<OurProductsWater[]>
> {
  const guard = await requireAdmin<OurProductsWater[]>();
  if (guard) return guard;

  try {
    const sections = await getAllWaterSections();
    return { success: true, data: sections };
  } catch (err) {
    console.error('[getAllWaterSectionsAction]', err);
    return { success: false, error: 'Failed to load sections' };
  }
}

export async function getWaterSectionAction(
  section: string,
): Promise<ActionResponse<OurProductsWater | null>> {
  const guard = await requireAdmin<OurProductsWater | null>();
  if (guard) return guard;

  try {
    const row = await getWaterSection(section);
    return { success: true, data: row };
  } catch (err) {
    console.error('[getWaterSectionAction]', { section, err });
    return { success: false, error: 'Failed to load section' };
  }
}

// ── Admin writes ─────────────────────────────────────────────

export async function upsertWaterSectionAction(
  section: WaterSectionKey,
  content: unknown,
): Promise<ActionResponse<OurProductsWater>> {
  const guard = await requireAdmin<OurProductsWater>();
  if (guard) return guard;

  const schema = waterSectionSchemas[section];
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
    // Capture the CURRENT content before overwriting, so we can clean up any
    // image the edit removed — only if it isn't reused elsewhere.
    const existing = await getWaterSection(section);
    const row = await upsertWaterSection(section, parsed.data);
    await cleanupRemovedImages(existing?.content, parsed.data);
    revalidatePath('/products/water');
    revalidatePath('/jivo-dev/our-products/water');
    return { success: true, data: row };
  } catch (err) {
    console.error('[upsertWaterSectionAction]', { section, err });
    return { success: false, error: 'Failed to save section' };
  }
}

export async function deleteWaterSectionAction(
  id: string,
): Promise<ActionResponse<OurProductsWater>> {
  const guard = await requireAdmin<OurProductsWater>();
  if (guard) return guard;

  try {
    const deleted = await deleteWaterSectionById(id);
    revalidatePath('/products/water');
    revalidatePath('/jivo-dev/our-products/water');
    return { success: true, data: deleted };
  } catch (err) {
    console.error('[deleteWaterSectionAction]', { id, err });
    return { success: false, error: 'Failed to delete section' };
  }
}

// ── Section visibility + order (admin) ───────────────────────

export async function setWaterSectionActiveAction(
  section: string,
  isActive: boolean,
): Promise<ActionResponse<OurProductsWater>> {
  const guard = await requireAdmin<OurProductsWater>();
  if (guard) return guard;
  try {
    const row = await setWaterSectionActive(section, isActive);
    revalidatePath('/products/water');
    revalidatePath('/jivo-dev/our-products/water');
    return { success: true, data: row };
  } catch (err) {
    console.error('[setWaterSectionActiveAction]', { section, err });
    return { success: false, error: 'Failed to update section visibility' };
  }
}

export async function reorderWaterSectionsAction(
  orderedSections: string[],
): Promise<ActionResponse<null>> {
  const guard = await requireAdmin<null>();
  if (guard) return guard;
  if (!Array.isArray(orderedSections) || orderedSections.some((x) => typeof x !== 'string')) {
    return { success: false, error: 'Invalid order' };
  }
  try {
    await reorderWaterSections(orderedSections);
    revalidatePath('/products/water');
    revalidatePath('/jivo-dev/our-products/water');
    return { success: true, data: null };
  } catch (err) {
    console.error('[reorderWaterSectionsAction]', err);
    return { success: false, error: 'Failed to reorder sections' };
  }
}

