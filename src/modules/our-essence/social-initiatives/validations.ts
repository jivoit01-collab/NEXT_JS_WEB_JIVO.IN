import { z } from 'zod';

export const socialInitiativesHeroSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
  image: z.string().optional().default(''),
  alignmentTitle: z.string().min(1, 'Alignment title is required'),
  alignmentDescription: z.string().min(1, 'Alignment description is required'),
  goalTitle: z.string().min(1, 'Goal title is required'),
  goalDescription: z.string().min(1, 'Goal description is required'),
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

export const socialInitiativesSectionSchemas = {
  hero: socialInitiativesHeroSchema,
  responsibilities: socialInitiativesSplitSchema,
  educate: socialInitiativesEducateSchema,
} as const;

export type SocialInitiativesHeroSchema = z.infer<typeof socialInitiativesHeroSchema>;
export type SocialInitiativesSplitSchema = z.infer<typeof socialInitiativesSplitSchema>;
export type SocialInitiativesEducateSchema = z.infer<typeof socialInitiativesEducateSchema>;
