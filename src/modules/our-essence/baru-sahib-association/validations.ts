import { z } from 'zod';

export const baruSahibAssociationHeroSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().optional().default(''),
});

export const baruSahibAssociationVideoSchema = z.object({
  video: z.string().optional().default(''),
});

export const baruSahibAssociationHumanitySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().optional().default(''),
});

export const baruSahibAssociationSectionSchemas = {
  hero: baruSahibAssociationHeroSchema,
  video: baruSahibAssociationVideoSchema,
  humanity: baruSahibAssociationHumanitySchema,
} as const;

export type BaruSahibAssociationHeroSchema = z.infer<typeof baruSahibAssociationHeroSchema>;
export type BaruSahibAssociationVideoSchema = z.infer<typeof baruSahibAssociationVideoSchema>;
export type BaruSahibAssociationHumanitySchema = z.infer<typeof baruSahibAssociationHumanitySchema>;
