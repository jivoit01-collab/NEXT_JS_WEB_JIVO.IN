import type { AnalyticsDeviceType } from '@prisma/client';

/** Public-safe visitor projection — NEVER includes the internal `id` or `ipHash`. */
export interface VisitorDTO {
  visitorId: string;
  country: string | null;
  city: string | null;
  language: string | null;
  timezone: string | null;
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  device: string | null;
  deviceType: AnalyticsDeviceType;
  screenWidth: number | null;
  screenHeight: number | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  firstVisit: Date;
  lastVisit: Date;
  visitCount: number;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** Public-safe device snapshot projection (1:1 with a visitor). */
export interface DeviceInfoDTO {
  visitorId: string;
  deviceType: AnalyticsDeviceType;
  browser: string | null;
  os: string | null;
  platform: string | null;
  viewportWidth: number | null;
  viewportHeight: number | null;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Fully-resolved data (client input + server-derived context) for an upsert. */
export interface VisitorUpsertData {
  visitorId: string;
  ipHash: string | null;
  userAgent: string | null;
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  device: string | null;
  deviceType: AnalyticsDeviceType;
  screenWidth: number | null;
  screenHeight: number | null;
  language: string | null;
  timezone: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  country: string | null;
  city: string | null;
}
