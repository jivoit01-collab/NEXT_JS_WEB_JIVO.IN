import { z } from 'zod';
import { AnalyticsEventType } from '@prisma/client';
import { ANALYTICS_MAX_PAGE_SIZE, ANALYTICS_PAGE_SIZE, MAX_EVENT_BATCH } from '../shared/constants';
import { visitorIdSchema } from '../visitor/validations';
import { sessionIdSchema } from '../session/validations';

/** A single analytics event (POST /api/analytics/events). */
export const analyticsEventSchema = z.object({
  eventType: z.nativeEnum(AnalyticsEventType),
  page: z.string().trim().max(500).optional(),
  entityType: z.string().trim().max(120).optional(),
  entityId: z.string().trim().max(200).optional(),
  /** Flexible JSON bag — validated as an object, capped in size by the body limit. */
  metadata: z.record(z.string(), z.unknown()).optional(),
  sessionId: sessionIdSchema.optional(),
  visitorId: visitorIdSchema.optional(),
  /** Optional client timestamp; the server clamps implausible values. */
  timestamp: z.coerce.date().optional(),
});

/** Accept either a single event or a bounded batch: `{ events: [...] }`. */
export const analyticsEventBatchSchema = z.union([
  analyticsEventSchema,
  z.object({
    events: z.array(analyticsEventSchema).min(1).max(MAX_EVENT_BATCH),
  }),
]);

/** Admin list filter + pagination (GET /api/analytics/events). */
export const eventFilterSchema = z.object({
  eventType: z.nativeEnum(AnalyticsEventType).optional(),
  pagePath: z.string().trim().max(500).optional(),
  entityType: z.string().trim().max(120).optional(),
  visitorId: visitorIdSchema.optional(),
  sessionId: sessionIdSchema.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(ANALYTICS_MAX_PAGE_SIZE).default(ANALYTICS_PAGE_SIZE),
});

export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;
export type AnalyticsEventBatchInput = z.infer<typeof analyticsEventBatchSchema>;
export type EventFilterInput = z.infer<typeof eventFilterSchema>;
