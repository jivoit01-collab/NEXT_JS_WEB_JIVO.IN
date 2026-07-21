import { z } from 'zod';

// ── Columns ───────────────────────────────────────────────────

export const footerColumnSchema = z.object({
  title: z.string().min(1, 'Title is required').max(80, 'Title too long'),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const footerColumnUpdateSchema = z.object({
  title: z.string().min(1).max(80).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isVisible: z.boolean().optional(),
});

// ── Links ─────────────────────────────────────────────────────

export const footerLinkSchema = z.object({
  columnId: z.string().min(1, 'Column is required'),
  title: z.string().min(1, 'Title is required').max(120),
  href: z.string().min(1, 'Link is required').max(300),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const footerLinkUpdateSchema = z.object({
  columnId: z.string().min(1).optional(),
  title: z.string().min(1).max(120).optional(),
  href: z.string().min(1).max(300).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isVisible: z.boolean().optional(),
});

// ── Settings ──────────────────────────────────────────────────

export const footerSettingSchema = z.object({
  logoUrl: z.string().max(500).nullable().optional(),
  logoAlt: z.string().max(200).nullable().optional(),
  copyrightText: z.string().max(200).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  addressMapUrl: z.string().max(1000).nullable().optional(),
  email: z.string().max(200).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  phoneLabel: z.string().max(50).nullable().optional(),
  tagline: z.string().max(300).nullable().optional(),
  brandPromise: z.string().max(200).nullable().optional(),
  brandPromiseSub: z.string().max(120).nullable().optional(),
  ctaLabel: z.string().max(60).nullable().optional(),
  ctaHref: z.string().max(300).nullable().optional(),
  leafImageTop: z.string().max(500).nullable().optional(),
  leafImageBottom: z.string().max(500).nullable().optional(),
  followLabel: z.string().max(60).nullable().optional(),
  certificationText: z.string().max(300).nullable().optional(),
  madeInText: z.string().max(120).nullable().optional(),
});

// ── Social links ──────────────────────────────────────────────

/**
 * Supported social platforms. Source of truth shared by the Zod enum and the
 * footer icon registry — adding a new platform is one entry here + one in the
 * registry (`src/components/layout/footer-social-icons.tsx`).
 */
export const SOCIAL_PLATFORMS = ['instagram', 'facebook', 'youtube', 'linkedin', 'x'] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const footerSocialLinkSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS),
  url: z.string().min(1, 'URL is required').max(500).url('Must be a valid URL'),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const footerSocialLinkUpdateSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS).optional(),
  url: z.string().min(1).max(500).url('Must be a valid URL').optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isVisible: z.boolean().optional(),
});

// ── Certificates ──────────────────────────────────────────────

export const footerCertificateSchema = z.object({
  imageUrl: z.string().min(1, 'Image is required').max(500),
  alt: z.string().max(200).nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const footerCertificateUpdateSchema = z.object({
  imageUrl: z.string().min(1).max(500).optional(),
  alt: z.string().max(200).nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isVisible: z.boolean().optional(),
});

export type FooterColumnInput = z.infer<typeof footerColumnSchema>;
export type FooterColumnUpdateInput = z.infer<typeof footerColumnUpdateSchema>;
export type FooterLinkInput = z.infer<typeof footerLinkSchema>;
export type FooterLinkUpdateInput = z.infer<typeof footerLinkUpdateSchema>;
export type FooterSettingInput = z.infer<typeof footerSettingSchema>;
export type FooterSocialLinkInput = z.infer<typeof footerSocialLinkSchema>;
export type FooterSocialLinkUpdateInput = z.infer<typeof footerSocialLinkUpdateSchema>;
export type FooterCertificateInput = z.infer<typeof footerCertificateSchema>;
export type FooterCertificateUpdateInput = z.infer<typeof footerCertificateUpdateSchema>;
