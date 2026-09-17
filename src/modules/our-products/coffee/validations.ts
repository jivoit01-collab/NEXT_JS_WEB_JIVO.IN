import { z } from 'zod';

/**
 * Image fields are optional: the section components render branded fallbacks
 * when a value is empty, so editors can save copy before art is uploaded.
 */
const imageField = z.string().default('');

export const coffeeHeroSchema = z.object({
  logoImage: imageField,
  heading: z.string().min(1, 'Heading is required'),
  subtitleLineOne: z.string().min(1, 'First subtitle line is required'),
  subtitleLineTwo: z.string().default(''),
  ctaLabel: z.string().min(1, 'CTA label is required'),
  ctaHref: z.string().min(1, 'CTA link is required'),
  productImage: imageField,
  productImageSecondary: imageField,
});

export const coffeeVariantSchema = z.object({
  image: imageField,
  label: z.string().min(1, 'Label is required'),
  href: z.string().default(''),
});

export const coffeeRangeSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  variants: z.array(coffeeVariantSchema).min(1, 'At least one variant required'),
});

export const coffeeKeyHighlightsSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  // The design has no intro paragraph — optional so the bullets can stand alone.
  paragraph: z.string().default(''),
  highlightsHeading: z.string().default(''),
  highlights: z.array(z.string().min(1)).min(1, 'At least one highlight required'),
  image: imageField,
});

export const coffeeBeyondBeansSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  paragraph: z.string().min(1, 'Paragraph is required'),
  backgroundImage: imageField,
});

/** Map from section key → Zod schema for server-side validation. */
export const coffeeSectionSchemas = {
  hero: coffeeHeroSchema,
  range: coffeeRangeSchema,
  keyHighlights: coffeeKeyHighlightsSchema,
  beyondBeans: coffeeBeyondBeansSchema,
} as const;

export type CoffeeHeroSchema = z.infer<typeof coffeeHeroSchema>;
export type CoffeeRangeSchema = z.infer<typeof coffeeRangeSchema>;
export type CoffeeKeyHighlightsSchema = z.infer<typeof coffeeKeyHighlightsSchema>;
export type CoffeeBeyondBeansSchema = z.infer<typeof coffeeBeyondBeansSchema>;
