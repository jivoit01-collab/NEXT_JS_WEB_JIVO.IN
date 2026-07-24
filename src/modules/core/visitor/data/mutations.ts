import type { AnalyticsDeviceType } from '@prisma/client';
import { prisma } from '@/lib/db';
import { normalizeDeviceType, parseUserAgent } from '../../shared/device';
import type { RequestContext } from '../../shared/types';
import type { VisitorIngestInput } from '../validations';
import type { VisitorUpsertData } from '../types';

/** Upsert the 1:1 device snapshot for a visitor. */
export async function upsertDeviceInfo(
  visitorId: string,
  data: {
    deviceType: AnalyticsDeviceType;
    browser: string | null;
    os: string | null;
    platform: string | null;
    viewportWidth: number | null;
    viewportHeight: number | null;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
  },
): Promise<{ visitorId: string }> {
  return prisma.deviceInfo.upsert({
    where: { visitorId },
    create: { visitorId, ...data },
    update: data,
    select: { visitorId: true },
  });
}

/**
 * Create-or-update a visitor by its public id.
 *  - First visit  → create, visitCount = 1.
 *  - Return visit → bump lastVisit/lastSeen, increment visitCount, refresh hints.
 */
export async function upsertVisitor(data: VisitorUpsertData) {
  const now = new Date();

  return prisma.visitor.upsert({
    where: { visitorId: data.visitorId },
    create: {
      visitorId: data.visitorId,
      ipHash: data.ipHash,
      userAgent: data.userAgent,
      browser: data.browser,
      browserVersion: data.browserVersion,
      os: data.os,
      device: data.device,
      deviceType: data.deviceType,
      screenWidth: data.screenWidth,
      screenHeight: data.screenHeight,
      language: data.language,
      timezone: data.timezone,
      referrer: data.referrer,
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      country: data.country,
      city: data.city,
      firstVisit: now,
      lastVisit: now,
      lastSeen: now,
      visitCount: 1,
    },
    update: {
      lastVisit: now,
      lastSeen: now,
      visitCount: { increment: 1 },
      ipHash: data.ipHash,
      userAgent: data.userAgent,
      browser: data.browser,
      browserVersion: data.browserVersion,
      os: data.os,
      device: data.device,
      deviceType: data.deviceType,
      screenWidth: data.screenWidth,
      screenHeight: data.screenHeight,
      language: data.language,
      timezone: data.timezone,
    },
    select: { visitorId: true },
  });
}

/**
 * Orchestrated public ingest: merge validated client input with server-derived
 * request context (hashed IP, parsed UA) and upsert. Called by the API route.
 */
export async function ingestVisitor(
  input: VisitorIngestInput,
  ctx: RequestContext,
): Promise<{ visitorId: string }> {
  const ua = parseUserAgent(ctx.userAgent);
  // Client-declared device type (a hint) wins over UA sniffing when present.
  const deviceType: AnalyticsDeviceType = normalizeDeviceType(input.deviceType) ?? ua.deviceType;

  const result = await upsertVisitor({
    visitorId: input.visitorId,
    ipHash: ctx.ipHash,
    userAgent: ctx.userAgent,
    browser: ua.browser,
    browserVersion: ua.browserVersion,
    os: ua.os,
    device: ua.device,
    deviceType,
    screenWidth: input.screenWidth ?? null,
    screenHeight: input.screenHeight ?? null,
    language: input.language ?? null,
    timezone: input.timezone ?? null,
    referrer: input.referrer ?? ctx.referrer ?? null,
    utmSource: input.utmSource ?? null,
    utmMedium: input.utmMedium ?? null,
    utmCampaign: input.utmCampaign ?? null,
    // Geo is not resolved yet (future IP-geolocation extension point).
    country: null,
    city: null,
  });

  await upsertDeviceInfo(input.visitorId, {
    deviceType,
    browser: ua.browser,
    os: ua.os,
    platform: input.platform ?? null,
    viewportWidth: input.viewportWidth ?? null,
    viewportHeight: input.viewportHeight ?? null,
    isMobile: deviceType === 'MOBILE',
    isTablet: deviceType === 'TABLET',
    isDesktop: deviceType === 'DESKTOP',
  });

  return result;
}

/**
 * Guarantee a visitor row exists before a session / event / consent references
 * it (FK safety, independent of client call order). Does NOT bump visitCount —
 * only touches lastSeen — so it can't be abused to inflate visit metrics.
 */
export async function ensureVisitorExists(
  visitorId: string,
  ctx: RequestContext,
): Promise<{ visitorId: string }> {
  const ua = parseUserAgent(ctx.userAgent);
  const now = new Date();

  return prisma.visitor.upsert({
    where: { visitorId },
    create: {
      visitorId,
      ipHash: ctx.ipHash,
      userAgent: ctx.userAgent,
      browser: ua.browser,
      browserVersion: ua.browserVersion,
      os: ua.os,
      device: ua.device,
      deviceType: ua.deviceType,
      referrer: ctx.referrer,
      firstVisit: now,
      lastVisit: now,
      lastSeen: now,
      visitCount: 1,
    },
    update: { lastSeen: now },
    select: { visitorId: true },
  });
}

/** Soft-delete (anonymise) a visitor — GDPR erasure. Cascades stay intact. */
export async function softDeleteVisitor(visitorId: string) {
  return prisma.visitor.updateMany({
    where: { visitorId, deletedAt: null },
    data: { deletedAt: new Date(), ipHash: null, userAgent: null },
  });
}
