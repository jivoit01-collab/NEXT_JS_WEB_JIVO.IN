import { z } from 'zod';

/**
 * Image fields are optional: the section components render branded fallbacks
 * when a value is empty, so editors can save copy before art is uploaded.
 */
const imageField = z.string().default('');

export const groundnutOilsHeroSchema = z.object({
  logoImage: imageField,
  heading: z.string().min(1, 'Heading is required'),
  subtitleLineOne: z.string().min(1, 'First subtitle line is required'),
  subtitleLineTwo: z.string().default(''),
  ctaLabel: z.string().min(1, 'CTA label is required'),
  ctaHref: z.string().min(1, 'CTA link is required'),
  productImage: imageField,
  productImageSecondary: imageField,
});

export const groundnutProductVariantSchema = z.object({
  image: imageField,
  label: z.string().min(1, 'Label is required'),
  href: z.string().default(''),
});

export const groundnutOilsRangeSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  variants: z.array(groundnutProductVariantSchema).min(1, 'At least one variant required'),
});

export const groundnutOilsGoodnessSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  paragraph: z.string().min(1, 'Paragraph is required'),
  benefitsHeading: z.string().default(''),
  benefits: z.array(z.string().min(1)).min(1, 'At least one benefit required'),
  image: imageField,
});

export const groundnutOilsAuthenticitySchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  paragraph: z.string().min(1, 'Paragraph is required'),
  backgroundImage: imageField,
});

/** Map from section key → Zod schema for server-side validation. */
export const groundnutOilsSectionSchemas = {
  hero: groundnutOilsHeroSchema,
  range: groundnutOilsRangeSchema,
  goodness: groundnutOilsGoodnessSchema,
  authenticity: groundnutOilsAuthenticitySchema,
} as const;

export type GroundnutOilsHeroSchema = z.infer<typeof groundnutOilsHeroSchema>;
export type GroundnutOilsRangeSchema = z.infer<typeof groundnutOilsRangeSchema>;
export type GroundnutOilsGoodnessSchema = z.infer<typeof groundnutOilsGoodnessSchema>;
export type GroundnutOilsAuthenticitySchema = z.infer<typeof groundnutOilsAuthenticitySchema>;
