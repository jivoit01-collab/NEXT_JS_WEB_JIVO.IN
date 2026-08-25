import { z } from 'zod';

/**
 * Image fields are optional: the section components render branded fallbacks
 * when a value is empty, so editors can save copy before art is uploaded.
 */
const imageField = z.string().default('');

/**
 * A required image: the value must be a non-empty, non-placeholder string.
 * Used where an empty image would leave the section broken (e.g. an image-only
 * section's background).
 */
const requiredImageField = z
  .string()
  .min(1, 'Image is required')
  .refine((v) => v !== 'placeholder.png', 'Image is required');

export const sunflowerOilsHeroSchema = z.object({
  logoImage: imageField,
  heading: z.string().min(1, 'Heading is required'),
  subtitleLineOne: z.string().min(1, 'First subtitle line is required'),
  subtitleLineTwo: z.string().default(''),
  ctaLabel: z.string().min(1, 'CTA label is required'),
  ctaHref: z.string().min(1, 'CTA link is required'),
  productImage: imageField,
  productImageSecondary: imageField,
});

export const sunflowerProductVariantSchema = z.object({
  image: imageField,
  label: z.string().min(1, 'Label is required'),
  href: z.string().default(''),
});

export const sunflowerOilsRangeSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  variants: z.array(sunflowerProductVariantSchema).min(1, 'At least one variant required'),
});

export const sunflowerOilsBenefitsSchema = z.object({
  benefitsHeading: z.string().min(1, 'Benefits heading is required'),
  benefits: z.array(z.string().min(1)).min(1, 'At least one benefit required'),
  image: imageField,
});

export const sunflowerOilsWhyItMattersSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  paragraph: z.string().min(1, 'Paragraph is required'),
  backgroundImage: requiredImageField,
});

/** Map from section key → Zod schema for server-side validation. */
export const sunflowerOilsSectionSchemas = {
  hero: sunflowerOilsHeroSchema,
  range: sunflowerOilsRangeSchema,
  benefits: sunflowerOilsBenefitsSchema,
  whyItMatters: sunflowerOilsWhyItMattersSchema,
} as const;

export type SunflowerOilsHeroSchema = z.infer<typeof sunflowerOilsHeroSchema>;
export type SunflowerOilsRangeSchema = z.infer<typeof sunflowerOilsRangeSchema>;
export type SunflowerOilsBenefitsSchema = z.infer<typeof sunflowerOilsBenefitsSchema>;
export type SunflowerOilsWhyItMattersSchema = z.infer<typeof sunflowerOilsWhyItMattersSchema>;
