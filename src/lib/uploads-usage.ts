import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

/**
 * Tables whose `content` JSON column can hold uploaded image filenames anywhere
 * inside it. A filename is "referenced" if it appears as a substring of the
 * JSON text — this catches every nested field without enumerating each shape.
 *
 * Kept as quoted identifiers so the raw query targets the exact table names.
 */
const JSON_CONTENT_TABLES = [
  'HomePage',
  'OurEssenceTheStory',
  'OurEssenceCoreValues',
  'OurEssenceCertifications',
  'OurEssenceSocialInitiatives',
  'OurEssenceOurFairShare',
  'OurEssenceForMotherEarth',
  'OurEssenceTheJivoCapital',
  'PageContent',
  'OurProductsCanolaOils',
  'OurProductsDesiGhee',
  'OurProductsGroundnutOils',
  'OurProductsMustardOils',
  'OurProductsOliveOils',
  'OurProductsSunflowerOils',
  'OurProductsRefinedGoldOils',
  'OurProductsWater',
  'PrivacyPolicy',
] as const;

/**
 * Dedicated string columns that hold an uploaded image filename.
 * [table, column] pairs.
 */
const IMAGE_COLUMNS: readonly [string, string][] = [
  ['NavbarSetting', 'logoUrl'],
  ['FooterSetting', 'logoUrl'],
  ['FooterSetting', 'leafImageTop'],
  ['FooterSetting', 'leafImageBottom'],
  ['FooterCertificate', 'imageUrl'],
  ['HeroSlide', 'backgroundImage'],
  ['SeoMeta', 'ogImage'],
  ['UserProfile', 'avatarUrl'],
];

/**
 * Count how many times an uploaded filename is referenced across the database —
 * inside any section's `content` JSON and in every dedicated image column.
 *
 * Used before deleting a file: if the same image was reused in another field
 * (via the copy/paste "image name" feature), deleting the file would break
 * those other places. So we only delete when the count is 0.
 *
 * The check compares against the RAW stored value, which is the bare filename
 * (e.g. "abc123.webp"). We match on that substring so a value that embeds it in
 * a path still counts.
 */
export async function countFileReferences(filename: string): Promise<number> {
  const name = (filename ?? '').trim();
  if (!name || name === 'placeholder.png') return Number.MAX_SAFE_INTEGER; // never deletable

  // Guard: filenames are bare (no slashes). Anything else is not one of ours.
  if (name.includes('/') || name.includes('\\') || name.includes('..')) {
    return Number.MAX_SAFE_INTEGER;
  }

  const like = `%${name}%`;
  let total = 0;

  // 1) JSON content tables — substring match on the serialized JSON.
  for (const table of JSON_CONTENT_TABLES) {
    try {
      const rows = await prisma.$queryRaw<{ n: bigint }[]>(
        Prisma.sql`SELECT COUNT(*)::bigint AS n FROM ${Prisma.raw(`"${table}"`)} WHERE "content"::text LIKE ${like}`,
      );
      total += rows[0] ? Number(rows[0].n) : 0;
    } catch (err) {
      // A table that doesn't exist yet (fresh DB) shouldn't block deletion — but
      // an unexpected error should, so we surface it and treat as "referenced".
      console.error('[uploads-usage] JSON scan failed for', table, err);
      total += 1;
    }
  }

  // 2) Dedicated image columns — exact match on the stored filename.
  for (const [table, column] of IMAGE_COLUMNS) {
    try {
      const rows = await prisma.$queryRaw<{ n: bigint }[]>(
        Prisma.sql`SELECT COUNT(*)::bigint AS n FROM ${Prisma.raw(`"${table}"`)} WHERE ${Prisma.raw(`"${column}"`)} = ${name}`,
      );
      total += rows[0] ? Number(rows[0].n) : 0;
    } catch (err) {
      console.error('[uploads-usage] column scan failed for', `${table}.${column}`, err);
      total += 1;
    }
  }

  return total;
}

/**
 * True when the file is safe to delete from disk — i.e. it is not referenced by
 * ANY section content or image column anywhere in the database.
 */
export async function isFileSafeToDelete(filename: string): Promise<boolean> {
  return (await countFileReferences(filename)) === 0;
}

/** Matches a bare uploaded filename value, e.g. "1712-foo.webp". */
const UPLOAD_FILENAME = /^[\w.-]+\.(?:webp|png|jpe?g|gif|avif)$/i;

/**
 * Walk any JSON-serializable value and collect every string that looks like an
 * uploaded image filename (bare name ending in an image extension). Handles the
 * arbitrary nesting of section `content` (objects, arrays, variant lists, etc.).
 */
export function collectImageFilenames(value: unknown, acc = new Set<string>()): Set<string> {
  if (typeof value === 'string') {
    const v = value.trim();
    if (v && v !== 'placeholder.png' && UPLOAD_FILENAME.test(v)) acc.add(v);
  } else if (Array.isArray(value)) {
    for (const item of value) collectImageFilenames(item, acc);
  } else if (value && typeof value === 'object') {
    for (const v of Object.values(value as Record<string, unknown>)) collectImageFilenames(v, acc);
  }
  return acc;
}

/**
 * Delete files that were removed from a section on save — the SAFE way.
 *
 * Call this AFTER writing the new content to the DB. It compares the old and new
 * content, and for each image filename that the new content no longer contains,
 * deletes the file from disk ONLY IF nothing else in the database still
 * references it (so an image reused in another field is never removed).
 *
 * Server-only (uses fs). Failures are logged, never thrown — cleanup must never
 * break a successful save.
 */
export async function cleanupRemovedImages(
  oldContent: unknown,
  newContent: unknown,
): Promise<void> {
  try {
    const oldNames = collectImageFilenames(oldContent);
    if (oldNames.size === 0) return;
    const newNames = collectImageFilenames(newContent);

    const candidates = [...oldNames].filter((n) => !newNames.has(n));
    if (candidates.length === 0) return;

    // Import fs lazily so this module stays importable from any server context.
    const path = await import('path');
    const { unlink } = await import('fs/promises');
    const { existsSync } = await import('fs');
    // Must match the upload route's UPLOAD_DIR.
    const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'images');

    for (const name of candidates) {
      // Only delete when the DB (already holding the NEW content) no longer
      // references this file anywhere.
      const refs = await countFileReferences(name);
      if (refs > 0) continue;

      const filePath = path.join(UPLOAD_DIR, name);
      if (existsSync(filePath)) {
        await unlink(filePath).catch((err) =>
          console.error('[uploads-usage] unlink failed for', name, err),
        );
      }
    }
  } catch (err) {
    console.error('[uploads-usage] cleanupRemovedImages failed', err);
  }
}
