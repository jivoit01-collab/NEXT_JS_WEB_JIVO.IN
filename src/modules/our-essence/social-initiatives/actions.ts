'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/lib/action-response';
import type { OurEssenceSocialInitiatives } from '@prisma/client';
import {
  deleteSocialInitiativesSectionById,
  getAllSocialInitiativesSections,
  getSocialInitiativesSection,
  getSocialInitiativesSections,
  upsertSocialInitiativesSection,
} from './data';
import { SOCIAL_INITIATIVES_ADMIN_ROUTE, SOCIAL_INITIATIVES_ROUTE } from './constants';
import { socialInitiativesSectionSchemas } from './validations';
import type { SocialInitiativesSectionKey } from './types';

async function requireAdmin<T>(): Promise<ActionResponse<T> | null> {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' };
  }
  return null;
}

export async function getSocialInitiativesPageSectionsAction() {
  return getSocialInitiativesSections();
}

export async function getAllSocialInitiativesSectionsAction(): Promise<
  ActionResponse<OurEssenceSocialInitiatives[]>
> {
  const guard = await requireAdmin<OurEssenceSocialInitiatives[]>();
  if (guard) return guard;

  try {
    const sections = await getAllSocialInitiativesSections();
    return { success: true, data: sections };
  } catch (error) {
    console.error('[getAllSocialInitiativesSectionsAction]', error);
    return { success: false, error: 'Failed to load sections' };
  }
}

export async function getSocialInitiativesSectionAction(
  section: string,
): Promise<ActionResponse<OurEssenceSocialInitiatives | null>> {
  const guard = await requireAdmin<OurEssenceSocialInitiatives | null>();
  if (guard) return guard;

  try {
    const row = await getSocialInitiativesSection(section);
    return { success: true, data: row };
  } catch (error) {
    console.error('[getSocialInitiativesSectionAction]', { section, error });
    return { success: false, error: 'Failed to load section' };
  }
}

export async function upsertSocialInitiativesSectionAction(
  section: SocialInitiativesSectionKey,
  content: unknown,
): Promise<ActionResponse<OurEssenceSocialInitiatives>> {
  const guard = await requireAdmin<OurEssenceSocialInitiatives>();
  if (guard) return guard;

  const schema = socialInitiativesSectionSchemas[section];
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
    const row = await upsertSocialInitiativesSection(section, parsed.data);
    revalidatePath(SOCIAL_INITIATIVES_ROUTE);
    revalidatePath(SOCIAL_INITIATIVES_ADMIN_ROUTE);
    revalidatePath('/admin/seo');
    revalidatePath('/sitemap.xml');
    return { success: true, data: row };
  } catch (error) {
    console.error('[upsertSocialInitiativesSectionAction]', { section, error });
    return { success: false, error: 'Failed to save section' };
  }
}

export async function deleteSocialInitiativesSectionAction(
  id: string,
): Promise<ActionResponse<OurEssenceSocialInitiatives>> {
  const guard = await requireAdmin<OurEssenceSocialInitiatives>();
  if (guard) return guard;

  try {
    const deleted = await deleteSocialInitiativesSectionById(id);
    revalidatePath(SOCIAL_INITIATIVES_ROUTE);
    revalidatePath(SOCIAL_INITIATIVES_ADMIN_ROUTE);
    return { success: true, data: deleted };
  } catch (error) {
    console.error('[deleteSocialInitiativesSectionAction]', { id, error });
    return { success: false, error: 'Failed to delete section' };
  }
}
