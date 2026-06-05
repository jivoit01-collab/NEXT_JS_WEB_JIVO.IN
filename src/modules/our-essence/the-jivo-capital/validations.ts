import { z } from 'zod';

export const theJivoCapitalHeroSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().optional().default(''),
});

export const theJivoCapitalPlantSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().optional().default(''),
  align: z.enum(['left', 'right']).default('left'),
});

export const theJivoCapitalSectionSchemas = {
  hero: theJivoCapitalHeroSchema,
  oilPlant: theJivoCapitalPlantSchema,
  waterPlant: theJivoCapitalPlantSchema,
} as const;

export type TheJivoCapitalHeroSchema = z.infer<typeof theJivoCapitalHeroSchema>;
export type TheJivoCapitalPlantSchema = z.infer<typeof theJivoCapitalPlantSchema>;
