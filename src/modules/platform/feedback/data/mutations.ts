import 'server-only';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { toFeedbackDTO } from './mappers';
import type { FeedbackDTO } from '../types';

/** Insert a feedback record. Returns the created DTO. */
export async function createFeedback(data: Prisma.FeedbackCreateInput): Promise<FeedbackDTO> {
  const row = await prisma.feedback.create({ data });
  return toFeedbackDTO(row);
}

/** Patch a feedback record (admin). Returns null if not found / deleted. */
export async function updateFeedback(
  id: string,
  data: Prisma.FeedbackUpdateInput,
): Promise<FeedbackDTO | null> {
  const existing = await prisma.feedback.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;
  const row = await prisma.feedback.update({ where: { id }, data });
  return toFeedbackDTO(row);
}

/** Change status; stamps resolvedAt when moving to RESOLVED. */
export async function changeFeedbackStatus(
  id: string,
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'SPAM',
  now: Date,
): Promise<FeedbackDTO | null> {
  const existing = await prisma.feedback.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;
  const row = await prisma.feedback.update({
    where: { id },
    data: { status, resolvedAt: status === 'RESOLVED' ? now : existing.resolvedAt },
  });
  return toFeedbackDTO(row);
}

/** Soft delete (keeps analytics history). Returns true if a row was affected. */
export async function softDeleteFeedback(id: string, now: Date): Promise<boolean> {
  const res = await prisma.feedback.updateMany({
    where: { id, deletedAt: null },
    data: { deletedAt: now },
  });
  return res.count > 0;
}
