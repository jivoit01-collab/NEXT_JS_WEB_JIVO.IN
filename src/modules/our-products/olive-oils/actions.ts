'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/lib/action-response';
import type { OurProductsOliveOils } from '@prisma/client';
import {
  getOliveOilsSections,
  getAllOliveOilsSections,
  getOliveOilsSection,
  upsertOliveOilsSection,
  deleteOliveOilsSectionById,
} from './data';
import { oliveOilsSectionSchemas } from './validations';
import type { OliveOilsSectionKey } from './types';

async function requireAdmin<T>(): Promise<ActionResponse<T> | null> {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' };
  }
  return null;
}

// ── Public reads ─────────────────────────────────────────────

export async function getOliveOilsPageSectionsAction() {
  return getOliveOilsSections();
}

// ── Admin reads ──────────────────────────────────────────────

export async function getAllOliveOilsSectionsAction(): Promise<
  ActionResponse<OurProductsOliveOils[]>
> {
  const guard = await requireAdmin<OurProductsOliveOils[]>();
  if (guard) return guard;

  try {
    const sections = await getAllOliveOilsSections();
    return { success: true, data: sections };
  } catch (err) {
    console.error('[getAllOliveOilsSectionsAction]', err);
    return { success: false, error: 'Failed to load sections' };
  }
}

export async function getOliveOilsSectionAction(
  section: string,
): Promise<ActionResponse<OurProductsOliveOils | null>> {
  const guard = await requireAdmin<OurProductsOliveOils | null>();
  if (guard) return guard;

  try {
    const row = await getOliveOilsSection(section);
    return { success: true, data: row };
  } catch (err) {
    console.error('[getOliveOilsSectionAction]', { section, err });
    return { success: false, error: 'Failed to load section' };
  }
}

// ── Admin writes ─────────────────────────────────────────────

export async function upsertOliveOilsSectionAction(
  section: OliveOilsSectionKey,
  content: unknown,
): Promise<ActionResponse<OurProductsOliveOils>> {
  const guard = await requireAdmin<OurProductsOliveOils>();
  if (guard) return guard;

  const schema = oliveOilsSectionSchemas[section];
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
    const row = await upsertOliveOilsSection(section, parsed.data);
    revalidatePath('/products/olive-oils');
    revalidatePath('/jivo-dev/our-products/olive-oils');
    return { success: true, data: row };
  } catch (err) {
    console.error('[upsertOliveOilsSectionAction]', { section, err });
    return { success: false, error: 'Failed to save section' };
  }
}

export async function deleteOliveOilsSectionAction(
  id: string,
): Promise<ActionResponse<OurProductsOliveOils>> {
  const guard = await requireAdmin<OurProductsOliveOils>();
  if (guard) return guard;

  try {
    const deleted = await deleteOliveOilsSectionById(id);
    revalidatePath('/products/olive-oils');
    revalidatePath('/jivo-dev/our-products/olive-oils');
    return { success: true, data: deleted };
  } catch (err) {
    console.error('[deleteOliveOilsSectionAction]', { id, err });
    return { success: false, error: 'Failed to delete section' };
  }
}
