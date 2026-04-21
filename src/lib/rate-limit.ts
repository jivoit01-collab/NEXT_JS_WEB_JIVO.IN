import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis';

function createRateLimiter(prefix: string, requests: number, window: string) {
  if (!redis) {
    return {
      limit: async () => ({ success: true, limit: requests, remaining: requests, reset: 0 }),
    };
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window as `${number} ${'s' | 'm' | 'h' | 'd'}`),
    prefix: `ratelimit:${prefix}`,
  });
}

export const rateLimit = {
  // Login brute-force: 5 attempts per 15 min per IP
  auth: createRateLimiter('auth', 5, '15 m'),
  contact: createRateLimiter('contact', 3, '1 m'),
  payment: createRateLimiter('payment', 10, '1 m'),
  general: createRateLimiter('general', 60, '1 m'),
  // Admin API mutations: 60 per min per IP
  admin: createRateLimiter('admin', 60, '1 m'),
  // File upload: 10 per min per IP
  upload: createRateLimiter('upload', 10, '1 m'),
};
