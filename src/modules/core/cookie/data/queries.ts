import { cache } from 'react';
import { prisma } from '@/lib/db';
import type { Paginated } from '../../shared/types';
import type { CookieConsentDTO } from '../types';

const consentPublicSelect = {
  visitorId: true,
  status: true,
  acceptedCategories: true,
  version: true,
  acceptedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** A visitor can read its own consent (drives the cookie-banner UI state). */
export const getConsentByVisitorId = cache(
  async (visitorId: string): Promise<CookieConsentDTO | null> => {
    return prisma.cookieConsent.findUnique({
      where: { visitorId },
      select: consentPublicSelect,
    });
  },
);

/** Admin: paginated list of consent records (newest first). */
export async function listConsents(
  page: number,
  pageSize: number,
): Promise<Paginated<CookieConsentDTO>> {
  const [items, total] = await Promise.all([
    prisma.cookieConsent.findMany({
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: consentPublicSelect,
    }),
    prisma.cookieConsent.count(),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
