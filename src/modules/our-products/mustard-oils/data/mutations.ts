import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

/** Upsert a section by key. Used by admin save actions. */
export async function upsertMustardOilsSection(
  section: string,
  content: unknown,
  title?: string | null,
) {
  const jsonContent = content as Prisma.InputJsonValue;

  return prisma.ourProductsMustardOils.upsert({
    where: { section },
    update: { content: jsonContent, title, updatedAt: new Date() },
    create: { section, content: jsonContent, title },
  });
}

/** Delete a section by ID. */
export async function deleteMustardOilsSectionById(id: string) {
  return prisma.ourProductsMustardOils.delete({ where: { id } });
}

/** Set a section's active flag (show/hide it on the public page). */
export async function setMustardOilsSectionActive(section: string, isActive: boolean) {
  return prisma.ourProductsMustardOils.update({ where: { section }, data: { isActive } });
}

/** Persist a new section order: each key's index becomes its sortOrder. */
export async function reorderMustardOilsSections(orderedSections: string[]) {
  return prisma.$transaction(
    orderedSections.map((section, index) =>
      prisma.ourProductsMustardOils.update({ where: { section }, data: { sortOrder: index } }),
    ),
  );
}

