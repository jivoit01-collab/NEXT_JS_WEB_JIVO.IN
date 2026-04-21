import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis';
import { checkLimit, type LimitResult } from '@/lib/rate-limit-local';

/**
 * Unified rate limiter.
 *
 * • Upstash Redis configured  → sliding-window via Upstash (multi-instance safe)
 * • Upstash NOT configured    → in-memory fixed-window via localRateLimit
 *
 * Both return the same { success, remaining, retryAfter } shape so callers
 * don't need to care which backend is active.
 */

interface UnifiedResult {
  success: boolean;
  remaining: number;
  retryAfter: number;
}

type Limiter = { limit: (key: string) => Promise<UnifiedResult> };

function createLimiter(
  prefix: string,
  requests: number,
  upstashWindow: `${number} ${'s' | 'm' | 'h' | 'd'}`,
  localWindowMs: number,
): Limiter {
  if (redis) {
    // Upstash sliding-window (best for multi-server deployments)
    const rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requests, upstashWindow),
      prefix: `ratelimit:${prefix}`,
    });

    return {
      limit: async (key: string): Promise<UnifiedResult> => {
        const r = await rl.limit(key);
        return {
          success: r.success,
          remaining: r.remaining,
          retryAfter: r.success ? 0 : Math.ceil((r.reset - Date.now()) / 1000),
        };
      },
    };
  }

  // No Redis — fall back to in-memory fixed-window (single-server safe)
  return {
    limit: async (key: string): Promise<UnifiedResult> => {
      const r: LimitResult = checkLimit(`${prefix}:${key}`, requests, localWindowMs);
      return { success: r.allowed, remaining: r.remaining, retryAfter: r.retryAfter };
    },
  };
}

export const rateLimit = {
  auth:    createLimiter('auth',    5,   '15 m', 15 * 60 * 1000),
  contact: createLimiter('contact', 3,   '1 m',  60 * 1000),
  payment: createLimiter('payment', 10,  '1 m',  60 * 1000),
  general: createLimiter('general', 120, '1 m',  60 * 1000),
  admin:   createLimiter('admin',   60,  '1 m',  60 * 1000),
  upload:  createLimiter('upload',  10,  '1 m',  60 * 1000),
};
