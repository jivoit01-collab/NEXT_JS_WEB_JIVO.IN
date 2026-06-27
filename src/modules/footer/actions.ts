'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/lib/action-response';
import type {
  FooterColumn,
  FooterLink,
  FooterSetting,
  FooterSocialLink,
  FooterCertificate,
} from '@prisma/client';
import type { FooterColumnWithLinks, FooterData } from './types';
import {
  footerColumnSchema,
  footerColumnUpdateSchema,
  footerLinkSchema,
  footerLinkUpdateSchema,
  footerSettingSchema,
  footerSocialLinkSchema,
  footerSocialLinkUpdateSchema,
  footerCertificateSchema,
  footerCertificateUpdateSchema,
} from './validations';

const SETTING_ID = 'default';

async function requireAdmin<T>(): Promise<ActionResponse<T> | null> {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' };
  }
  return null;
}

// ══════════════════════════════════════════════════════════════
//  Public
// ══════════════════════════════════════════════════════════════

/** Get all visible columns (with visible links) + setting + socials + certificates. Used by public footer. */
export async function getVisibleFooter(): Promise<FooterData> {
  const [columns, setting, socials, certificates] = await Promise.all([
    prisma.footerColumn.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        title: true,
        links: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            title: true,
            href: true,
          },
        },
      },
    }),
    getFooterSetting(),
    prisma.footerSocialLink.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, platform: true, url: true },
    }),
    prisma.footerCertificate.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, imageUrl: true, alt: true },
    }),
  ]);

  return { columns, setting, socials, certificates };
}

// ══════════════════════════════════════════════════════════════
//  Columns — admin CRUD
// ══════════════════════════════════════════════════════════════

export async function getAllColumns(): Promise<FooterColumnWithLinks[]> {
  return prisma.footerColumn.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      links: { orderBy: { sortOrder: 'asc' } },
    },
  });
}

export async function createColumn(input: unknown): Promise<ActionResponse<FooterColumn>> {
  const guard = await requireAdmin<FooterColumn>();
  if (guard) return guard;

  const parsed = footerColumnSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const created = await prisma.footerColumn.create({ data: parsed.data });
  revalidatePath('/', 'layout');
  revalidatePath('/');
  return { success: true, data: created };
}

export async function updateColumn(
  id: string,
  input: unknown,
): Promise<ActionResponse<FooterColumn>> {
  const guard = await requireAdmin<FooterColumn>();
  if (guard) return guard;

  const existing = await prisma.footerColumn.findUnique({ where: { id } });
  if (!existing) return { success: false, error: 'Column not found' };

  const parsed = footerColumnUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const updated = await prisma.footerColumn.update({ where: { id }, data: parsed.data });
  revalidatePath('/', 'layout');
  revalidatePath('/');
  return { success: true, data: updated };
}

export async function deleteColumn(id: string): Promise<ActionResponse<FooterColumn>> {
  const guard = await requireAdmin<FooterColumn>();
  if (guard) return guard;

  const existing = await prisma.footerColumn.findUnique({ where: { id } });
  if (!existing) return { success: false, error: 'Column not found' };

  const deleted = await prisma.footerColumn.delete({ where: { id } });
  revalidatePath('/', 'layout');
  revalidatePath('/');
  return { success: true, data: deleted };
}

// ══════════════════════════════════════════════════════════════
//  Links — admin CRUD
// ══════════════════════════════════════════════════════════════

export async function createLink(input: unknown): Promise<ActionResponse<FooterLink>> {
  const guard = await requireAdmin<FooterLink>();
  if (guard) return guard;

  const parsed = footerLinkSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Verify the column exists
  const column = await prisma.footerColumn.findUnique({ where: { id: parsed.data.columnId } });
  if (!column) return { success: false, error: 'Target column not found' };

  const created = await prisma.footerLink.create({ data: parsed.data });
  revalidatePath('/', 'layout');
  revalidatePath('/');
  return { success: true, data: created };
}

export async function updateLink(id: string, input: unknown): Promise<ActionResponse<FooterLink>> {
  const guard = await requireAdmin<FooterLink>();
  if (guard) return guard;

  const existing = await prisma.footerLink.findUnique({ where: { id } });
  if (!existing) return { success: false, error: 'Link not found' };

  const parsed = footerLinkUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const updated = await prisma.footerLink.update({ where: { id }, data: parsed.data });
  revalidatePath('/', 'layout');
  revalidatePath('/');
  return { success: true, data: updated };
}

export async function deleteLink(id: string): Promise<ActionResponse<FooterLink>> {
  const guard = await requireAdmin<FooterLink>();
  if (guard) return guard;

  const existing = await prisma.footerLink.findUnique({ where: { id } });
  if (!existing) return { success: false, error: 'Link not found' };

  const deleted = await prisma.footerLink.delete({ where: { id } });
  revalidatePath('/', 'layout');
  revalidatePath('/');
  return { success: true, data: deleted };
}

