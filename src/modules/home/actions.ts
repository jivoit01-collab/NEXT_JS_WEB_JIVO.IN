'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { homeSectionSchema, homeSectionUpdateSchema, sectionContentSchemas } from './validations';
import type { ActionResponse } from '@/lib/action-response';
import type { PageContent } from '@prisma/client';

const PAGE = 'home';

async function requireAdmin<T>(): Promise<ActionResponse<T> | null> {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' };
  }
  return null;
}

// Public — active home sections ordered by sortOrder
export async function getHomePageSections(): Promise<PageContent[]> {
  return prisma.pageContent.findMany({
    where: { page: PAGE, isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
}

// Admin — all home sections including inactive
export async function getAllHomePageSections(): Promise<PageContent[]> {
  return prisma.pageContent.findMany({
    where: { page: PAGE },
    orderBy: { sortOrder: 'asc' },
  });
}

// Admin — get single section
export async function getHomePageSection(id: string): Promise<ActionResponse<PageContent>> {
  const section = await prisma.pageContent.findUnique({ where: { id } });
  if (!section || section.page !== PAGE) {
    return { success: false, error: 'Section not found' };
  }
  return { success: true, data: section };
}

// Admin — upsert section by key (primary API for admin editor)
export async function upsertHomePageSection(
  section: string,
  content: unknown,
  opts?: { sortOrder?: number; isActive?: boolean; title?: string | null },
): Promise<ActionResponse<PageContent>> {
  const guard = await requireAdmin<PageContent>();
  if (guard) return guard;

  const contentSchema = sectionContentSchemas[section];
  if (contentSchema) {
    const parsed = contentSchema.safeParse(content);
    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((i) => `${i.path.join('.') || 'content'}: ${i.message}`)
        .join('; ');
      return {
        success: false,
        error: `Validation failed — ${issues}`,
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }
  }

  const record = await prisma.pageContent.upsert({
    where: { page_section: { page: PAGE, section } },
    create: {
      page: PAGE,
      section,
      content: content as object,
      title: opts?.title ?? null,
      sortOrder: opts?.sortOrder ?? 0,
      isActive: opts?.isActive ?? true,
    },
    update: {
      content: content as object,
      ...(opts?.title !== undefined && { title: opts.title }),
      ...(opts?.sortOrder !== undefined && { sortOrder: opts.sortOrder }),
      ...(opts?.isActive !== undefined && { isActive: opts.isActive }),
    },
  });

  revalidatePath('/', 'layout');
  revalidatePath('/');
  revalidatePath('/admin/home');
  return { success: true, data: record };
}

// Admin — create section (if you want strict create, not upsert)
export async function createHomePageSection(input: unknown): Promise<ActionResponse<PageContent>> {
  const guard = await requireAdmin<PageContent>();
  if (guard) return guard;

  const parsed = homeSectionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { section, content, sortOrder, isActive } = parsed.data;

  const contentSchema = sectionContentSchemas[section];
  if (contentSchema) {
    const contentParsed = contentSchema.safeParse(content);
    if (!contentParsed.success) {
      return { success: false, error: 'Content validation failed' };
    }
  }

  const existing = await prisma.pageContent.findUnique({
    where: { page_section: { page: PAGE, section } },
  });
  if (existing) {
    return { success: false, error: `Section "${section}" already exists` };
  }

  const created = await prisma.pageContent.create({
    data: { page: PAGE, section, content: content as object, sortOrder, isActive },
  });

  revalidatePath('/', 'layout');
  revalidatePath('/');
  return { success: true, data: created };
}

// Admin — update by id
export async function updateHomePageSection(
  id: string,
  input: unknown,
): Promise<ActionResponse<PageContent>> {
  const guard = await requireAdmin<PageContent>();
  if (guard) return guard;

  const existing = await prisma.pageContent.findUnique({ where: { id } });
  if (!existing || existing.page !== PAGE) {
    return { success: false, error: 'Section not found' };
  }

  const parsed = homeSectionUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  if (parsed.data.content) {
    const contentSchema = sectionContentSchemas[existing.section];
    if (contentSchema) {
      const contentParsed = contentSchema.safeParse(parsed.data.content);
      if (!contentParsed.success) {
        const issues = contentParsed.error.issues
          .map((i) => `${i.path.join('.') || 'content'}: ${i.message}`)
          .join('; ');
        return {
          success: false,
          error: `Validation failed — ${issues}`,
          fieldErrors: contentParsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
      }
    }
  }

  const updated = await prisma.pageContent.update({
    where: { id },
    data: parsed.data as object,
  });

  revalidatePath('/', 'layout');
  revalidatePath('/');
  return { success: true, data: updated };
}

// Admin — delete
export async function deleteHomePageSection(id: string): Promise<ActionResponse<PageContent>> {
  const guard = await requireAdmin<PageContent>();
  if (guard) return guard;

  const existing = await prisma.pageContent.findUnique({ where: { id } });
  if (!existing || existing.page !== PAGE) {
    return { success: false, error: 'Section not found' };
  }

  const deleted = await prisma.pageContent.delete({ where: { id } });
  revalidatePath('/', 'layout');
  revalidatePath('/');
  return { success: true, data: deleted };
}
