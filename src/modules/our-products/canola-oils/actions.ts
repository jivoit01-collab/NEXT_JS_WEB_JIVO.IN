'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/lib/action-response';
import type { OurProductsCanolaOils } from '@prisma/client';
import {
  getCanolaOilsSections,
  getAllCanolaOilsSections,
  getCanolaOilsSection,
  upsertCanolaOilsSection,
  deleteCanolaOilsSectionById,
} from './data';
import { canolaOilsSectionSchemas } from './validations';
import type { CanolaOilsSectionKey } from './types';

async function requireAdmin<T>(): Promise<ActionResponse<T> | null> {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' };
  }
  return null;
}

// ── Public reads ─────────────────────────────────────────────

export async function getCanolaOilsPageSectionsAction() {
  return getCanolaOilsSections();
}

// ── Admin reads ──────────────────────────────────────────────

export async function getAllCanolaOilsSectionsAction(): Promise<
  ActionResponse<OurProductsCanolaOils[]>
> {
  const guard = await requireAdmin<OurProductsCanolaOils[]>();
  if (guard) return guard;

  try {
    const sections = await getAllCanolaOilsSections();
    return { success: true, data: sections };
  } catch (err) {
    console.error('[getAllCanolaOilsSectionsAction]', err);
    return { success: false, error: 'Failed to load sections' };
  }
}

export async function getCanolaOilsSectionAction(
  section: string,
): Promise<ActionResponse<OurProductsCanolaOils | null>> {
  const guard = await requireAdmin<OurProductsCanolaOils | null>();
  if (guard) return guard;

  try {
    const row = await getCanolaOilsSection(section);
    return { success: true, data: row };
  } catch (err) {
    console.error('[getCanolaOilsSectionAction]', { section, err });
    return { success: false, error: 'Failed to load section' };
  }
}

// ── Admin writes ─────────────────────────────────────────────

export async function upsertCanolaOilsSectionAction(
  section: CanolaOilsSectionKey,
  content: unknown,
): Promise<ActionResponse<OurProductsCanolaOils>> {
  const guard = await requireAdmin<OurProductsCanolaOils>();
  if (guard) return guard;

  const schema = canolaOilsSectionSchemas[section];
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
    const row = await upsertCanolaOilsSection(section, parsed.data);
    revalidatePath('/products/canola-oils');
    revalidatePath('/jivo-dev/our-products/canola-oils');
    return { success: true, data: row };
  } catch (err) {
    console.error('[upsertCanolaOilsSectionAction]', { section, err });
    return { success: false, error: 'Failed to save section' };
  }
}

export async function deleteCanolaOilsSectionAction(
  id: string,
): Promise<ActionResponse<OurProductsCanolaOils>> {
  const guard = await requireAdmin<OurProductsCanolaOils>();
  if (guard) return guard;

  try {
    const deleted = await deleteCanolaOilsSectionById(id);
    revalidatePath('/products/canola-oils');
    revalidatePath('/jivo-dev/our-products/canola-oils');
    return { success: true, data: deleted };
  } catch (err) {
    console.error('[deleteCanolaOilsSectionAction]', { id, err });
    return { success: false, error: 'Failed to delete section' };
  }
}
