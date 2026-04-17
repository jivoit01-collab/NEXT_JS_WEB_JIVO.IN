import { z } from 'zod';

export const theStoryHeroSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  paragraph: z.string().min(1, 'Paragraph is required'),
  backgroundImage: z.string().min(1, 'Background image is required'),
});

export const theStoryFounderSchema = z.object({
  sectionHeading: z.string().min(1, 'Section heading is required'),
  title: z.string().min(1, 'Title is required'),
  paragraph: z.string().min(1, 'Paragraph is required'),
  founderImage: z.string().min(1, 'Founder image is required'),
});

export const theStoryVisionSchema = z.object({
  sectionHeading: z.string().min(1, 'Section heading is required'),
  title: z.string().min(1, 'Title is required'),
  leftColumn: z.string().min(1, 'Left column text is required'),
  rightColumn: z.string().min(1, 'Right column text is required'),
});

/** Map from section key → Zod schema for server-side validation. */
export const theStorySectionSchemas = {
  hero: theStoryHeroSchema,
  founder: theStoryFounderSchema,
  vision: theStoryVisionSchema,
} as const;

export type TheStoryHeroSchema = z.infer<typeof theStoryHeroSchema>;
export type TheStoryFounderSchema = z.infer<typeof theStoryFounderSchema>;
export type TheStoryVisionSchema = z.infer<typeof theStoryVisionSchema>;
