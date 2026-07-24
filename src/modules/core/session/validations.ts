import { z } from 'zod';
import { visitorIdSchema } from '../visitor/validations';

/** Client-generated session identifier — same token shape as visitorId. */
export const sessionIdSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_-]{8,64}$/, 'Invalid sessionId');

/**
 * Session ingest (POST /api/analytics/session).
 *  - `end: false` (default) → start / touch the session.
 *  - `end: true`            → close it (server computes duration + bounce).
 */
export const sessionIngestSchema = z.object({
  sessionId: sessionIdSchema,
  visitorId: visitorIdSchema,
  entryPage: z.string().trim().max(500).optional(),
  exitPage: z.string().trim().max(500).optional(),
  end: z.boolean().optional().default(false),
  /** Optional client-measured duration (seconds); server falls back to computing it. */
  duration: z.coerce.number().int().min(0).max(86400).optional(),
});

export type SessionIngestInput = z.infer<typeof sessionIngestSchema>;
