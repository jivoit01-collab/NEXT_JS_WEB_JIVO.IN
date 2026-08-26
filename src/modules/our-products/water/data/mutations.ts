import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

/** Upsert a section by key. Used by admin save actions. */
export async function upsertWaterSection(
  section: string,
  content: unknown,
  title?: string | null,
) {
  const jsonContent = content as Prisma.InputJsonValue;

  return prisma.ourProductsWater.upsert({
    where: { section },
    update: { content: jsonContent, title, updatedAt: new Date() },
    create: { section, content: jsonContent, title },
  });
}

/** Delete a section by ID. */
export async function deleteWaterSectionById(id: string) {
  return prisma.ourProductsWater.delete({ where: { id } });
}
