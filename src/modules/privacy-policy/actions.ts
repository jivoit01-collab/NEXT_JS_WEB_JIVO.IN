'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/lib/action-response';
import type { PrivacyPolicy } from '@prisma/client';
import {
  getPrivacyPolicySections,
  getAllPrivacyPolicySections,
  getPrivacyPolicySection,
  upsertPrivacyPolicySection,
  deletePrivacyPolicySectionById,
} from './data';
import { privacyPolicySectionSchemas } from './validations';
import type { PrivacyPolicySectionKey } from './types';

async function requireAdmin<T>(): Promise<ActionResponse<T> | null> {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' };
  }
  return null;
}

export async function getPrivacyPolicyPageSectionsAction() {
  return getPrivacyPolicySections();
}

export async function getAllPrivacyPolicySectionsAction(): Promise<
  ActionResponse<PrivacyPolicy[]>
> {
  const guard = await requireAdmin<PrivacyPolicy[]>();
  if (guard) return guard;
  try {
    return { success: true, data: await getAllPrivacyPolicySections() };
  } catch (err) {
    console.error('[getAllPrivacyPolicySectionsAction]', err);
    return { success: false, error: 'Failed to load sections' };
  }
}

export async function getPrivacyPolicySectionAction(
  section: string,
): Promise<ActionResponse<PrivacyPolicy | null>> {
  const guard = await requireAdmin<PrivacyPolicy | null>();
  if (guard) return guard;
  try {
    return { success: true, data: await getPrivacyPolicySection(section) };
  } catch (err) {
    console.error('[getPrivacyPolicySectionAction]', { section, err });
    return { success: false, error: 'Failed to load section' };
  }
}

export async function upsertPrivacyPolicySectionAction(
  section: PrivacyPolicySectionKey,
  content: unknown,
): Promise<ActionResponse<PrivacyPolicy>> {
  const guard = await requireAdmin<PrivacyPolicy>();
  if (guard) return guard;

  const schema = privacyPolicySectionSchemas[section];
  if (!schema) return { success: false, error: `Unknown section: ${section}` };

  const parsed = schema.safeParse(content);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const row = await upsertPrivacyPolicySection(section, parsed.data);
    revalidatePath('/privacy-policy');
    revalidatePath('/jivo-dev/privacy-policy');
    return { success: true, data: row };
  } catch (err) {
    console.error('[upsertPrivacyPolicySectionAction]', { section, err });
    return { success: false, error: 'Failed to save section' };
  }
}

export async function deletePrivacyPolicySectionAction(
  id: string,
): Promise<ActionResponse<PrivacyPolicy>> {
  const guard = await requireAdmin<PrivacyPolicy>();
  if (guard) return guard;
  try {
    const deleted = await deletePrivacyPolicySectionById(id);
    revalidatePath('/privacy-policy');
    revalidatePath('/jivo-dev/privacy-policy');
    return { success: true, data: deleted };
  } catch (err) {
    console.error('[deletePrivacyPolicySectionAction]', { id, err });
    return { success: false, error: 'Failed to delete section' };
  }
}
