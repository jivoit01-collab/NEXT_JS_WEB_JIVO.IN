import { z } from 'zod';

/** Registration payload for an auth provider (icon validated loosely elsewhere). */
export const authProviderSchema = z.object({
  id: z.string().trim().min(1).max(40),
  name: z.string().trim().min(1).max(60),
  signInId: z.string().trim().min(1).max(40),
  enabled: z.boolean(),
  priority: z.number().int().min(0).max(9999),
  featureFlag: z.string().trim().max(60).optional(),
  supportedPlatforms: z.array(z.enum(['web', 'ios', 'android'])).optional(),
  permissions: z.array(z.string().trim().max(120)).max(50).optional(),
  futureCapabilities: z.array(z.string().trim().max(60)).max(30).optional(),
  description: z.string().trim().max(160).optional(),
});

/** Registration payload for a future auth capability. */
export const authCapabilitySchema = z.object({
  id: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(80),
  enabled: z.boolean(),
  featureFlag: z.string().trim().max(60).optional(),
  dependencies: z.array(z.string().trim().max(50)).max(30).optional(),
  description: z.string().trim().max(200).optional(),
});

/** Client-generated visitor id (matches the Core public identifier regex). */
export const visitorIdSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_-]{8,64}$/, 'invalid visitor id');

/** Partial profile update. All fields optional; JSON bags are size-bounded upstream. */
export const profileUpdateSchema = z.object({
  avatarUrl: z.string().trim().url().max(500).optional(),
  language: z.string().trim().max(20).optional(),
  timezone: z.string().trim().max(60).optional(),
  marketingOptIn: z.boolean().optional(),
  notificationPrefs: z.record(z.string(), z.unknown()).optional(),
  privacyPrefs: z.record(z.string(), z.unknown()).optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
