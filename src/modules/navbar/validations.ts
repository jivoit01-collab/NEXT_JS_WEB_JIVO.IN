import { z } from 'zod';

export const navLinkSchema = z.object({
  title: z.string().min(1, 'Title is required').max(60, 'Title too long'),
  href: z.string().max(200).optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const navLinkUpdateSchema = z.object({
  title: z.string().min(1).max(60).optional(),
  href: z.string().min(1).max(200).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isVisible: z.boolean().optional(),
});

export type NavLinkSchemaInput = z.infer<typeof navLinkSchema>;
export type NavLinkUpdateSchemaInput = z.infer<typeof navLinkUpdateSchema>;

// ── Sub-link schemas ──────────────────────────────────────────

export const navSubLinkSchema = z.object({
  navLinkId: z.string().min(1, 'Parent link is required'),
  title: z.string().min(1, 'Title is required').max(120, 'Title too long'),
  href: z.string().min(1, 'Link is required').max(300, 'Link too long'),
  // Optional group for a two-level mega-dropdown (e.g. "Healthy Oils"). Empty
  // string is normalized to null (ungrouped).
  group: z
    .string()
    .max(80, 'Group name too long')
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const navSubLinkUpdateSchema = z.object({
  navLinkId: z.string().min(1).optional(),
  title: z.string().min(1).max(120).optional(),
  href: z.string().min(1).max(300).optional(),
  group: z
    .string()
    .max(80)
    .nullable()
    .optional()
    .transform((v) => (v === undefined ? undefined : v && v.trim() ? v.trim() : null)),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isVisible: z.boolean().optional(),
});

export type NavSubLinkSchemaInput = z.infer<typeof navSubLinkSchema>;
export type NavSubLinkUpdateSchemaInput = z.infer<typeof navSubLinkUpdateSchema>;

// ── Navbar settings (logo + branding) ─────────────────────────

export const navbarSettingSchema = z.object({
  logoUrl: z.string().max(500).nullable().optional(),
  logoAlt: z.string().max(200).nullable().optional(),
});

export type NavbarSettingSchemaInput = z.infer<typeof navbarSettingSchema>;
