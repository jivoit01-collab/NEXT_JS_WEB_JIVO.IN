import type { AnalyticsEventType, Prisma } from '@prisma/client';

/** Public-safe event projection — excludes the internal `id`. */
export interface AnalyticsEventDTO {
  eventType: AnalyticsEventType;
  page: string | null;
  entityType: string | null;
  entityId: string | null;
  metadata: Prisma.JsonValue | null;
  timestamp: Date;
  sessionId: string | null;
  visitorId: string | null;
  createdAt: Date;
}

/** Normalised filter passed to the events list query. */
export interface EventFilter {
  eventType?: AnalyticsEventType;
  pagePath?: string;
  entityType?: string;
  visitorId?: string;
  sessionId?: string;
  from?: Date;
  to?: Date;
}
