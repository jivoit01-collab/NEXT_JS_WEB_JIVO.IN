import { z } from 'zod';

const imageField = z.string().default('');

export const refinedGoldOilsHeroSchema = z.object({
  logoImage: imageField,
  heading: z.string().min(1, 'Heading is required'),
  subtitleLineOne: z.string().min(1, 'First subtitle line is required'),
  subtitleLineTwo: z.string().default(''),
  ctaLabel: z.string().min(1, 'CTA label is required'),
  ctaHref: z.string().min(1, 'CTA link is required'),
  productImage: imageField,
  productImageSecondary: imageField,
});

export const refinedGoldVariantSchema = z.object({
  image: imageField,
  label: z.string().min(1, 'Label is required'),
  href: z.string().default(''),
});

export const refinedGoldOilsRangeSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  variants: z.array(refinedGoldVariantSchema).min(1, 'At least one variant required'),
});

export const refinedGoldOilsHighlightsSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  highlights: z.array(z.string().min(1)).min(1, 'At least one highlight required'),
  benefitsHeading: z.string().default(''),
  benefits: z.array(z.string().min(1)).default([]),
  image: imageField,
});

export const refinedGoldOilsWhatIsSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  paragraph: z.string().min(1, 'Paragraph is required'),
  backgroundImage: imageField,
});

export const refinedGoldOilsSectionSchemas = {
  hero: refinedGoldOilsHeroSchema,
  range: refinedGoldOilsRangeSchema,
  keyHighlights: refinedGoldOilsHighlightsSchema,
  whatIsGold: refinedGoldOilsWhatIsSchema,
} as const;

export type RefinedGoldOilsHeroSchema = z.infer<typeof refinedGoldOilsHeroSchema>;
export type RefinedGoldOilsRangeSchema = z.infer<typeof refinedGoldOilsRangeSchema>;
export type RefinedGoldOilsHighlightsSchema = z.infer<typeof refinedGoldOilsHighlightsSchema>;
export type RefinedGoldOilsWhatIsSchema = z.infer<typeof refinedGoldOilsWhatIsSchema>;
