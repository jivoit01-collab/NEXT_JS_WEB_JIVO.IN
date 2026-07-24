import { prisma } from '@/lib/db';
import { CookieConsentStatus } from '@prisma/client';
import { COOKIE_CONSENT_VERSION } from '../../shared/constants';
import { ensureVisitorExists } from '../../visitor/data';
import type { RequestContext } from '../../shared/types';
import type { CookieConsentInput } from '../validations';
import type { CookieConsentDTO } from '../types';

const consentPublicSelect = {
  visitorId: true,
  status: true,
  acceptedCategories: true,
  version: true,
  acceptedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** Create-or-update the single consent record for a visitor. */
export async function upsertConsent(input: CookieConsentInput): Promise<CookieConsentDTO> {
  const decided = input.status !== CookieConsentStatus.UNKNOWN;
  const acceptedAt = decided ? new Date() : null;

  return prisma.cookieConsent.upsert({
    where: { visitorId: input.visitorId },
    create: {
      visitorId: input.visitorId,
      status: input.status,
      acceptedCategories: input.acceptedCategories,
      version: COOKIE_CONSENT_VERSION,
      acceptedAt,
    },
    update: {
      status: input.status,
      acceptedCategories: input.acceptedCategories,
      version: COOKIE_CONSENT_VERSION,
      acceptedAt,
    },
    select: consentPublicSelect,
  });
}

/** Public ingest entry point — ensures the visitor exists, then upserts consent. */
export async function ingestConsent(
  input: CookieConsentInput,
  ctx: RequestContext,
): Promise<CookieConsentDTO> {
  await ensureVisitorExists(input.visitorId, ctx);
  return upsertConsent(input);
}
