import { cache } from 'react';
import { prisma } from '@/lib/db';
import type { Paginated } from '../../shared/types';
import type { DeviceInfoDTO, VisitorDTO } from '../types';

/** Fields safe to return to any consumer — excludes internal `id` + `ipHash`. */
const visitorPublicSelect = {
  visitorId: true,
  country: true,
  city: true,
  language: true,
  timezone: true,
  browser: true,
  browserVersion: true,
  os: true,
  device: true,
  deviceType: true,
  screenWidth: true,
  screenHeight: true,
  referrer: true,
  utmSource: true,
  utmMedium: true,
  utmCampaign: true,
  firstVisit: true,
  lastVisit: true,
  visitCount: true,
  lastSeen: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** Fetch one (non-deleted) visitor by its public id. */
export const getVisitorByVisitorId = cache(async (visitorId: string): Promise<VisitorDTO | null> => {
  return prisma.visitor.findFirst({
    where: { visitorId, deletedAt: null },
    select: visitorPublicSelect,
  });
});

/** Admin: paginated list of visitors (most recently seen first). */
export async function listVisitors(page: number, pageSize: number): Promise<Paginated<VisitorDTO>> {
  const where = { deletedAt: null };
  const [items, total] = await Promise.all([
    prisma.visitor.findMany({
      where,
      orderBy: { lastSeen: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: visitorPublicSelect,
    }),
    prisma.visitor.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Total non-deleted visitor count — foundation for future dashboard stats. */
export async function countVisitors(): Promise<number> {
  return prisma.visitor.count({ where: { deletedAt: null } });
}

/** Latest device snapshot for a visitor. */
export const getDeviceInfoByVisitorId = cache(
  async (visitorId: string): Promise<DeviceInfoDTO | null> => {
    return prisma.deviceInfo.findUnique({
      where: { visitorId },
      select: {
        visitorId: true,
        deviceType: true,
        browser: true,
        os: true,
        platform: true,
        viewportWidth: true,
        viewportHeight: true,
        isMobile: true,
        isTablet: true,
        isDesktop: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },
);
