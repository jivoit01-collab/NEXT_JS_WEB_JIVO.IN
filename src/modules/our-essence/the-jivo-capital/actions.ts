'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/lib/action-response';
import type { OurEssenceTheJivoCapital } from '@prisma/client';
import {
  deleteTheJivoCapitalSectionById,
  getAllTheJivoCapitalSections,
  getTheJivoCapitalSection,
  getTheJivoCapitalSections,
  upsertTheJivoCapitalSection,
} from './data';
import {
  THE_JIVO_CAPITAL_ADMIN_ROUTE,
  THE_JIVO_CAPITAL_ROUTE,
} from './constants';
import { theJivoCapitalSectionSchemas } from './validations';
import type { TheJivoCapitalSectionKey } from './types';

async function requireAdmin<T>(): Promise<ActionResponse<T> | null> {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' };
  }
  return null;
}

export async function getTheJivoCapitalPageSectionsAction() {
  return getTheJivoCapitalSections();
}

export async function getAllTheJivoCapitalSectionsAction(): Promise<
  ActionResponse<OurEssenceTheJivoCapital[]>
> {
  const guard = await requireAdmin<OurEssenceTheJivoCapital[]>();
  if (guard) return guard;

  try {
    const sections = await getAllTheJivoCapitalSections();
    return { success: true, data: sections };
  } catch (error) {
    console.error('[getAllTheJivoCapitalSectionsAction]', error);
    return { success: false, error: 'Failed to load sections' };
  }
}

export async function getTheJivoCapitalSectionAction(
  section: string,
): Promise<ActionResponse<OurEssenceTheJivoCapital | null>> {
  const guard = await requireAdmin<OurEssenceTheJivoCapital | null>();
  if (guard) return guard;

  try {
    const row = await getTheJivoCapitalSection(section);
    return { success: true, data: row };
  } catch (error) {
    console.error('[getTheJivoCapitalSectionAction]', { section, error });
    return { success: false, error: 'Failed to load section' };
  }
}

export async function upsertTheJivoCapitalSectionAction(
  section: TheJivoCapitalSectionKey,
  content: unknown,
): Promise<ActionResponse<OurEssenceTheJivoCapital>> {
  const guard = await requireAdmin<OurEssenceTheJivoCapital>();
  if (guard) return guard;

  const schema = theJivoCapitalSectionSchemas[section];
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
    const row = await upsertTheJivoCapitalSection(section, parsed.data);
    revalidatePath(THE_JIVO_CAPITAL_ROUTE);
    revalidatePath(THE_JIVO_CAPITAL_ADMIN_ROUTE);
    revalidatePath('/admin/seo');
    revalidatePath('/sitemap.xml');
    return { success: true, data: row };
  } catch (error) {
    console.error('[upsertTheJivoCapitalSectionAction]', { section, error });
    return { success: false, error: 'Failed to save section' };
  }
}

export async function deleteTheJivoCapitalSectionAction(
  id: string,
): Promise<ActionResponse<OurEssenceTheJivoCapital>> {
  const guard = await requireAdmin<OurEssenceTheJivoCapital>();
  if (guard) return guard;

  try {
    const deleted = await deleteTheJivoCapitalSectionById(id);
    revalidatePath(THE_JIVO_CAPITAL_ROUTE);
    revalidatePath(THE_JIVO_CAPITAL_ADMIN_ROUTE);
    return { success: true, data: deleted };
  } catch (error) {
    console.error('[deleteTheJivoCapitalSectionAction]', { id, error });
    return { success: false, error: 'Failed to delete section' };
  }
}
