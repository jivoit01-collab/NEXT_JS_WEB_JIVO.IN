'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import {
  navLinkSchema,
  navLinkUpdateSchema,
  navbarSettingSchema,
} from './validations';
import type { ActionResponse } from '@/lib/action-response';
import type { NavLink, NavbarSetting } from '@prisma/client';

const SETTING_ID = 'default';

async function requireAdmin<T>(): Promise<ActionResponse<T> | null> {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return { success: false, error: 'Unauthorized' };
  }
  return null;
}

// Public — visible links only, ordered
export async function getVisibleNavLinks(): Promise<NavLink[]> {
  return prisma.navLink.findMany({
    where: { isVisible: true },
    orderBy: { sortOrder: 'asc' },
  });
}

// Admin — all links including hidden
export async function getAllNavLinks(): Promise<NavLink[]> {
  return prisma.navLink.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

// Admin — single link
export async function getNavLink(id: string): Promise<ActionResponse<NavLink>> {
  const link = await prisma.navLink.findUnique({ where: { id } });
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

// Admin — delete
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
