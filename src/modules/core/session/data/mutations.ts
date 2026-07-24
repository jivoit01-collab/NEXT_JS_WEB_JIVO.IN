import { prisma } from '@/lib/db';
import { BOUNCE_EVENT_THRESHOLD } from '../../shared/constants';
import { ensureVisitorExists } from '../../visitor/data';
import type { RequestContext } from '../../shared/types';
import type { SessionIngestInput } from '../validations';

/** Start (or idempotently touch) a session. Starting an existing one is a no-op. */
export async function startSession(input: SessionIngestInput): Promise<{ sessionId: string }> {
  return prisma.visitorSession.upsert({
    where: { sessionId: input.sessionId },
    create: {
      sessionId: input.sessionId,
      visitorId: input.visitorId,
      entryPage: input.entryPage ?? null,
      exitPage: input.exitPage ?? null,
      startedAt: new Date(),
      isBounce: true,
    },
    update: input.exitPage ? { exitPage: input.exitPage } : {},
    select: { sessionId: true },
  });
}

/**
 * Close a session: set endedAt, compute duration (client value or server delta)
 * and derive isBounce from the number of PAGE_VIEW events recorded.
 * If the "end" beacon arrives without a prior "start", a closed session is created.
 */
export async function endSession(input: SessionIngestInput): Promise<{ sessionId: string }> {
  const now = new Date();
  const existing = await prisma.visitorSession.findUnique({
    where: { sessionId: input.sessionId },
    select: { startedAt: true },
  });

  if (!existing) {
    await prisma.visitorSession.create({
      data: {
        sessionId: input.sessionId,
        visitorId: input.visitorId,
        startedAt: now,
        endedAt: now,
        duration: input.duration ?? 0,
        entryPage: input.entryPage ?? input.exitPage ?? null,
        exitPage: input.exitPage ?? null,
        isBounce: true,
      },
    });
    return { sessionId: input.sessionId };
  }

  const pageViews = await prisma.analyticsEvent.count({
    where: { sessionId: input.sessionId, eventType: 'PAGE_VIEW' },
  });
  const duration =
    input.duration ?? Math.max(0, Math.round((now.getTime() - existing.startedAt.getTime()) / 1000));

  await prisma.visitorSession.update({
    where: { sessionId: input.sessionId },
    data: {
      endedAt: now,
      duration,
      exitPage: input.exitPage ?? undefined,
      isBounce: pageViews <= BOUNCE_EVENT_THRESHOLD,
    },
  });
  return { sessionId: input.sessionId };
}

/** Public ingest entry point — ensures the visitor exists, then starts or ends. */
export async function ingestSession(
  input: SessionIngestInput,
  ctx: RequestContext,
): Promise<{ sessionId: string }> {
  await ensureVisitorExists(input.visitorId, ctx);
  return input.end ? endSession(input) : startSession(input);
}
