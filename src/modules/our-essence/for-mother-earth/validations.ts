import { z } from 'zod';

export const forMotherEarthHeroSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  quote: z.string().min(1, 'Quote is required'),
  quoteAuthor: z.string().min(1, 'Quote author is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().optional().default(''),
});

export const forMotherEarthCleanTreeSchema = z.object({
  image: z.string().optional().default(''),
  cleanTitle: z.string().min(1, 'Clean village heading is required'),
  cleanDescription: z.string().min(1, 'Clean village description is required'),
  treeTitle: z.string().min(1, 'Tree plantation heading is required'),
  treeDescription: z.string().min(1, 'Tree plantation description is required'),
});

export const forMotherEarthDisasterSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().optional().default(''),
});

export const forMotherEarthSectionSchemas = {
  hero: forMotherEarthHeroSchema,
  cleanTree: forMotherEarthCleanTreeSchema,
  disaster: forMotherEarthDisasterSchema,
} as const;

export type ForMotherEarthHeroSchema = z.infer<typeof forMotherEarthHeroSchema>;
export type ForMotherEarthCleanTreeSchema = z.infer<typeof forMotherEarthCleanTreeSchema>;
export type ForMotherEarthDisasterSchema = z.infer<typeof forMotherEarthDisasterSchema>;
