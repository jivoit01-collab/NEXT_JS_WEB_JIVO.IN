import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

/** Upsert a section by key. Used by admin save actions. */
export async function upsertRefinedGoldOilsSection(
  section: string,
  content: unknown,
  title?: string | null,
) {
  const jsonContent = content as Prisma.InputJsonValue;

  return prisma.ourProductsRefinedGoldOils.upsert({
    where: { section },
    update: { content: jsonContent, title, updatedAt: new Date() },
    create: { section, content: jsonContent, title },
  });
}

/** Delete a section by ID. */
export async function deleteRefinedGoldOilsSectionById(id: string) {
  return prisma.ourProductsRefinedGoldOils.delete({ where: { id } });
}

/** Set a section's active flag (show/hide it on the public page). */
export async function setRefinedGoldOilsSectionActive(section: string, isActive: boolean) {
  return prisma.ourProductsRefinedGoldOils.update({ where: { section }, data: { isActive } });
}

/** Persist a new section order: each key's index becomes its sortOrder. */
export async function reorderRefinedGoldOilsSections(orderedSections: string[]) {
  return prisma.$transaction(
    orderedSections.map((section, index) =>
      prisma.ourProductsRefinedGoldOils.update({ where: { section }, data: { sortOrder: index } }),
    ),
  );
}

