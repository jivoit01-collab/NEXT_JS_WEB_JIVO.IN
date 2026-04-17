import { prisma } from '@/lib/db';

/** Upsert a section by key. Used by admin save actions. */
export async function upsertTheStorySection(
  section: string,
  content: unknown,
  title?: string | null,
) {
  return prisma.ourEssenceTheStory.upsert({
    where: { section },
    update: { content: content as any, title, updatedAt: new Date() },
    create: { section, content: content as any, title },
  });
}

/** Delete a section by ID. */
export async function deleteTheStorySectionById(id: string) {
  return prisma.ourEssenceTheStory.delete({ where: { id } });
}
