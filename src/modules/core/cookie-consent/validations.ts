import { z } from 'zod';

/**
 * Client-side preference validation (the optional category toggles).
 * The authoritative server contract is Phase 1's `cookieConsentSchema`
 * (`@/modules/core/cookie`) — this module never defines a duplicate endpoint.
 */
export const categoryPreferencesSchema = z.object({
  ANALYTICS: z.boolean(),
  MARKETING: z.boolean(),
  PREFERENCES: z.boolean(),
});

/** Guards the shape read back from localStorage before we trust it. */
export const storedConsentSchema = z.object({
  visitorId: z.string().regex(/^[A-Za-z0-9_-]{8,64}$/),
  status: z.enum(['UNKNOWN', 'ACCEPTED', 'REJECTED', 'CUSTOMIZED']),
  categories: z.array(z.enum(['NECESSARY', 'ANALYTICS', 'MARKETING', 'PREFERENCES'])),
  version: z.string().min(1).max(20),
  updatedAt: z.string().min(1),
});

export type CategoryPreferencesInput = z.infer<typeof categoryPreferencesSchema>;
