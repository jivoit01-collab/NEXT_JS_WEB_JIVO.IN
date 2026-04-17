'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import {
  navLinkSchema,
  navLinkUpdateSchema,
  navSubLinkSchema,
  navSubLinkUpdateSchema,
  navbarSettingSchema,
} from './validations';
import type { ActionResponse } from '@/lib/action-response';
import type { NavLink, NavSubLink, NavbarSetting } from '@prisma/client';

const SETTING_ID = 'default';

type NavLinkWithSubs = NavLink & { subLinks: NavSubLink[] };

async function requireAdmin<T>(): Promise<ActionResponse<T> | null> {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' };
  }
  return null;
}

// ── Public — visible links + visible sub-links, ordered ───────

export async function getVisibleNavLinks(): Promise<NavLinkWithSubs[]> {
  return prisma.navLink.findMany({
    where: { isVisible: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      subLinks: {
        where: { isVisible: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });
}

// ── Admin — all links + all sub-links ─────────────────────────

export async function getAllNavLinks(): Promise<NavLinkWithSubs[]> {
  return prisma.navLink.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      subLinks: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });
}

// Admin — single link
export async function getNavLink(id: string): Promise<ActionResponse<NavLinkWithSubs>> {
  const link = await prisma.navLink.findUnique({
    where: { id },
    include: { subLinks: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!link) return { success: false, error: 'Nav link not found' };
  return { success: true, data: link };
}

// Admin — create
export async function createNavLink(input: unknown): Promise<ActionResponse<NavLink>> {
  const guard = await requireAdmin<NavLink>();
  if (guard) return guard;

  const parsed = navLinkSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const created = await prisma.navLink.create({ data: parsed.data });

  revalidatePath('/', 'layout');
  revalidatePath('/');
  return { success: true, data: created };
}

// Admin — update
export async function updateNavLink(
  id: string,
  input: unknown,
): Promise<ActionResponse<NavLink>> {
  const guard = await requireAdmin<NavLink>();
  if (guard) return guard;

  const existing = await prisma.navLink.findUnique({ where: { id } });
  if (!existing) return { success: false, error: 'Nav link not found' };

  const parsed = navLinkUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const updated = await prisma.navLink.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath('/', 'layout');
  revalidatePath('/');
  return { success: true, data: updated };
}

// Admin — delete (cascade deletes sub-links via Prisma)
export async function deleteNavLink(id: string): Promise<ActionResponse<NavLink>> {
  const guard = await requireAdmin<NavLink>();
  if (guard) return guard;

  const existing = await prisma.navLink.findUnique({ where: { id } });
  if (!existing) return { success: false, error: 'Nav link not found' };

  const deleted = await prisma.navLink.delete({ where: { id } });

  revalidatePath('/', 'layout');
  revalidatePath('/');
  return { success: true, data: deleted };
}

// ── Sub-link CRUD ─────────────────────────────────────────────

// Admin — create sub-link
export async function createNavSubLink(input: unknown): Promise<ActionResponse<NavSubLink>> {
  const guard = await requireAdmin<NavSubLink>();
  if (guard) return guard;

  const parsed = navSubLinkSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Verify parent exists
  const parent = await prisma.navLink.findUnique({ where: { id: parsed.data.navLinkId } });
  if (!parent) return { success: false, error: 'Parent nav link not found' };

  const created = await prisma.navSubLink.create({ data: parsed.data });

  revalidatePath('/', 'layout');
  revalidatePath('/');
  return { success: true, data: created };
}

// Admin — update sub-link
export async function updateNavSubLink(
  id: string,
  input: unknown,
): Promise<ActionResponse<NavSubLink>> {
  const guard = await requireAdmin<NavSubLink>();
  if (guard) return guard;

  const existing = await prisma.navSubLink.findUnique({ where: { id } });
  if (!existing) return { success: false, error: 'Sub-link not found' };

  const parsed = navSubLinkUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // If moving to a different parent, verify it exists
  if (parsed.data.navLinkId && parsed.data.navLinkId !== existing.navLinkId) {
    const parent = await prisma.navLink.findUnique({ where: { id: parsed.data.navLinkId } });
    if (!parent) return { success: false, error: 'Target parent nav link not found' };
  }

  const updated = await prisma.navSubLink.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath('/', 'layout');
  revalidatePath('/');
  return { success: true, data: updated };
}

// Admin — delete sub-link
export async function deleteNavSubLink(id: string): Promise<ActionResponse<NavSubLink>> {
  const guard = await requireAdmin<NavSubLink>();
  if (guard) return guard;

  const existing = await prisma.navSubLink.findUnique({ where: { id } });
  if (!existing) return { success: false, error: 'Sub-link not found' };

  const deleted = await prisma.navSubLink.delete({ where: { id } });

  revalidatePath('/', 'layout');
  revalidatePath('/');
  return { success: true, data: deleted };
}

// ── Navbar settings (logo + branding) ──────────────────────────

// Public + admin — singleton fetch (creates the row on first call).
export async function getNavbarSetting(): Promise<NavbarSetting> {
  const setting = await prisma.navbarSetting.upsert({
    where: { id: SETTING_ID },
    update: {},
    create: { id: SETTING_ID },
  });
  return setting;
}

// Admin — update logo / alt text
export async function updateNavbarSetting(
  input: unknown,
): Promise<ActionResponse<NavbarSetting>> {
  const guard = await requireAdmin<NavbarSetting>();
  if (guard) return guard;

  const parsed = navbarSettingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const updated = await prisma.navbarSetting.upsert({
    where: { id: SETTING_ID },
    update: parsed.data,
    create: { id: SETTING_ID, ...parsed.data },
  });

  revalidatePath('/', 'layout');
  revalidatePath('/');
  return { success: true, data: updated };
}
