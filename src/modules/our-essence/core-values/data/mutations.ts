import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

/** Upsert a section by key. Used by admin save actions. */
export async function upsertCoreValuesSection(
  section: string,
  content: unknown,
  title?: string | null,
) {
  const jsonContent = content as Prisma.InputJsonValue;

  return prisma.ourEssenceCoreValues.upsert({
    where: { section },
    update: { content: jsonContent, title, updatedAt: new Date() },
    create: { section, content: jsonContent, title },
  });
}

/** Delete a section by ID. */
export async function deleteCoreValuesSectionById(id: string) {
  return prisma.ourEssenceCoreValues.delete({ where: { id } });
}
