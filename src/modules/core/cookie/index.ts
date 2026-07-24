// Core / Cookie consent module barrel

export { getConsentAction, listConsentsAction } from './actions';
export { getConsentByVisitorId, listConsents, upsertConsent, ingestConsent } from './data';
export { cookieConsentSchema, type CookieConsentInput } from './validations';
export type { CookieConsentDTO } from './types';
