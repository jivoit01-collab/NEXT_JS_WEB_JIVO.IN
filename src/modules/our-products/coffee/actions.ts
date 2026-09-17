'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/lib/action-response';
import type { OurProductsCoffee } from '@prisma/client';
import {
  getCoffeeSections,
  getAllCoffeeSections,
  getCoffeeSection,
  upsertCoffeeSection,
  deleteCoffeeSectionById,
  setCoffeeSectionActive,
  reorderCoffeeSections,
} from './data';
import { coffeeSectionSchemas } from './validations';
import { cleanupRemovedImages } from '@/lib/uploads-usage';
import type { CoffeeSectionKey } from './types';

async function requireAdmin<T>(): Promise<ActionResponse<T> | null> {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' };
  }
  return null;
}

// ── Public reads ─────────────────────────────────────────────

export async function getCoffeePageSectionsAction() {
  return getCoffeeSections();
}

// ── Admin reads ──────────────────────────────────────────────

export async function getAllCoffeeSectionsAction(): Promise<
  ActionResponse<OurProductsCoffee[]>
> {
  const guard = await requireAdmin<OurProductsCoffee[]>();
  if (guard) return guard;

  try {
    const sections = await getAllCoffeeSections();
    return { success: true, data: sections };
  } catch (err) {
    console.error('[getAllCoffeeSectionsAction]', err);
    return { success: false, error: 'Failed to load sections' };
  }
}

export async function getCoffeeSectionAction(
  section: string,
): Promise<ActionResponse<OurProductsCoffee | null>> {
  const guard = await requireAdmin<OurProductsCoffee | null>();
  if (guard) return guard;

  try {
    const row = await getCoffeeSection(section);
    return { success: true, data: row };
  } catch (err) {
    console.error('[getCoffeeSectionAction]', { section, err });
    return { success: false, error: 'Failed to load section' };
  }
}

// ── Admin writes ─────────────────────────────────────────────

export async function upsertCoffeeSectionAction(
  section: CoffeeSectionKey,
  content: unknown,
): Promise<ActionResponse<OurProductsCoffee>> {
  const guard = await requireAdmin<OurProductsCoffee>();
  if (guard) return guard;

  const schema = coffeeSectionSchemas[section];
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
    const existing = await getCoffeeSection(section);
    const row = await upsertCoffeeSection(section, parsed.data);
    await cleanupRemovedImages(existing?.content, parsed.data);
    revalidatePath('/products/coffee');
    revalidatePath('/jivo-dev/our-products/coffee');
    return { success: true, data: row };
  } catch (err) {
    console.error('[upsertCoffeeSectionAction]', { section, err });
    return { success: false, error: 'Failed to save section' };
  }
}

export async function deleteCoffeeSectionAction(
  id: string,
): Promise<ActionResponse<OurProductsCoffee>> {
  const guard = await requireAdmin<OurProductsCoffee>();
  if (guard) return guard;

  try {
    const deleted = await deleteCoffeeSectionById(id);
    revalidatePath('/products/coffee');
    revalidatePath('/jivo-dev/our-products/coffee');
    return { success: true, data: deleted };
  } catch (err) {
    console.error('[deleteCoffeeSectionAction]', { id, err });
    return { success: false, error: 'Failed to delete section' };
  }
}

// ── Section visibility + order (admin) ───────────────────────

export async function setCoffeeSectionActiveAction(
  section: string,
  isActive: boolean,
): Promise<ActionResponse<OurProductsCoffee>> {
  const guard = await requireAdmin<OurProductsCoffee>();
  if (guard) return guard;
  try {
    const row = await setCoffeeSectionActive(section, isActive);
    revalidatePath('/products/coffee');
    revalidatePath('/jivo-dev/our-products/coffee');
    return { success: true, data: row };
  } catch (err) {
    console.error('[setCoffeeSectionActiveAction]', { section, err });
    return { success: false, error: 'Failed to update section visibility' };
  }
}

export async function reorderCoffeeSectionsAction(
  orderedSections: string[],
): Promise<ActionResponse<null>> {
  const guard = await requireAdmin<null>();
  if (guard) return guard;
  if (!Array.isArray(orderedSections) || orderedSections.some((x) => typeof x !== 'string')) {
    return { success: false, error: 'Invalid order' };
  }
  try {
    await reorderCoffeeSections(orderedSections);
    revalidatePath('/products/coffee');
    revalidatePath('/jivo-dev/our-products/coffee');
    return { success: true, data: null };
  } catch (err) {
    console.error('[reorderCoffeeSectionsAction]', err);
    return { success: false, error: 'Failed to reorder sections' };
  }
}
