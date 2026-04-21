/**
 * Project-wide rate limiter — backed by the in-memory local limiter.
 * No external services required.
 *
 * Re-exports the localRateLimit presets so any code that previously
 * imported from this file continues to work unchanged.
 */
export { localRateLimit as rateLimit } from '@/lib/rate-limit-local';