// ══════════════════════════════════════════════════════════════
//  Settings — singleton
// ══════════════════════════════════════════════════════════════

export async function getFooterSetting(): Promise<FooterData['setting']> {
  const setting = await prisma.footerSetting.findUnique({
    where: { id: SETTING_ID },
    select: {
      logoUrl: true,
      logoAlt: true,
      copyrightText: true,
      address: true,
      email: true,
      phone: true,
      phoneLabel: true,
      tagline: true,
      followLabel: true,
      certificationText: true,
      madeInText: true,
    },
  });

  return (
    setting ?? {
      logoUrl: null,
      logoAlt: null,
      copyrightText: null,
      address: null,
      email: null,
      phone: null,
      phoneLabel: null,
      tagline: null,
      followLabel: null,
      certificationText: null,
      madeInText: null,
    }
  );
}

export async function updateFooterSetting(input: unknown): Promise<ActionResponse<FooterSetting>> {
  const guard = await requireAdmin<FooterSetting>();
  if (guard) return guard;

  const parsed = footerSettingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const updated = await prisma.footerSetting.upsert({
    where: { id: SETTING_ID },
    update: parsed.data,
    create: { id: SETTING_ID, ...parsed.data },
  });
  revalidatePath('/', 'layout');
  revalidatePath('/');
  return { success: true, data: updated };
}

// ══════════════════════════════════════════════════════════════
//  Social links — admin CRUD
// ══════════════════════════════════════════════════════════════

export async function getAllSocialLinks(): Promise<FooterSocialLink[]> {
  return prisma.footerSocialLink.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function createSocialLink(input: unknown): Promise<ActionResponse<FooterSocialLink>> {
  const guard = await requireAdmin<FooterSocialLink>();
  if (guard) return guard;

  const parsed = footerSocialLinkSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const created = await prisma.footerSocialLink.create({ data: parsed.data });
  revalidatePath('/', 'layout');
  revalidatePath('/');
  return { success: true, data: created };
}

export async function updateSocialLink(
  id: string,
  input: unknown,
): Promise<ActionResponse<FooterSocialLink>> {
  const guard = await requireAdmin<FooterSocialLink>();
  if (guard) return guard;

  const existing = await prisma.footerSocialLink.findUnique({ where: { id } });
  if (!existing) return { success: false, error: 'Social link not found' };

  const parsed = footerSocialLinkUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const updated = await prisma.footerSocialLink.update({ where: { id }, data: parsed.data });
  revalidatePath('/', 'layout');
  revalidatePath('/');
  return { success: true, data: updated };
}

export async function deleteSocialLink(id: string): Promise<ActionResponse<FooterSocialLink>> {
  const guard = await requireAdmin<FooterSocialLink>();
  if (guard) return guard;

  const existing = await prisma.footerSocialLink.findUnique({ where: { id } });
  if (!existing) return { success: false, error: 'Social link not found' };

  const deleted = await prisma.footerSocialLink.delete({ where: { id } });
  revalidatePath('/', 'layout');
  revalidatePath('/');
  return { success: true, data: deleted };
}

// ══════════════════════════════════════════════════════════════
//  Certificates — admin CRUD
// ══════════════════════════════════════════════════════════════

export async function getAllCertificates(): Promise<FooterCertificate[]> {
  return prisma.footerCertificate.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function createCertificate(input: unknown): Promise<ActionResponse<FooterCertificate>> {
  const guard = await requireAdmin<FooterCertificate>();
  if (guard) return guard;

  const parsed = footerCertificateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const created = await prisma.footerCertificate.create({ data: parsed.data });
  revalidatePath('/', 'layout');
  revalidatePath('/');
  return { success: true, data: created };
}

export async function updateCertificate(
  id: string,
  input: unknown,
): Promise<ActionResponse<FooterCertificate>> {
  const guard = await requireAdmin<FooterCertificate>();
  if (guard) return guard;

  const existing = await prisma.footerCertificate.findUnique({ where: { id } });
  if (!existing) return { success: false, error: 'Certificate not found' };

  const parsed = footerCertificateUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const updated = await prisma.footerCertificate.update({ where: { id }, data: parsed.data });
  revalidatePath('/', 'layout');
  revalidatePath('/');
  return { success: true, data: updated };
}

export async function deleteCertificate(id: string): Promise<ActionResponse<FooterCertificate>> {
  const guard = await requireAdmin<FooterCertificate>();
  if (guard) return guard;

  const existing = await prisma.footerCertificate.findUnique({ where: { id } });
  if (!existing) return { success: false, error: 'Certificate not found' };

  const deleted = await prisma.footerCertificate.delete({ where: { id } });
  revalidatePath('/', 'layout');
  revalidatePath('/');
  return { success: true, data: deleted };
}
