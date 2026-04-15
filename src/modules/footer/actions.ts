'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/lib/action-response';
import type { FooterColumn, FooterLink, FooterSetting } from '@prisma/client';
import type { FooterColumnWithLinks, FooterData } from './types';
import {
  footerColumnSchema,
  footerColumnUpdateSchema,
  footerLinkSchema,
  footerLinkUpdateSchema,
  footerSettingSchema,
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

/** Get all visible columns (with visible links) + setting. Used by public footer. */
export async function getVisibleFooter(): Promise<FooterData> {
  const [columns, setting] = await Promise.all([
    prisma.footerColumn.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        links: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    }),
    getFooterSetting(),
  ]);

  return { columns, setting };
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

export async function updateLink(
  id: string,
  input: unknown,
): Promise<ActionResponse<FooterLink>> {
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

export async function getFooterSetting(): Promise<FooterSetting> {
  return prisma.footerSetting.upsert({
    where: { id: SETTING_ID },
    update: {},
    create: { id: SETTING_ID },
  });
}

export async function updateFooterSetting(
  input: unknown,
): Promise<ActionResponse<FooterSetting>> {
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
