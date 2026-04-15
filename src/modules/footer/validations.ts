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
  email: z.string().max(200).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  phoneLabel: z.string().max(50).nullable().optional(),
});

export type FooterColumnInput = z.infer<typeof footerColumnSchema>;
export type FooterColumnUpdateInput = z.infer<typeof footerColumnUpdateSchema>;
export type FooterLinkInput = z.infer<typeof footerLinkSchema>;
export type FooterLinkUpdateInput = z.infer<typeof footerLinkUpdateSchema>;
export type FooterSettingInput = z.infer<typeof footerSettingSchema>;
