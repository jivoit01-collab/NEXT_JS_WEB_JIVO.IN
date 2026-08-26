import { z } from 'zod';

const imageField = z.string().default('');

export const privacyHeroSchema = z.object({
  logoImage: imageField,
  heading: z.string().min(1, 'Heading is required'),
  intro: z.string().min(1, 'Intro is required'),
  image: imageField,
});

export const privacyBlockSchema = z.object({
  heading: z.string().min(1, 'Block heading is required'),
  body: z.string().min(1, 'Block body is required'),
});

export const privacyBodySchema = z.object({
  blocks: z.array(privacyBlockSchema).min(1, 'At least one block required'),
});

export const privacyPolicySectionSchemas = {
  hero: privacyHeroSchema,
  body: privacyBodySchema,
} as const;

export type PrivacyHeroSchema = z.infer<typeof privacyHeroSchema>;
export type PrivacyBodySchema = z.infer<typeof privacyBodySchema>;
