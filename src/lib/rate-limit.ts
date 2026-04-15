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
  auth: createRateLimiter('auth', 5, '1 m'),
  contact: createRateLimiter('contact', 3, '1 m'),
  payment: createRateLimiter('payment', 10, '1 m'),
  general: createRateLimiter('general', 60, '1 m'),
  admin: createRateLimiter('admin', 120, '1 m'),
};
