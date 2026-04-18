import { z } from 'zod';

export const coreValueBlockSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  description: z.string().min(1, 'Description is required'),
});

export const coreValuesHeroSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
  paragraph: z.string().min(1, 'Paragraph is required'),
  backgroundImage: z.string().min(1, 'Background image is required'),
});

export const coreValuesFoundationSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  backgroundImage: z.string().min(1, 'Background image is required'),
  blocks: z.array(coreValueBlockSchema).min(2, 'At least two blocks required'),
});

export const coreValuesPrinciplesSchema = z.object({
  backgroundImage: z.string().min(1, 'Background image is required'),
  blocks: z.array(coreValueBlockSchema).min(3, 'At least three blocks required'),
});

/** Map from section key → Zod schema for server-side validation. */
export const coreValuesSectionSchemas = {
  hero: coreValuesHeroSchema,
  foundation: coreValuesFoundationSchema,
  principles: coreValuesPrinciplesSchema,
} as const;

export type CoreValuesHeroSchema = z.infer<typeof coreValuesHeroSchema>;
export type CoreValuesFoundationSchema = z.infer<typeof coreValuesFoundationSchema>;
export type CoreValuesPrinciplesSchema = z.infer<typeof coreValuesPrinciplesSchema>;
