import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

/** Upsert a section by key. Used by admin save actions. */
export async function upsertDesiGheeSection(
  section: string,
  content: unknown,
  title?: string | null,
) {
  const jsonContent = content as Prisma.InputJsonValue;

  return prisma.ourProductsDesiGhee.upsert({
    where: { section },
    update: { content: jsonContent, title, updatedAt: new Date() },
    create: { section, content: jsonContent, title },
  });
}

/** Delete a section by ID. */
export async function deleteDesiGheeSectionById(id: string) {
  return prisma.ourProductsDesiGhee.delete({ where: { id } });
}

/** Set a section's active flag (show/hide it on the public page). */
export async function setDesiGheeSectionActive(section: string, isActive: boolean) {
  return prisma.ourProductsDesiGhee.update({
    where: { section },
    data: { isActive },
  });
}

/** Persist a new section order: each key's index becomes its sortOrder, in a
 *  single transaction so the order can never be left half-applied. */
export async function reorderDesiGheeSections(orderedSections: string[]) {
  return prisma.$transaction(
    orderedSections.map((section, index) =>
      prisma.ourProductsDesiGhee.update({ where: { section }, data: { sortOrder: index } }),
    ),
  );
}
