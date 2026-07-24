import { z } from 'zod';

/**
 * Validates a module registration payload. `icon` is a React component
 * (validated loosely as a function/object) — the rest are strict so a
 * mis-registered module fails fast in development.
 */
export const analyticsModuleSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'id must be kebab-case (a-z, 0-9, -)'),
  name: z.string().trim().min(1).max(80),
  route: z.string().trim().startsWith('/jivo-dev/analytics'),
  category: z.enum(['overview', 'cms', 'audience', 'reports', 'business']),
  description: z.string().trim().max(200).optional(),
  order: z.number().int().min(0).max(9999).optional(),
  sections: z.array(z.string().trim().min(1).max(60)).max(24).optional(),
  widgets: z.array(z.string().trim().min(1).max(60)).max(40).optional(),
});

/** UI-only date-range presets. */
export const dateRangeSchema = z.enum(['today', '7d', '30d', '90d', 'ytd', 'all', 'custom']);

export type AnalyticsModuleInput = z.infer<typeof analyticsModuleSchema>;
