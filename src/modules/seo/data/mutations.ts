import { prisma } from '@/lib/db';
import type { Prisma, SeoMeta } from '@prisma/client';

export async function upsertSeoMeta(
  page: string,
  data: Prisma.SeoMetaUncheckedCreateInput,
): Promise<SeoMeta> {
  // Strip `page` from update — keying is enforced by the unique constraint.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { page: _ignored, ...updateData } = data;
  return prisma.seoMeta.upsert({
    where: { page },
    create: { ...data, page },
    update: updateData,
  });
}

export async function deleteSeoMeta(page: string): Promise<SeoMeta> {
  return prisma.seoMeta.delete({ where: { page } });
}
