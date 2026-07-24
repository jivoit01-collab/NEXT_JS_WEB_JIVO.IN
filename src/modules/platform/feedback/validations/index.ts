import { z } from 'zod';
import {
  FEEDBACK_TYPES,
  FEEDBACK_SOURCES,
  FEEDBACK_ENTITY_TYPES,
  FEEDBACK_STATUSES,
  FEEDBACK_PRIORITIES,
} from '../types';

const idLike = z.string().trim().regex(/^[A-Za-z0-9_-]{8,64}$/);

/** Public feedback submission (identity/hints added server-side). */
export const createFeedbackSchema = z.object({
  type: z.enum(FEEDBACK_TYPES).optional(),
  source: z.enum(FEEDBACK_SOURCES).optional(),
  entityType: z.enum(FEEDBACK_ENTITY_TYPES).optional(),
  entityId: z.string().trim().max(200).optional(),
  pageUrl: z.string().trim().max(500).optional(),
  pageTitle: z.string().trim().max(300).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  title: z.string().trim().max(200).optional(),
  message: z.string().trim().max(5000).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  visitorId: idLike.optional(),
  sessionId: idLike.optional(),
  language: z.string().trim().max(20).optional(),
});

/** Admin update (status/priority/assignment/response). */
export const updateFeedbackSchema = z.object({
  status: z.enum(FEEDBACK_STATUSES).optional(),
  priority: z.enum(FEEDBACK_PRIORITIES).optional(),
  assignedTo: z.string().trim().max(120).optional(),
  response: z.string().trim().max(5000).optional(),
});

/** Admin list filter. */
export const feedbackFilterSchema = z.object({
  type: z.enum(FEEDBACK_TYPES).optional(),
  status: z.enum(FEEDBACK_STATUSES).optional(),
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).optional(),
  entityType: z.enum(FEEDBACK_ENTITY_TYPES).optional(),
  entityId: z.string().trim().max(200).optional(),
  visitorId: idLike.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
});

export type CreateFeedbackInputParsed = z.infer<typeof createFeedbackSchema>;
export type UpdateFeedbackInputParsed = z.infer<typeof updateFeedbackSchema>;
export type FeedbackFilterParsed = z.infer<typeof feedbackFilterSchema>;
