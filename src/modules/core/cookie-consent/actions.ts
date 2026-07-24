/**
 * Reusable server actions for cookie consent.
 *
 * NO new endpoints or write paths are introduced — consent is recorded through
 * Phase 1's public `POST /api/analytics/cookie`. These admin-guarded reads are
 * re-exported from the Phase 1 `cookie` module so a future admin dashboard can
 * import everything consent-related from this single module.
 */

export { getConsentAction, listConsentsAction } from '@/modules/core/cookie';
export type { CookieConsentDTO } from '@/modules/core/cookie';
