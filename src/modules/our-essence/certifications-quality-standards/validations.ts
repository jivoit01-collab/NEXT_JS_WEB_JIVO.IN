import { z } from 'zod';

export const certificationBadgeSchema = z.object({
  image: z.string().min(1, 'Badge image is required'),
  label: z.string().min(1, 'Badge label is required'),
});

export const certificationsHeroSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  subheading: z.string().min(1, 'Subheading is required'),
  backgroundImage: z.string().min(1, 'Background image is required'),
});

export const certificationsBadgesSchema = z.object({
  items: z.array(certificationBadgeSchema).min(1, 'At least one badge is required'),
});

export const certificationsFeaturedSchema = z.object({
  enabled: z.boolean(),
  image: z.string(),
  label: z.string(),
});

/** Map from section key → Zod schema for server-side validation. */
export const certificationsSectionSchemas = {
  hero: certificationsHeroSchema,
  badges: certificationsBadgesSchema,
  featured: certificationsFeaturedSchema,
} as const;

export type CertificationsHeroSchema = z.infer<typeof certificationsHeroSchema>;
export type CertificationsBadgesSchema = z.infer<typeof certificationsBadgesSchema>;
export type CertificationsFeaturedSchema = z.infer<typeof certificationsFeaturedSchema>;
