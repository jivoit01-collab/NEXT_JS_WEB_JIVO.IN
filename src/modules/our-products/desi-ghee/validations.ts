import { z } from 'zod';

/**
 * Image fields are optional: the section components render branded fallbacks
 * when a value is empty, so editors can save copy before art is uploaded.
 */
const imageField = z.string().default('');

export const desiGheeHeroSchema = z.object({
  logoImage: imageField,
  heading: z.string().min(1, 'Heading is required'),
  subtitleLineOne: z.string().min(1, 'First subtitle line is required'),
  subtitleLineTwo: z.string().default(''),
  ctaLabel: z.string().min(1, 'CTA label is required'),
  ctaHref: z.string().min(1, 'CTA link is required'),
  productImage: imageField,
  productImageSecondary: imageField,
});

export const desiGheeVariantSchema = z.object({
  image: imageField,
  label: z.string().min(1, 'Label is required'),
  href: z.string().default(''),
});

export const desiGheeRangeSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  variants: z.array(desiGheeVariantSchema).min(1, 'At least one variant required'),
});

export const desiGheeHighlightSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  description: z.string().default(''),
});

export const desiGheeHighlightsSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  highlights: z.array(desiGheeHighlightSchema).min(1, 'At least one highlight required'),
  backgroundImage: imageField,
});

export const desiGheeBilonaSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  paragraph: z.string().min(1, 'Paragraph is required'),
  backgroundImage: imageField,
});

/** Map from section key → Zod schema for server-side validation. */
export const desiGheeSectionSchemas = {
  hero: desiGheeHeroSchema,
  range: desiGheeRangeSchema,
  keyHighlights: desiGheeHighlightsSchema,
  bilona: desiGheeBilonaSchema,
} as const;

export type DesiGheeHeroSchema = z.infer<typeof desiGheeHeroSchema>;
export type DesiGheeRangeSchema = z.infer<typeof desiGheeRangeSchema>;
export type DesiGheeHighlightsSchema = z.infer<typeof desiGheeHighlightsSchema>;
export type DesiGheeBilonaSchema = z.infer<typeof desiGheeBilonaSchema>;
