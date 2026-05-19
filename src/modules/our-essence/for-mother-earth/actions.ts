'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/lib/action-response';
import type { OurEssenceForMotherEarth } from '@prisma/client';
import {
  deleteForMotherEarthSectionById,
  getAllForMotherEarthSections,
  getForMotherEarthSection,
  getForMotherEarthSections,
  upsertForMotherEarthSection,
} from './data';
import { FOR_MOTHER_EARTH_ADMIN_ROUTE, FOR_MOTHER_EARTH_ROUTE } from './constants';
import { forMotherEarthSectionSchemas } from './validations';
import type { ForMotherEarthSectionKey } from './types';

async function requireAdmin<T>(): Promise<ActionResponse<T> | null> {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' };
  }
  return null;
}

export async function getForMotherEarthPageSectionsAction() {
  return getForMotherEarthSections();
}

export async function getAllForMotherEarthSectionsAction(): Promise<
  ActionResponse<OurEssenceForMotherEarth[]>
> {
  const guard = await requireAdmin<OurEssenceForMotherEarth[]>();
  if (guard) return guard;

  try {
    const sections = await getAllForMotherEarthSections();
    return { success: true, data: sections };
  } catch (error) {
    console.error('[getAllForMotherEarthSectionsAction]', error);
    return { success: false, error: 'Failed to load sections' };
  }
}

export async function getForMotherEarthSectionAction(
  section: string,
): Promise<ActionResponse<OurEssenceForMotherEarth | null>> {
  const guard = await requireAdmin<OurEssenceForMotherEarth | null>();
  if (guard) return guard;

  try {
    const row = await getForMotherEarthSection(section);
    return { success: true, data: row };
  } catch (error) {
    console.error('[getForMotherEarthSectionAction]', { section, error });
    return { success: false, error: 'Failed to load section' };
  }
}

export async function upsertForMotherEarthSectionAction(
  section: ForMotherEarthSectionKey,
  content: unknown,
): Promise<ActionResponse<OurEssenceForMotherEarth>> {
  const guard = await requireAdmin<OurEssenceForMotherEarth>();
  if (guard) return guard;

  const schema = forMotherEarthSectionSchemas[section];
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
    const row = await upsertForMotherEarthSection(section, parsed.data);
    revalidatePath(FOR_MOTHER_EARTH_ROUTE);
    revalidatePath(FOR_MOTHER_EARTH_ADMIN_ROUTE);
    revalidatePath('/admin/seo');
    revalidatePath('/sitemap.xml');
    return { success: true, data: row };
  } catch (error) {
    console.error('[upsertForMotherEarthSectionAction]', { section, error });
    return { success: false, error: 'Failed to save section' };
  }
}

export async function deleteForMotherEarthSectionAction(
  id: string,
): Promise<ActionResponse<OurEssenceForMotherEarth>> {
  const guard = await requireAdmin<OurEssenceForMotherEarth>();
  if (guard) return guard;

  try {
    const deleted = await deleteForMotherEarthSectionById(id);
    revalidatePath(FOR_MOTHER_EARTH_ROUTE);
    revalidatePath(FOR_MOTHER_EARTH_ADMIN_ROUTE);
    return { success: true, data: deleted };
  } catch (error) {
    console.error('[deleteForMotherEarthSectionAction]', { id, error });
    return { success: false, error: 'Failed to delete section' };
  }
}
