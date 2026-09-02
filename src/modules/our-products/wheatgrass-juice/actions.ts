'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/lib/action-response';
import type { OurProductsWheatgrassJuice } from '@prisma/client';
import {
  getWheatgrassSections,
  getAllWheatgrassSections,
  getWheatgrassSection,
  upsertWheatgrassSection,
  deleteWheatgrassSectionById,
  setWheatgrassSectionActive,
  reorderWheatgrassSections,
} from './data';
import { wheatgrassSectionSchemas } from './validations';
import { cleanupRemovedImages } from '@/lib/uploads-usage';
import type { WheatgrassSectionKey } from './types';

async function requireAdmin<T>(): Promise<ActionResponse<T> | null> {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' };
  }
  return null;
}

// ── Public reads ─────────────────────────────────────────────

export async function getWheatgrassPageSectionsAction() {
  return getWheatgrassSections();
}

// ── Admin reads ──────────────────────────────────────────────

export async function getAllWheatgrassSectionsAction(): Promise<
  ActionResponse<OurProductsWheatgrassJuice[]>
> {
  const guard = await requireAdmin<OurProductsWheatgrassJuice[]>();
  if (guard) return guard;

  try {
    const sections = await getAllWheatgrassSections();
    return { success: true, data: sections };
  } catch (err) {
    console.error('[getAllWheatgrassSectionsAction]', err);
    return { success: false, error: 'Failed to load sections' };
  }
}

export async function getWheatgrassSectionAction(
  section: string,
): Promise<ActionResponse<OurProductsWheatgrassJuice | null>> {
  const guard = await requireAdmin<OurProductsWheatgrassJuice | null>();
  if (guard) return guard;

  try {
    const row = await getWheatgrassSection(section);
    return { success: true, data: row };
  } catch (err) {
    console.error('[getWheatgrassSectionAction]', { section, err });
    return { success: false, error: 'Failed to load section' };
  }
}

// ── Admin writes ─────────────────────────────────────────────

export async function upsertWheatgrassSectionAction(
  section: WheatgrassSectionKey,
  content: unknown,
): Promise<ActionResponse<OurProductsWheatgrassJuice>> {
  const guard = await requireAdmin<OurProductsWheatgrassJuice>();
  if (guard) return guard;

  const schema = wheatgrassSectionSchemas[section];
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
    const existing = await getWheatgrassSection(section);
    const row = await upsertWheatgrassSection(section, parsed.data);
    await cleanupRemovedImages(existing?.content, parsed.data);
    revalidatePath('/products/wheatgrass-juice');
    revalidatePath('/jivo-dev/our-products/wheatgrass-juice');
    return { success: true, data: row };
  } catch (err) {
    console.error('[upsertWheatgrassSectionAction]', { section, err });
    return { success: false, error: 'Failed to save section' };
  }
}

export async function deleteWheatgrassSectionAction(
  id: string,
): Promise<ActionResponse<OurProductsWheatgrassJuice>> {
  const guard = await requireAdmin<OurProductsWheatgrassJuice>();
  if (guard) return guard;

  try {
    const deleted = await deleteWheatgrassSectionById(id);
    revalidatePath('/products/wheatgrass-juice');
    revalidatePath('/jivo-dev/our-products/wheatgrass-juice');
    return { success: true, data: deleted };
  } catch (err) {
    console.error('[deleteWheatgrassSectionAction]', { id, err });
    return { success: false, error: 'Failed to delete section' };
  }
}

// ── Section visibility + order (admin) ───────────────────────

export async function setWheatgrassSectionActiveAction(
  section: string,
  isActive: boolean,
): Promise<ActionResponse<OurProductsWheatgrassJuice>> {
  const guard = await requireAdmin<OurProductsWheatgrassJuice>();
  if (guard) return guard;
  try {
    const row = await setWheatgrassSectionActive(section, isActive);
    revalidatePath('/products/wheatgrass-juice');
    revalidatePath('/jivo-dev/our-products/wheatgrass-juice');
    return { success: true, data: row };
  } catch (err) {
    console.error('[setWheatgrassSectionActiveAction]', { section, err });
    return { success: false, error: 'Failed to update section visibility' };
  }
}

export async function reorderWheatgrassSectionsAction(
  orderedSections: string[],
): Promise<ActionResponse<null>> {
  const guard = await requireAdmin<null>();
  if (guard) return guard;
  if (!Array.isArray(orderedSections) || orderedSections.some((x) => typeof x !== 'string')) {
    return { success: false, error: 'Invalid order' };
  }
  try {
    await reorderWheatgrassSections(orderedSections);
    revalidatePath('/products/wheatgrass-juice');
    revalidatePath('/jivo-dev/our-products/wheatgrass-juice');
    return { success: true, data: null };
  } catch (err) {
    console.error('[reorderWheatgrassSectionsAction]', err);
    return { success: false, error: 'Failed to reorder sections' };
  }
}

