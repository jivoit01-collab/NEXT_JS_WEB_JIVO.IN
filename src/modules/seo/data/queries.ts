import { prisma } from '@/lib/db';
import type { SeoMeta } from '@prisma/client';

export async function getSeoByPage(page: string): Promise<SeoMeta | null> {
  return prisma.seoMeta.findUnique({ where: { page } });
}

export async function getAllSeo(): Promise<SeoMeta[]> {
  return prisma.seoMeta.findMany({ orderBy: { page: 'asc' } });
}
