import { prisma } from '@/lib/db';

/** Upsert a section by key. Used by admin save actions. */
export async function upsertCoreValuesSection(
  section: string,
  content: unknown,
  title?: string | null,
) {
  return prisma.ourEssenceCoreValues.upsert({
    where: { section },
    update: { content: content as any, title, updatedAt: new Date() },
    create: { section, content: content as any, title },
  });
}

/** Delete a section by ID. */
export async function deleteCoreValuesSectionById(id: string) {
  return prisma.ourEssenceCoreValues.delete({ where: { id } });
}
