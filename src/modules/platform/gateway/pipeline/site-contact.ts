import 'server-only';

// ==========================================================================
// Verified business contact details for the Experience layer.
//
// The assistant is instructed NOT to write phone numbers, emails or addresses
// (the Contact card shows them, and anything the model writes could be invented).
// So the card needs a trustworthy source: the same CMS record the site footer
// renders — one small row, read once and cached.
//
// This lives in the GATEWAY (the composition root that already wires CMS-derived
// data into the platforms) rather than inside the Experience Platform, keeping
// the dependency arrow pointing one way: business/CMS → platform, never back.
// ==========================================================================

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';

export interface SiteContact {
  phone?: string;
  email?: string;
  address?: string;
}

export interface SiteSocial {
  platform: string;
  url: string;
}

/**
 * The site's VISIBLE social links — the same `FooterSocialLink` rows the footer
 * renders, honouring `isVisible` and `sortOrder`. Read here (the composition
 * root) rather than by importing the footer module, keeping the dependency arrow
 * business → platform. No social URL is ever duplicated or invented.
 */
const readSocials = unstable_cache(
  async (): Promise<SiteSocial[]> => {
    const rows = await prisma.footerSocialLink.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' },
      select: { platform: true, url: true },
    });
    return rows.filter((r) => r.url?.trim());
  },
  ['jivo:site-socials'],
  { tags: ['footer', 'socials'], revalidate: 3600 },
);

export async function getSiteSocials(): Promise<SiteSocial[]> {
  try {
    return await readSocials();
  } catch {
    try {
      return await prisma.footerSocialLink.findMany({
        where: { isVisible: true },
        orderBy: { sortOrder: 'asc' },
        select: { platform: true, url: true },
      });
    } catch {
      return [];
    }
  }
}

/** The single small row the card needs. One query, four columns. */
async function query(): Promise<SiteContact> {
  const f = await prisma.footerSetting.findFirst({
    select: { phone: true, phoneLabel: true, email: true, address: true },
  });
  if (!f) return {};
  return {
    phone: f.phone ? `${f.phone}${f.phoneLabel ? ` ${f.phoneLabel}` : ''}`.trim() : undefined,
    email: f.email ?? undefined,
    address: f.address ?? undefined,
  };
}

/**
 * Cached so a chat turn adds no per-request database work (these details change
 * roughly never); the tags let a CMS save invalidate it.
 */
const readCached = unstable_cache(query, ['jivo:site-contact'], {
  tags: ['site-contact', 'footer'],
  revalidate: 3600,
});

/**
 * Verified contact details for the Contact card.
 *
 * `unstable_cache` only works inside a Next request scope, so outside one (scripts,
 * tests) we fall back to an uncached read rather than returning nothing — an empty
 * result would silently render a Contact card with no details.
 */
export async function getSiteContact(): Promise<SiteContact> {
  try {
    return await readCached();
  } catch {
    try {
      return await query();
    } catch {
      return {};
    }
  }
}
