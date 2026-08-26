import { z } from 'zod';

const imageField = z.string().default('');

export const waterHeroSchema = z.object({
  logoImage: imageField,
  heading: z.string().min(1, 'Heading is required'),
  subtitleLineOne: z.string().min(1, 'First subtitle line is required'),
  subtitleLineTwo: z.string().default(''),
  ctaLabel: z.string().min(1, 'CTA label is required'),
  ctaHref: z.string().min(1, 'CTA link is required'),
  productImage: imageField,
  productImageSecondary: imageField,
  backgroundImage: imageField,
});

export const waterVariantSchema = z.object({
  image: imageField,
  label: z.string().min(1, 'Label is required'),
  href: z.string().default(''),
});

export const waterRangeSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  variants: z.array(waterVariantSchema).min(1, 'At least one variant required'),
});

export const waterFeatureSchema = z.object({
  image: imageField,
  label: z.string().min(1, 'Label is required'),
  description: z.string().default(''),
});

export const waterBetterBottleSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  paragraphLeft: z.string().min(1, 'Left paragraph is required'),
  paragraphRight: z.string().default(''),
  features: z.array(waterFeatureSchema).min(1, 'At least one feature required'),
});

export const waterMissionSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  paragraph: z.string().min(1, 'Paragraph is required'),
  backgroundImage: imageField,
});

export const waterSectionSchemas = {
  hero: waterHeroSchema,
  range: waterRangeSchema,
  betterBottle: waterBetterBottleSchema,
  mission: waterMissionSchema,
} as const;

export type WaterHeroSchema = z.infer<typeof waterHeroSchema>;
export type WaterRangeSchema = z.infer<typeof waterRangeSchema>;
export type WaterBetterBottleSchema = z.infer<typeof waterBetterBottleSchema>;
export type WaterMissionSchema = z.infer<typeof waterMissionSchema>;
