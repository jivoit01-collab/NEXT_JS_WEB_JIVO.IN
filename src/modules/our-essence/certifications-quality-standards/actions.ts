'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/lib/action-response';
import type { OurEssenceCertifications } from '@prisma/client';
import {
  getCertificationsSections,
  getAllCertificationsSections,
  getCertificationsSection,
  upsertCertificationsSection,
  deleteCertificationsSectionById,
} from './data';
import { certificationsSectionSchemas } from './validations';
import type { CertificationsSectionKey } from './types';

async function requireAdmin<T>(): Promise<ActionResponse<T> | null> {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' };
  }
  return null;
}

// ── Public reads ─────────────────────────────────────────────

export async function getCertificationsPageSectionsAction() {
  return getCertificationsSections();
}

// ── Admin reads ──────────────────────────────────────────────

export async function getAllCertificationsSectionsAction(): Promise<
  ActionResponse<OurEssenceCertifications[]>
> {
  const guard = await requireAdmin<OurEssenceCertifications[]>();
  if (guard) return guard;

  try {
    const sections = await getAllCertificationsSections();
    return { success: true, data: sections };
  } catch (err) {
    console.error('[getAllCertificationsSectionsAction]', err);
    return { success: false, error: 'Failed to load sections' };
  }
}

export async function getCertificationsSectionAction(
  section: string,
): Promise<ActionResponse<OurEssenceCertifications | null>> {
  const guard = await requireAdmin<OurEssenceCertifications | null>();
  if (guard) return guard;

  try {
    const row = await getCertificationsSection(section);
    return { success: true, data: row };
  } catch (err) {
    console.error('[getCertificationsSectionAction]', { section, err });
    return { success: false, error: 'Failed to load section' };
  }
}

// ── Admin writes ─────────────────────────────────────────────

export async function upsertCertificationsSectionAction(
  section: CertificationsSectionKey,
  content: unknown,
): Promise<ActionResponse<OurEssenceCertifications>> {
  const guard = await requireAdmin<OurEssenceCertifications>();
  if (guard) return guard;

  const schema = certificationsSectionSchemas[section];
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
    const row = await upsertCertificationsSection(section, parsed.data);
    revalidatePath('/our-essence/certifications-quality-standards');
    revalidatePath('/jivo-dev/our-essence-certifications-quality-standards');
    return { success: true, data: row };
  } catch (err) {
    console.error('[upsertCertificationsSectionAction]', { section, err });
    return { success: false, error: 'Failed to save section' };
  }
}

export async function deleteCertificationsSectionAction(
  id: string,
): Promise<ActionResponse<OurEssenceCertifications>> {
  const guard = await requireAdmin<OurEssenceCertifications>();
  if (guard) return guard;

  try {
    const deleted = await deleteCertificationsSectionById(id);
    revalidatePath('/our-essence/certifications-quality-standards');
    revalidatePath('/jivo-dev/our-essence-certifications-quality-standards');
    return { success: true, data: deleted };
  } catch (err) {
    console.error('[deleteCertificationsSectionAction]', { id, err });
    return { success: false, error: 'Failed to delete section' };
  }
}
