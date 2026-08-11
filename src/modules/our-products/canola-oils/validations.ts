import { z } from 'zod';

/**
 * Image fields are optional: the section components render branded fallbacks
 * when a value is empty, so editors can save copy before art is uploaded.
 */
const imageField = z.string().default('');

export const canolaOilsHeroSchema = z.object({
  logoImage: imageField,
  heading: z.string().min(1, 'Heading is required'),
  subtitleLineOne: z.string().min(1, 'First subtitle line is required'),
  subtitleLineTwo: z.string().default(''),
  ctaLabel: z.string().min(1, 'CTA label is required'),
  ctaHref: z.string().min(1, 'CTA link is required'),
  productImage: imageField,
  productImageSecondary: imageField,
});

export const canolaProductVariantSchema = z.object({
  image: imageField,
  label: z.string().min(1, 'Label is required'),
  href: z.string().default(''),
});

export const canolaOilsRangeSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  variants: z.array(canolaProductVariantSchema).min(1, 'At least one variant required'),
});

export const canolaFeatureSchema = z.object({
  icon: z.string().min(1, 'Icon is required'),
  label: z.string().min(1, 'Label is required'),
  description: z.string().default(''),
});

export const canolaOilsWhatIsSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  paragraphLeft: z.string().min(1, 'Left paragraph is required'),
  paragraphRight: z.string().default(''),
  features: z.array(canolaFeatureSchema).min(1, 'At least one feature required'),
});

export const canolaOilsScienceSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  intro: z.string().min(1, 'Intro is required'),
  subheading: z.string().default(''),
  points: z.array(z.string().min(1)).min(1, 'At least one point required'),
  closingLine: z.string().default(''),
  backgroundImage: imageField,
});

export const canolaOilsColdPressedSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  leadLineOne: z.string().min(1, 'First lead line is required'),
  leadLineTwo: z.string().default(''),
  paragraph: z.string().default(''),
  coldPressedTitle: z.string().min(1, 'Cold-pressed title is required'),
  coldPressedPoints: z.array(z.string().min(1)).min(1, 'At least one point required'),
  refinedTitle: z.string().min(1, 'Refined title is required'),
  refinedPoints: z.array(z.string().min(1)).min(1, 'At least one point required'),
});

/** Map from section key → Zod schema for server-side validation. */
export const canolaOilsSectionSchemas = {
  hero: canolaOilsHeroSchema,
  range: canolaOilsRangeSchema,
  whatIsCanola: canolaOilsWhatIsSchema,
  science: canolaOilsScienceSchema,
  coldPressed: canolaOilsColdPressedSchema,
} as const;

export type CanolaOilsHeroSchema = z.infer<typeof canolaOilsHeroSchema>;
export type CanolaOilsRangeSchema = z.infer<typeof canolaOilsRangeSchema>;
export type CanolaOilsWhatIsSchema = z.infer<typeof canolaOilsWhatIsSchema>;
export type CanolaOilsScienceSchema = z.infer<typeof canolaOilsScienceSchema>;
export type CanolaOilsColdPressedSchema = z.infer<typeof canolaOilsColdPressedSchema>;
