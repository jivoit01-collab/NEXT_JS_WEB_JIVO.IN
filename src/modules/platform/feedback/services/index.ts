import 'server-only';
import type { Prisma } from '@prisma/client';
import { platformEvents } from '@/modules/core/events';
import { parseUserAgent } from '@/modules/core/shared';
import {
  createFeedback,
  updateFeedback,
  changeFeedbackStatus,
  softDeleteFeedback,
} from '../data';
import { deriveSentiment } from '../utils';
import { FEEDBACK_EVENTS, type FeedbackDTO, type FeedbackStatus } from '../types';
import type { CreateFeedbackInputParsed, UpdateFeedbackInputParsed } from '../validations';

interface SubmitContext {
  userId: string | null;
  userAgent: string | null;
  acceptLanguage: string | null;
}

/**
 * The one place feedback is created. Reuses the Core identity (visitor/session
 * ids from the client, userId from the session) + Core UA parsing, derives
 * sentiment, and publishes FEEDBACK_CREATED. No duplicate identity/tracking.
 */
export async function submitFeedback(
  input: CreateFeedbackInputParsed,
  ctx: SubmitContext,
): Promise<FeedbackDTO> {
  const ua = parseUserAgent(ctx.userAgent);
  const rating = input.rating ?? null;
  const type = input.type ?? 'GENERAL';

  const dto = await createFeedback({
    type,
    source: input.source ?? 'WEBSITE',
    entityType: input.entityType,
    entityId: input.entityId,
    pageUrl: input.pageUrl,
    pageTitle: input.pageTitle,
    rating: rating ?? undefined,
    sentiment: deriveSentiment(rating, type) ?? undefined,
    title: input.title,
    message: input.message,
    metadata: input.metadata ? (input.metadata as unknown as Prisma.InputJsonValue) : undefined,
    visitorId: input.visitorId,
    sessionId: input.sessionId,
    userId: ctx.userId ?? undefined,
    deviceType: ua.deviceType ? ua.deviceType.toLowerCase() : undefined,
    browser: ua.browser ?? undefined,
    language: input.language ?? ctx.acceptLanguage?.split(',')[0]?.trim(),
  });

  platformEvents.emit(FEEDBACK_EVENTS.CREATED, {
    id: dto.id,
    type: dto.type,
    rating: dto.rating,
    sentiment: dto.sentiment,
  });
  return dto;
}

/** Admin: patch a record (status/priority/assignment/response). */
export async function editFeedback(
  id: string,
  input: UpdateFeedbackInputParsed,
  now: Date,
): Promise<FeedbackDTO | null> {
  const data: Prisma.FeedbackUpdateInput = { ...input };
  if (input.response) data.respondedAt = now;
  if (input.status === 'RESOLVED') data.resolvedAt = now;
  const dto = await updateFeedback(id, data);
  if (dto) {
    platformEvents.emit(FEEDBACK_EVENTS.UPDATED, { id: dto.id, status: dto.status });
    if (dto.status === 'RESOLVED') platformEvents.emit(FEEDBACK_EVENTS.RESOLVED, { id: dto.id });
  }
  return dto;
}

/** Admin: change status only. */
export async function resolveFeedbackStatus(
  id: string,
  status: FeedbackStatus,
  now: Date,
): Promise<FeedbackDTO | null> {
  const dto = await changeFeedbackStatus(id, status, now);
  if (dto) {
    platformEvents.emit(FEEDBACK_EVENTS.UPDATED, { id: dto.id, status: dto.status });
    if (status === 'RESOLVED') platformEvents.emit(FEEDBACK_EVENTS.RESOLVED, { id: dto.id });
  }
  return dto;
}

/** Admin: soft delete. */
export async function removeFeedback(id: string, now: Date): Promise<boolean> {
  const ok = await softDeleteFeedback(id, now);
  if (ok) platformEvents.emit(FEEDBACK_EVENTS.DELETED, { id });
  return ok;
}
