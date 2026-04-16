import { z } from 'zod';

// ---- Section Content Schemas ----

export const heroContentSchema = z.object({
  logo: z.string().min(1, 'Logo is required'),
  backgroundImage: z.string().min(1, 'Background image is required'),
  headline: z.string().min(1, 'Headline is required').max(200),
  subtitle: z.string().min(1, 'Subtitle is required').max(500),
});

export const categoriesContentSchema = z.object({
  heading: z.string().min(1).max(200),
  items: z.array(
    z.object({
      name: z.string().min(1, 'Name is required').max(100),
      image: z.string().min(1, 'Image is required'),
      href: z.string().min(1, 'Link is required').max(200),
      bgColor: z.string().min(1, 'Background color is required').max(100),
    }),
  ),
});

export const visionMissionContentSchema = z.object({
  backgroundImage: z.string().min(1, 'Background image is required'),
  heading: z.string().min(1).max(200),
  subtitle: z.string().min(1).max(500),
  intro: z.string().max(2000).optional().default(''),
  intro2: z.string().max(2000).optional().default(''),
  vision: z.string().min(1).max(2000),
  mission: z.string().min(1).max(2000),
});

export const productsFoundationContentSchema = z.object({
  productImage: z.string().min(1, 'Product image is required'),
  section1: z.object({
    heading: z.string().min(1).max(200),
    paragraphs: z.array(z.string().min(1)),
  }),
  section2: z.object({
    heading: z.string().min(1).max(200),
    paragraphs: z.array(z.string().min(1)),
  }),
});

export const whyJivoContentSchema = z.object({
  heading: z.string().min(1).max(200),
  subheading: z.string().min(1).max(300),
  leftText: z.string().min(1).max(2000),
  rightParagraphs: z.array(z.string().min(1)),
  valuePillars: z.array(
    z.object({
      image: z.string().min(1, 'Pillar image is required'),
      title: z.string().min(1).max(100),
      description: z.string().min(1).max(500),
    }),
  ),
});

// ---- CRUD Schemas ----

export const homeSectionSchema = z.object({
  section: z.string().min(1, 'Section key is required'),
  content: z.record(z.string(), z.unknown()),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const homeSectionUpdateSchema = z.object({
  content: z.record(z.string(), z.unknown()).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// Map section keys to their content validators
export const sectionContentSchemas: Record<string, z.ZodType> = {
  hero: heroContentSchema,
  categories: categoriesContentSchema,
  vision_mission: visionMissionContentSchema,
  products_foundation: productsFoundationContentSchema,
  why_jivo: whyJivoContentSchema,
};

export type HomeSectionInput = z.infer<typeof homeSectionSchema>;
export type HomeSectionUpdateInput = z.infer<typeof homeSectionUpdateSchema>;

// ---- Hero Slide Schemas ----

export const heroSlideSchema = z.object({
  backgroundImage: z.string().min(1, 'Background image is required'),
  headline: z.string().min(1, 'Headline is required').max(200),
  subtitle: z.string().max(500).default(''),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const heroSlideUpdateSchema = z.object({
  backgroundImage: z.string().min(1).optional(),
  headline: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(500).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type HeroSlideInput = z.infer<typeof heroSlideSchema>;
export type HeroSlideUpdateInput = z.infer<typeof heroSlideUpdateSchema>;
