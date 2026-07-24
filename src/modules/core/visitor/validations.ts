import { z } from 'zod';
import { ANALYTICS_MAX_PAGE_SIZE, ANALYTICS_PAGE_SIZE } from '../shared/constants';

/** Client-generated visitor identifier — cuid/uuid-like token. */
export const visitorIdSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_-]{8,64}$/, 'Invalid visitorId');

/** Public ingest payload (POST /api/analytics/visitor). Only client-safe hints. */
export const visitorIngestSchema = z.object({
  visitorId: visitorIdSchema,
  language: z.string().trim().max(35).optional(),
  timezone: z.string().trim().max(64).optional(),
  screenWidth: z.coerce.number().int().min(0).max(20000).optional(),
  screenHeight: z.coerce.number().int().min(0).max(20000).optional(),
  referrer: z.string().trim().max(1000).optional(),
  utmSource: z.string().trim().max(200).optional(),
  utmMedium: z.string().trim().max(200).optional(),
  utmCampaign: z.string().trim().max(200).optional(),
  // Device hints (also written to the DeviceInfo model)
  viewportWidth: z.coerce.number().int().min(0).max(20000).optional(),
  viewportHeight: z.coerce.number().int().min(0).max(20000).optional(),
  platform: z.string().trim().max(120).optional(),
  deviceType: z.enum(['mobile', 'tablet', 'desktop']).optional(),
});

/** Shared pagination query for admin list endpoints. */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(ANALYTICS_MAX_PAGE_SIZE)
    .default(ANALYTICS_PAGE_SIZE),
});

export type VisitorIngestInput = z.infer<typeof visitorIngestSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
