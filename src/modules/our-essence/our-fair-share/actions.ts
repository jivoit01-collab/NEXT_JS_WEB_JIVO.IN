'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/lib/action-response';
import type { OurEssenceOurFairShare } from '@prisma/client';
import {
  deleteOurFairShareSectionById,
  getAllOurFairShareSections,
  getOurFairShareSection,
  getOurFairShareSections,
  upsertOurFairShareSection,
} from './data';
import { OUR_FAIR_SHARE_ADMIN_ROUTE, OUR_FAIR_SHARE_ROUTE } from './constants';
import { ourFairShareSectionSchemas } from './validations';
import type { OurFairShareSectionKey } from './types';

async function requireAdmin<T>(): Promise<ActionResponse<T> | null> {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' };
  }
  return null;
}

export async function getOurFairSharePageSectionsAction() {
  return getOurFairShareSections();
}

export async function getAllOurFairShareSectionsAction(): Promise<
  ActionResponse<OurEssenceOurFairShare[]>
> {
  const guard = await requireAdmin<OurEssenceOurFairShare[]>();
  if (guard) return guard;

  try {
    const sections = await getAllOurFairShareSections();
    return { success: true, data: sections };
  } catch (error) {
    console.error('[getAllOurFairShareSectionsAction]', error);
    return { success: false, error: 'Failed to load sections' };
  }
}

export async function getOurFairShareSectionAction(
  section: string,
): Promise<ActionResponse<OurEssenceOurFairShare | null>> {
  const guard = await requireAdmin<OurEssenceOurFairShare | null>();
  if (guard) return guard;

  try {
    const row = await getOurFairShareSection(section);
    return { success: true, data: row };
  } catch (error) {
    console.error('[getOurFairShareSectionAction]', { section, error });
    return { success: false, error: 'Failed to load section' };
  }
}

export async function upsertOurFairShareSectionAction(
  section: OurFairShareSectionKey,
  content: unknown,
): Promise<ActionResponse<OurEssenceOurFairShare>> {
  const guard = await requireAdmin<OurEssenceOurFairShare>();
  if (guard) return guard;

  const schema = ourFairShareSectionSchemas[section];
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
    const row = await upsertOurFairShareSection(section, parsed.data);
    revalidatePath(OUR_FAIR_SHARE_ROUTE);
    revalidatePath(OUR_FAIR_SHARE_ADMIN_ROUTE);
    revalidatePath('/jivo-dev/seo');
    revalidatePath('/sitemap.xml');
    return { success: true, data: row };
  } catch (error) {
    console.error('[upsertOurFairShareSectionAction]', { section, error });
    return { success: false, error: 'Failed to save section' };
  }
}

export async function deleteOurFairShareSectionAction(
  id: string,
): Promise<ActionResponse<OurEssenceOurFairShare>> {
  const guard = await requireAdmin<OurEssenceOurFairShare>();
  if (guard) return guard;

  try {
    const deleted = await deleteOurFairShareSectionById(id);
    revalidatePath(OUR_FAIR_SHARE_ROUTE);
    revalidatePath(OUR_FAIR_SHARE_ADMIN_ROUTE);
    return { success: true, data: deleted };
  } catch (error) {
    console.error('[deleteOurFairShareSectionAction]', { id, error });
    return { success: false, error: 'Failed to delete section' };
  }
}
