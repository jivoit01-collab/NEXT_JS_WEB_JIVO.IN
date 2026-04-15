import { z } from 'zod';

export const twitterCardSchema = z.enum(['summary', 'summary_large_image']);

export const robotsSchema = z.enum([
  'index,follow',
  'noindex,follow',
  'index,nofollow',
  'noindex,nofollow',
]);

/** SEO form payload — what the admin sends to save a page's SEO. */
export const seoFormSchema = z.object({
  metaTitle: z
    .string()
    .min(1, 'Meta title is required')
    .max(70, 'Meta title should be ≤ 70 characters for best SEO'),
  metaDescription: z
    .string()
    .max(180, 'Meta description should be ≤ 180 characters')
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  keywords: z.array(z.string().min(1).max(60)).max(20).default([]),
  ogTitle: z.string().max(95).nullable().optional().transform((v) => v ?? null),
  ogDescription: z.string().max(200).nullable().optional().transform((v) => v ?? null),
  ogImage: z
    .string()
    .url('OG image must be a URL')
    .or(z.string().startsWith('/', 'OG image must be a URL or a path starting with /'))
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  twitterCard: twitterCardSchema.default('summary_large_image'),
  canonicalUrl: z
    .string()
    .url('Canonical URL must be a valid URL')
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  structuredData: z
    .record(z.string(), z.unknown())
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  robots: robotsSchema.default('index,follow'),
});

/** Full SEO row including the `page` key (for create endpoints). */
export const seoSchema = seoFormSchema.extend({
  page: z
    .string()
    .min(1, 'Page key is required')
    .max(120)
    .regex(/^[a-z0-9:_/\-]+$/, 'Page key must be lowercase alphanumerics with - _ : /'),
});

export type SeoFormSchema = z.infer<typeof seoFormSchema>;
export type SeoSchema = z.infer<typeof seoSchema>;
