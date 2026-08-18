'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/lib/action-response';
import type { OurProductsGroundnutOils } from '@prisma/client';
import {
  getGroundnutOilsSections,
  getAllGroundnutOilsSections,
  getGroundnutOilsSection,
  upsertGroundnutOilsSection,
  deleteGroundnutOilsSectionById,
} from './data';
import { groundnutOilsSectionSchemas } from './validations';
import type { GroundnutOilsSectionKey } from './types';

async function requireAdmin<T>(): Promise<ActionResponse<T> | null> {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' };
  }
  return null;
}

// ── Public reads ─────────────────────────────────────────────

export async function getGroundnutOilsPageSectionsAction() {
  return getGroundnutOilsSections();
}

// ── Admin reads ──────────────────────────────────────────────

export async function getAllGroundnutOilsSectionsAction(): Promise<
  ActionResponse<OurProductsGroundnutOils[]>
> {
  const guard = await requireAdmin<OurProductsGroundnutOils[]>();
  if (guard) return guard;

  try {
    const sections = await getAllGroundnutOilsSections();
    return { success: true, data: sections };
  } catch (err) {
    console.error('[getAllGroundnutOilsSectionsAction]', err);
    return { success: false, error: 'Failed to load sections' };
  }
}

export async function getGroundnutOilsSectionAction(
  section: string,
): Promise<ActionResponse<OurProductsGroundnutOils | null>> {
  const guard = await requireAdmin<OurProductsGroundnutOils | null>();
  if (guard) return guard;

  try {
    const row = await getGroundnutOilsSection(section);
    return { success: true, data: row };
  } catch (err) {
    console.error('[getGroundnutOilsSectionAction]', { section, err });
    return { success: false, error: 'Failed to load section' };
  }
}

// ── Admin writes ─────────────────────────────────────────────

export async function upsertGroundnutOilsSectionAction(
  section: GroundnutOilsSectionKey,
  content: unknown,
): Promise<ActionResponse<OurProductsGroundnutOils>> {
  const guard = await requireAdmin<OurProductsGroundnutOils>();
  if (guard) return guard;

  const schema = groundnutOilsSectionSchemas[section];
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
    const row = await upsertGroundnutOilsSection(section, parsed.data);
    revalidatePath('/products/groundnut-oils');
    revalidatePath('/jivo-dev/our-products/groundnut-oils');
    return { success: true, data: row };
  } catch (err) {
    console.error('[upsertGroundnutOilsSectionAction]', { section, err });
    return { success: false, error: 'Failed to save section' };
  }
}

export async function deleteGroundnutOilsSectionAction(
  id: string,
): Promise<ActionResponse<OurProductsGroundnutOils>> {
  const guard = await requireAdmin<OurProductsGroundnutOils>();
  if (guard) return guard;

  try {
    const deleted = await deleteGroundnutOilsSectionById(id);
    revalidatePath('/products/groundnut-oils');
    revalidatePath('/jivo-dev/our-products/groundnut-oils');
    return { success: true, data: deleted };
  } catch (err) {
    console.error('[deleteGroundnutOilsSectionAction]', { id, err });
    return { success: false, error: 'Failed to delete section' };
  }
}
