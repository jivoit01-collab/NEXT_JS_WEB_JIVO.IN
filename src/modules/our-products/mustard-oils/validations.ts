import { z } from 'zod';

/**
 * Image fields are optional: the section components render branded fallbacks
 * when a value is empty, so editors can save copy before art is uploaded.
 */
const imageField = z.string().default('');

export const mustardOilsHeroSchema = z.object({
  logoImage: imageField,
  heading: z.string().min(1, 'Heading is required'),
  subtitleLineOne: z.string().min(1, 'First subtitle line is required'),
  subtitleLineTwo: z.string().default(''),
  ctaLabel: z.string().min(1, 'CTA label is required'),
  ctaHref: z.string().min(1, 'CTA link is required'),
  productImage: imageField,
  productImageSecondary: imageField,
});

export const mustardProductVariantSchema = z.object({
  image: imageField,
  label: z.string().min(1, 'Label is required'),
  href: z.string().default(''),
});

export const mustardOilsRangeSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  variants: z.array(mustardProductVariantSchema).min(1, 'At least one variant required'),
});

export const mustardOilsExtractionSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  paragraph: z.string().min(1, 'Paragraph is required'),
  benefitsHeading: z.string().default(''),
  benefits: z.array(z.string().min(1)).min(1, 'At least one point required'),
  image: imageField,
});

export const mustardOilsWarmthSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  paragraph: z.string().min(1, 'Paragraph is required'),
  backgroundImage: imageField,
});

/** Map from section key → Zod schema for server-side validation. */
export const mustardOilsSectionSchemas = {
  hero: mustardOilsHeroSchema,
  range: mustardOilsRangeSchema,
  extraction: mustardOilsExtractionSchema,
  warmth: mustardOilsWarmthSchema,
} as const;

export type MustardOilsHeroSchema = z.infer<typeof mustardOilsHeroSchema>;
export type MustardOilsRangeSchema = z.infer<typeof mustardOilsRangeSchema>;
export type MustardOilsExtractionSchema = z.infer<typeof mustardOilsExtractionSchema>;
export type MustardOilsWarmthSchema = z.infer<typeof mustardOilsWarmthSchema>;
