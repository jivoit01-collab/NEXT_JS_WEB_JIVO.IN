/**
 * Point every stored SEO URL at a given domain.
 *
 * SEO canonical URLs / JSON-LD are stored as literal strings in SeoMeta, so they
 * must be rewritten whenever the site moves domain (localhost → staging → live).
 *
 *   npm run seo:domain -- https://abc.jivo.in     (staging)
 *   npm run seo:domain -- https://jivo.in         (after going live)
 *
 * Safe to re-run: it rewrites any known origin (localhost or any *.jivo.in host)
 * to the target, and leaves relative values (e.g. "og-default.png") untouched.
 */
import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/** Matches http(s)://localhost[:port] and http(s)://[sub.]jivo.in — origin only. */
const ORIGIN_RE = /https?:\/\/(?:localhost(?::\d+)?|(?:[a-z0-9-]+\.)*jivo\.in)/gi;

function normalise(value: string | null, target: string): string | null {
  if (!value) return value;
  return value.replace(ORIGIN_RE, target);
}

async function main() {
  const target = (process.argv[2] ?? '').trim().replace(/\/+$/, '');

  if (!/^https?:\/\/\S+$/.test(target)) {
    console.error('Usage: npm run seo:domain -- https://abc.jivo.in');
    process.exit(1);
  }

  const rows = await prisma.seoMeta.findMany({ orderBy: { page: 'asc' } });
  let changed = 0;

  for (const row of rows) {
    const canonicalUrl = normalise(row.canonicalUrl, target);
    const ogImage = normalise(row.ogImage, target);
    const structuredRaw = row.structuredData ? JSON.stringify(row.structuredData) : null;
    const structuredFixed = structuredRaw ? structuredRaw.replace(ORIGIN_RE, target) : null;

    if (
      canonicalUrl === row.canonicalUrl &&
      ogImage === row.ogImage &&
      structuredFixed === structuredRaw
    ) {
      console.log(`  ${row.page}: already ${target}`);
      continue;
    }

    await prisma.seoMeta.update({
      where: { page: row.page },
      data: {
        canonicalUrl,
        ogImage,
        ...(structuredFixed ? { structuredData: JSON.parse(structuredFixed) } : {}),
      },
    });
    changed++;
    console.log(`✓ ${row.page} → ${canonicalUrl}`);
  }

  console.log(`\nDone. ${changed} row(s) updated, ${rows.length - changed} already correct.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
