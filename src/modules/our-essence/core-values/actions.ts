'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/lib/action-response';
import type { OurEssenceCoreValues } from '@prisma/client';
import {
  getCoreValuesSections,
  getAllCoreValuesSections,
  getCoreValuesSection,
  upsertCoreValuesSection,
  deleteCoreValuesSectionById,
} from './data';
import { coreValuesSectionSchemas } from './validations';
import type { CoreValuesSectionKey } from './types';

async function requireAdmin<T>(): Promise<ActionResponse<T> | null> {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' };
  }
  return null;
}

// ── Public reads ─────────────────────────────────────────────

export async function getCoreValuesPageSectionsAction() {
  return getCoreValuesSections();
}

// ── Admin reads ──────────────────────────────────────────────

export async function getAllCoreValuesSectionsAction(): Promise<
  ActionResponse<OurEssenceCoreValues[]>
> {
  const guard = await requireAdmin<OurEssenceCoreValues[]>();
  if (guard) return guard;

  try {
    const sections = await getAllCoreValuesSections();
    return { success: true, data: sections };
  } catch (err) {
    console.error('[getAllCoreValuesSectionsAction]', err);
    return { success: false, error: 'Failed to load sections' };
  }
}

export async function getCoreValuesSectionAction(
  section: string,
): Promise<ActionResponse<OurEssenceCoreValues | null>> {
  const guard = await requireAdmin<OurEssenceCoreValues | null>();
  if (guard) return guard;

  try {
    const row = await getCoreValuesSection(section);
    return { success: true, data: row };
  } catch (err) {
    console.error('[getCoreValuesSectionAction]', { section, err });
    return { success: false, error: 'Failed to load section' };
  }
}

// ── Admin writes ─────────────────────────────────────────────

export async function upsertCoreValuesSectionAction(
  section: CoreValuesSectionKey,
  content: unknown,
): Promise<ActionResponse<OurEssenceCoreValues>> {
  const guard = await requireAdmin<OurEssenceCoreValues>();
  if (guard) return guard;

  const schema = coreValuesSectionSchemas[section];
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
    const row = await upsertCoreValuesSection(section, parsed.data);
    revalidatePath('/our-essence/core-values');
    revalidatePath('/admin/our-essence-core-values');
    return { success: true, data: row };
  } catch (err) {
    console.error('[upsertCoreValuesSectionAction]', { section, err });
    return { success: false, error: 'Failed to save section' };
  }
}

export async function deleteCoreValuesSectionAction(
  id: string,
): Promise<ActionResponse<OurEssenceCoreValues>> {
  const guard = await requireAdmin<OurEssenceCoreValues>();
  if (guard) return guard;

  try {
    const deleted = await deleteCoreValuesSectionById(id);
    revalidatePath('/our-essence/core-values');
    revalidatePath('/admin/our-essence-core-values');
    return { success: true, data: deleted };
  } catch (err) {
    console.error('[deleteCoreValuesSectionAction]', { id, err });
    return { success: false, error: 'Failed to delete section' };
  }
}
