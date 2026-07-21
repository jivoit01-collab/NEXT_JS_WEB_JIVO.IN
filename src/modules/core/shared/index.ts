// Core analytics — shared barrel (constants, security, device, http, auth, types)

export {
  COOKIE_CONSENT_VERSION,
  ANALYTICS_WRITE_LIMIT,
  ANALYTICS_WINDOW_MS,
  MAX_EVENT_BATCH,
  ANALYTICS_PAGE_SIZE,
  ANALYTICS_MAX_PAGE_SIZE,
  BOUNCE_EVENT_THRESHOLD,
} from './constants';

export { hashIp, hashedClientIp, rateLimitKey } from './security';
export { parseUserAgent, normalizeDeviceType, type ParsedUserAgent } from './device';
export {
  getRequestContext,
  apiOk,
  apiError,
  apiValidationError,
  enforceAnalyticsRateLimit,
} from './http';
export { requireAdminGuard } from './auth';
export type { AnalyticsApiResponse, Paginated, RequestContext } from './types';
