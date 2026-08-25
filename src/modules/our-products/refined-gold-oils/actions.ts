'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/lib/action-response';
import type { OurProductsRefinedGoldOils } from '@prisma/client';
import {
  getRefinedGoldOilsSections,
  getAllRefinedGoldOilsSections,
  getRefinedGoldOilsSection,
  upsertRefinedGoldOilsSection,
  deleteRefinedGoldOilsSectionById,
} from './data';
import { refinedGoldOilsSectionSchemas } from './validations';
import type { RefinedGoldOilsSectionKey } from './types';

async function requireAdmin<T>(): Promise<ActionResponse<T> | null> {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' };
  }
  return null;
}

// ── Public reads ─────────────────────────────────────────────

export async function getRefinedGoldOilsPageSectionsAction() {
  return getRefinedGoldOilsSections();
}

// ── Admin reads ──────────────────────────────────────────────

export async function getAllRefinedGoldOilsSectionsAction(): Promise<
  ActionResponse<OurProductsRefinedGoldOils[]>
> {
  const guard = await requireAdmin<OurProductsRefinedGoldOils[]>();
  if (guard) return guard;

  try {
    const sections = await getAllRefinedGoldOilsSections();
    return { success: true, data: sections };
  } catch (err) {
    console.error('[getAllRefinedGoldOilsSectionsAction]', err);
    return { success: false, error: 'Failed to load sections' };
  }
}

export async function getRefinedGoldOilsSectionAction(
  section: string,
): Promise<ActionResponse<OurProductsRefinedGoldOils | null>> {
  const guard = await requireAdmin<OurProductsRefinedGoldOils | null>();
  if (guard) return guard;

  try {
    const row = await getRefinedGoldOilsSection(section);
    return { success: true, data: row };
  } catch (err) {
    console.error('[getRefinedGoldOilsSectionAction]', { section, err });
    return { success: false, error: 'Failed to load section' };
  }
}

// ── Admin writes ─────────────────────────────────────────────

export async function upsertRefinedGoldOilsSectionAction(
  section: RefinedGoldOilsSectionKey,
  content: unknown,
): Promise<ActionResponse<OurProductsRefinedGoldOils>> {
  const guard = await requireAdmin<OurProductsRefinedGoldOils>();
  if (guard) return guard;

  const schema = refinedGoldOilsSectionSchemas[section];
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
    const row = await upsertRefinedGoldOilsSection(section, parsed.data);
    revalidatePath('/products/refined-gold-oils');
    revalidatePath('/jivo-dev/our-products/refined-gold-oils');
    return { success: true, data: row };
  } catch (err) {
    console.error('[upsertRefinedGoldOilsSectionAction]', { section, err });
    return { success: false, error: 'Failed to save section' };
  }
}

export async function deleteRefinedGoldOilsSectionAction(
  id: string,
): Promise<ActionResponse<OurProductsRefinedGoldOils>> {
  const guard = await requireAdmin<OurProductsRefinedGoldOils>();
  if (guard) return guard;

  try {
    const deleted = await deleteRefinedGoldOilsSectionById(id);
    revalidatePath('/products/refined-gold-oils');
    revalidatePath('/jivo-dev/our-products/refined-gold-oils');
    return { success: true, data: deleted };
  } catch (err) {
    console.error('[deleteRefinedGoldOilsSectionAction]', { id, err });
    return { success: false, error: 'Failed to delete section' };
  }
}
