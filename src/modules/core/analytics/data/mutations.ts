import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import { ensureVisitorExists } from '../../visitor/data';
import type { RequestContext } from '../../shared/types';
import type { AnalyticsEventInput } from '../validations';

/** Reject client timestamps that are wildly off; fall back to server time. */
const MAX_CLOCK_SKEW_MS = 25 * 60 * 60 * 1000; // ~1 day

function clampTimestamp(candidate: Date | undefined, now: Date): Date {
  if (!candidate) return now;
  const delta = Math.abs(candidate.getTime() - now.getTime());
  return delta > MAX_CLOCK_SKEW_MS ? now : candidate;
}

/** Insert a single event (thin wrapper over the batch path). */
export async function createEvent(
  input: AnalyticsEventInput,
  ctx: RequestContext,
): Promise<number> {
  return ingestEvents([input], ctx);
}

/**
 * Insert a batch of events. FK integrity is guaranteed first:
 *  - every referenced visitor is ensured to exist;
 *  - every referenced session is ensured to exist (needs a visitorId);
 *  - a sessionId that still can't be resolved is stored as null (not a broken FK).
 * Returns the number of rows written.
 */
export async function ingestEvents(
  inputs: AnalyticsEventInput[],
  ctx: RequestContext,
): Promise<number> {
  if (inputs.length === 0) return 0;
  const now = new Date();

  // 1. Ensure referenced visitors exist (deduped).
  const visitorIds = [...new Set(inputs.map((e) => e.visitorId).filter((v): v is string => !!v))];
  await Promise.all(visitorIds.map((visitorId) => ensureVisitorExists(visitorId, ctx)));

  // 2. Ensure referenced sessions exist (only where we also have a visitorId).
  const sessionToVisitor = new Map<string, string>();
  for (const e of inputs) {
    if (e.sessionId && e.visitorId) sessionToVisitor.set(e.sessionId, e.visitorId);
  }
  await Promise.all(
    [...sessionToVisitor].map(([sessionId, visitorId]) =>
      prisma.visitorSession.upsert({
        where: { sessionId },
        create: { sessionId, visitorId, startedAt: now, isBounce: true },
        update: {},
        select: { sessionId: true },
      }),
    ),
  );
  const resolvableSessions = new Set(sessionToVisitor.keys());

  // 3. Build rows — drop any sessionId we couldn't guarantee (avoids FK errors).
  const data: Prisma.AnalyticsEventCreateManyInput[] = inputs.map((e) => ({
    eventType: e.eventType,
    page: e.page ?? null,
    entityType: e.entityType ?? null,
    entityId: e.entityId ?? null,
    metadata: e.metadata ? (e.metadata as unknown as Prisma.InputJsonValue) : undefined,
    timestamp: clampTimestamp(e.timestamp, now),
    sessionId: e.sessionId && resolvableSessions.has(e.sessionId) ? e.sessionId : null,
    visitorId: e.visitorId ?? null,
  }));

  const result = await prisma.analyticsEvent.createMany({ data });
  return result.count;
}
