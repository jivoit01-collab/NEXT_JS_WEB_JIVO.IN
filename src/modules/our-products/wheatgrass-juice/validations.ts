import { z } from 'zod';

/**
 * Image fields are optional: the section components render branded fallbacks
 * when a value is empty, so editors can save copy before art is uploaded.
 */
const imageField = z.string().default('');

export const wheatgrassHeroSchema = z.object({
  logoImage: imageField,
  heading: z.string().min(1, 'Heading is required'),
  subtitleLineOne: z.string().min(1, 'First subtitle line is required'),
  subtitleLineTwo: z.string().default(''),
  ctaLabel: z.string().min(1, 'CTA label is required'),
  ctaHref: z.string().min(1, 'CTA link is required'),
  // Exactly five bottles drive the hero fan; each may be empty (the
  // component falls back to the upload placeholder).
  bottles: z.array(z.string()).default([]),
});

export const wheatgrassVariantSchema = z.object({
  image: imageField,
  label: z.string().min(1, 'Label is required'),
  size: z.string().default(''),
  href: z.string().default(''),
});

export const wheatgrassRangeSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  variants: z.array(wheatgrassVariantSchema).min(1, 'At least one variant required'),
});

export const wheatgrassWellnessSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  paragraph: z.string().min(1, 'Paragraph is required'),
  image: imageField,
});

export const wheatgrassDifferenceSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  paragraph: z.string().min(1, 'Paragraph is required'),
  image: imageField,
});

export const wheatgrassHighlightSchema = z.object({
  image: imageField,
  label: z.string().min(1, 'Label is required'),
  description: z.string().default(''),
});

export const wheatgrassHighlightsSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  highlights: z.array(wheatgrassHighlightSchema).min(1, 'At least one highlight required'),
  backgroundImage: imageField,
});

/** Map from section key → Zod schema for server-side validation. */
export const wheatgrassSectionSchemas = {
  hero: wheatgrassHeroSchema,
  range: wheatgrassRangeSchema,
  wellness: wheatgrassWellnessSchema,
  difference: wheatgrassDifferenceSchema,
  highlights: wheatgrassHighlightsSchema,
} as const;

export type WheatgrassHeroSchema = z.infer<typeof wheatgrassHeroSchema>;
export type WheatgrassRangeSchema = z.infer<typeof wheatgrassRangeSchema>;
export type WheatgrassWellnessSchema = z.infer<typeof wheatgrassWellnessSchema>;
export type WheatgrassDifferenceSchema = z.infer<typeof wheatgrassDifferenceSchema>;
export type WheatgrassHighlightsSchema = z.infer<typeof wheatgrassHighlightsSchema>;
