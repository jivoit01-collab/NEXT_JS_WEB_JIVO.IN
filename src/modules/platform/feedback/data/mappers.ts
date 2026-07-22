import 'server-only';
import type { Feedback } from '@prisma/client';
import type { FeedbackDTO } from '../types';

/** Map a Prisma Feedback row → the admin-facing DTO (dates → ISO). */
export function toFeedbackDTO(f: Feedback): FeedbackDTO {
  return {
    id: f.id,
    visitorId: f.visitorId,
    userId: f.userId,
    sessionId: f.sessionId,
    type: f.type,
    source: f.source,
    entityType: f.entityType,
    entityId: f.entityId,
    pageUrl: f.pageUrl,
    pageTitle: f.pageTitle,
    rating: f.rating,
    sentiment: f.sentiment,
    title: f.title,
    message: f.message,
    metadata: (f.metadata as Record<string, unknown> | null) ?? null,
    status: f.status,
    priority: f.priority,
    assignedTo: f.assignedTo,
    response: f.response,
    respondedAt: f.respondedAt ? f.respondedAt.toISOString() : null,
    resolvedAt: f.resolvedAt ? f.resolvedAt.toISOString() : null,
    deviceType: f.deviceType,
    browser: f.browser,
    language: f.language,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  };
}
