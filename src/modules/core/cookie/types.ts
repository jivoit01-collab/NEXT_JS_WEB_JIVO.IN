import type { CookieCategory, CookieConsentStatus } from '@prisma/client';

/** Public-safe cookie-consent projection — excludes internal `id`. */
export interface CookieConsentDTO {
  visitorId: string;
  status: CookieConsentStatus;
  acceptedCategories: CookieCategory[];
  version: string;
  acceptedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
