import { z } from 'zod';

export const ourFairShareHeroSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().optional().default(''),
});

export const ourFairShareHealthcareSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  paragraph1: z.string().min(1, 'First paragraph is required'),
  paragraph2: z.string().min(1, 'Second paragraph is required'),
  image: z.string().optional().default(''),
});

export const ourFairShareWomenSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().optional().default(''),
});

export const ourFairShareSectionSchemas = {
  hero: ourFairShareHeroSchema,
  healthcare: ourFairShareHealthcareSchema,
  women: ourFairShareWomenSchema,
} as const;

export type OurFairShareHeroSchema = z.infer<typeof ourFairShareHeroSchema>;
export type OurFairShareHealthcareSchema = z.infer<typeof ourFairShareHealthcareSchema>;
export type OurFairShareWomenSchema = z.infer<typeof ourFairShareWomenSchema>;
