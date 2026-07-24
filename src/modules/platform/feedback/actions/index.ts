'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { requireAdminGuard } from '@/modules/core/shared';
import { getClientIpFromHeaders } from '@/lib/admin-ip';
import { checkLimit } from '@/lib/rate-limit-local';
import {
  createFeedbackSchema,
  updateFeedbackSchema,
  feedbackFilterSchema,
} from '../validations';
import { FEEDBACK_CONFIG } from '../config';
import { submitFeedback, editFeedback, resolveFeedbackStatus, removeFeedback } from '../services';
import { getFeedbackById, listFeedback } from '../data';
import type { FeedbackStatus } from '../types';

type Result<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/** PUBLIC: submit feedback. Rate-limited, validated, identity-aware. */
export async function createFeedbackAction(input: unknown): Promise<Result<{ id: string }>> {
  const h = await headers();
  const ip = getClientIpFromHeaders(h) ?? 'unknown';
  const limit = checkLimit(`feedback:${ip}`, FEEDBACK_CONFIG.submitLimit, FEEDBACK_CONFIG.submitWindowMs);
  if (!limit.allowed) return { success: false, error: 'Too many submissions. Please try again shortly.' };

  const parsed = createFeedbackSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please check your input.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  if (!parsed.data.message && !parsed.data.rating) {
    return { success: false, error: 'Add a rating or a message.' };
  }

  try {
    const session = await auth();
    const dto = await submitFeedback(parsed.data, {
      userId: session?.user?.id ?? null,
      userAgent: h.get('user-agent'),
      acceptLanguage: h.get('accept-language'),
    });
    return { success: true, data: { id: dto.id } };
  } catch (err) {
    console.error('[feedback.create]', err);
    return { success: false, error: 'Could not submit feedback. Please try again.' };
  }
}

// ── Admin (guarded) ──────────────────────────────────────────
export async function getFeedbackAction(id: string) {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  const data = await getFeedbackById(id);
  return data ? { success: true as const, data } : { success: false as const, error: 'Not found' };
}

export async function listFeedbackAction(input?: Record<string, unknown>) {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  const parsed = feedbackFilterSchema.safeParse(input ?? {});
  if (!parsed.success) return { success: false as const, error: 'Invalid filter' };
  const { page, pageSize, ...filter } = parsed.data;
  try {
    return { success: true as const, data: await listFeedback(filter, page, pageSize) };
  } catch (err) {
    console.error('[feedback.list]', err);
    return { success: false as const, error: 'Failed to load feedback' };
  }
}

export async function updateFeedbackAction(id: string, input: unknown): Promise<Result> {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  const parsed = updateFeedbackSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: 'Invalid update' };
  const dto = await editFeedback(id, parsed.data, new Date());
  return dto ? { success: true } : { success: false, error: 'Not found' };
}

export async function changeStatusAction(id: string, status: FeedbackStatus): Promise<Result> {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  const dto = await resolveFeedbackStatus(id, status, new Date());
  return dto ? { success: true } : { success: false, error: 'Not found' };
}

export async function deleteFeedbackAction(id: string): Promise<Result> {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  const ok = await removeFeedback(id, new Date());
  return ok ? { success: true } : { success: false, error: 'Not found' };
}
