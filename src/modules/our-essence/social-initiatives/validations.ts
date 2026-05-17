import { z } from 'zod';

export const socialInitiativesHeroSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
  image: z.string().optional().default(''),
});

export const socialInitiativesSplitSchema = z.object({
  backgroundImage: z.string().optional().default(''),
  leftTitle: z.string().min(1, 'Left title is required'),
  leftDescription: z.string().min(1, 'Left description is required'),
  rightTitle: z.string().min(1, 'Right title is required'),
  rightDescription: z.string().min(1, 'Right description is required'),
});

export const socialInitiativesEducateSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  paragraph: z.string().min(1, 'Paragraph is required'),
  image: z.string().optional().default(''),
});

export const socialInitiativesCtaSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  primaryLabel: z.string().min(1, 'Primary button label is required'),
  primaryHref: z.string().min(1, 'Primary button link is required'),
  secondaryLabel: z.string().min(1, 'Secondary button label is required'),
  secondaryHref: z.string().min(1, 'Secondary button link is required'),
  backgroundImage: z.string().optional().default(''),
});

export const socialInitiativesSectionSchemas = {
  hero: socialInitiativesHeroSchema,
  alignment: socialInitiativesSplitSchema,
  responsibilities: socialInitiativesSplitSchema,
  educate: socialInitiativesEducateSchema,
  cta: socialInitiativesCtaSchema,
} as const;

export type SocialInitiativesHeroSchema = z.infer<typeof socialInitiativesHeroSchema>;
export type SocialInitiativesSplitSchema = z.infer<typeof socialInitiativesSplitSchema>;
export type SocialInitiativesEducateSchema = z.infer<typeof socialInitiativesEducateSchema>;
export type SocialInitiativesCtaSchema = z.infer<typeof socialInitiativesCtaSchema>;
