import { z } from 'zod';
import { CookieCategory, CookieConsentStatus } from '@prisma/client';
import { visitorIdSchema } from '../visitor/validations';

/** Cookie consent set/update payload (POST /api/analytics/cookie). */
export const cookieConsentSchema = z.object({
  visitorId: visitorIdSchema,
  status: z.nativeEnum(CookieConsentStatus),
  acceptedCategories: z.array(z.nativeEnum(CookieCategory)).max(4).default([]),
});

export type CookieConsentInput = z.infer<typeof cookieConsentSchema>;
