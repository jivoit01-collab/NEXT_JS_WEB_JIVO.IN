import { z } from 'zod';

/**
 * Image fields are optional: the section components render branded fallbacks
 * when a value is empty, so editors can save copy before art is uploaded.
 */
const imageField = z.string().default('');

export const oliveOilsHeroSchema = z.object({
  logoImage: imageField,
  heading: z.string().min(1, 'Heading is required'),
  subtitleLineOne: z.string().min(1, 'First subtitle line is required'),
  subtitleLineTwo: z.string().default(''),
  ctaLabel: z.string().min(1, 'CTA label is required'),
  ctaHref: z.string().min(1, 'CTA link is required'),
  productImage: imageField,
  productImageSecondary: imageField,
  productImageThree: imageField,
});

export const oliveProductVariantSchema = z.object({
  image: imageField,
  label: z.string().min(1, 'Label is required'),
  href: z.string().default(''),
});

/** Shared by all three variant sections (extra virgin / extra light / pomace). */
export const oliveOilsVariantSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  paragraph: z.string().min(1, 'Paragraph is required'),
  paragraphTwo: z.string().default(''),
  bestFor: z.string().default(''),
  sideImage: imageField,
  variants: z.array(oliveProductVariantSchema).min(1, 'At least one variant required'),
});

export const oliveOilsDifferenceSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  paragraph: z.string().min(1, 'Paragraph is required'),
  backgroundImage: imageField,
});

/** Map from section key → Zod schema for server-side validation. */
export const oliveOilsSectionSchemas = {
  hero: oliveOilsHeroSchema,
  extraVirgin: oliveOilsVariantSchema,
  extraLight: oliveOilsVariantSchema,
  pomace: oliveOilsVariantSchema,
  difference: oliveOilsDifferenceSchema,
} as const;

export type OliveOilsHeroSchema = z.infer<typeof oliveOilsHeroSchema>;
export type OliveOilsVariantSchema = z.infer<typeof oliveOilsVariantSchema>;
export type OliveOilsDifferenceSchema = z.infer<typeof oliveOilsDifferenceSchema>;
