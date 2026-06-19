'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/lib/action-response';
import type { PageContent } from '@prisma/client';
import {
  deleteBaruSahibAssociationSectionById,
  getAllBaruSahibAssociationSections,
  getBaruSahibAssociationSection,
  getBaruSahibAssociationSections,
  upsertBaruSahibAssociationSection,
} from './data';
import { BARU_SAHIB_ASSOCIATION_ROUTE } from './constants';
import { baruSahibAssociationSectionSchemas } from './validations';
import type { BaruSahibAssociationSectionKey } from './types';

async function requireAdmin<T>(): Promise<ActionResponse<T> | null> {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' };
  }
  return null;
}

export async function getBaruSahibAssociationPageSectionsAction() {
  return getBaruSahibAssociationSections();
}

export async function getAllBaruSahibAssociationSectionsAction(): Promise<
  ActionResponse<PageContent[]>
> {
  const guard = await requireAdmin<PageContent[]>();
  if (guard) return guard;

  try {
    const sections = await getAllBaruSahibAssociationSections();
    return { success: true, data: sections };
  } catch (error) {
    console.error('[getAllBaruSahibAssociationSectionsAction]', error);
    return { success: false, error: 'Failed to load sections' };
  }
}

export async function getBaruSahibAssociationSectionAction(
  section: BaruSahibAssociationSectionKey,
): Promise<ActionResponse<PageContent | null>> {
  const guard = await requireAdmin<PageContent | null>();
  if (guard) return guard;

  try {
    const row = await getBaruSahibAssociationSection(section);
    return { success: true, data: row };
  } catch (error) {
    console.error('[getBaruSahibAssociationSectionAction]', { section, error });
    return { success: false, error: 'Failed to load section' };
  }
}

export async function upsertBaruSahibAssociationSectionAction(
  section: BaruSahibAssociationSectionKey,
  content: unknown,
): Promise<ActionResponse<PageContent>> {
  const guard = await requireAdmin<PageContent>();
  if (guard) return guard;

  const schema = baruSahibAssociationSectionSchemas[section];
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
    const row = await upsertBaruSahibAssociationSection(section, parsed.data);
    revalidatePath(BARU_SAHIB_ASSOCIATION_ROUTE);
    revalidatePath('/jivo-dev/our-essence-baru-sahib-association');
    revalidatePath('/jivo-dev/seo');
    revalidatePath('/sitemap.xml');
    return { success: true, data: row };
  } catch (error) {
    console.error('[upsertBaruSahibAssociationSectionAction]', { section, error });
    return { success: false, error: 'Failed to save section' };
  }
}

export async function deleteBaruSahibAssociationSectionAction(
  id: string,
): Promise<ActionResponse<PageContent>> {
  const guard = await requireAdmin<PageContent>();
  if (guard) return guard;

  try {
    const deleted = await deleteBaruSahibAssociationSectionById(id);
    revalidatePath(BARU_SAHIB_ASSOCIATION_ROUTE);
    revalidatePath('/jivo-dev/our-essence-baru-sahib-association');
    return { success: true, data: deleted };
  } catch (error) {
    console.error('[deleteBaruSahibAssociationSectionAction]', { id, error });
    return { success: false, error: 'Failed to delete section' };
  }
}
