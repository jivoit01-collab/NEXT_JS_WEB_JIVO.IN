/**
 * Knowledge indexing runner — populates the Knowledge Platform from the CMS.
 *
 *   npm run knowledge:sync           → incremental (upsert changed content)
 *   npm run knowledge:sync -- --full → full re-index + prune removed items
 *
 * This is only an ENTRY POINT. It reuses the existing indexer (`syncAllSources`)
 * and creates no tables, no retrieval logic and no second knowledge system, so
 * the initial index and deploy backfills can run without an admin login.
 *
 * Run it after seeding or whenever CMS content changes materially.
 */
import 'dotenv/config';
import { config as loadEnv } from 'dotenv';

// Match prisma/seed.ts: the live server only has a .env.production file, and
// dotenv never overrides an already-set value, so .env.local still wins locally.
loadEnv({ path: '.env.local' });
loadEnv({ path: '.env.production' });

async function main() {
  const full = process.argv.includes('--full');
  console.log(`Knowledge sync (${full ? 'FULL re-index' : 'incremental'})…\n`);

  // Imported DYNAMICALLY: `@/lib/db` builds its connection pool at import time,
  // so it must not be hoisted above the loadEnv() calls above.
  const { syncAllSources } = await import('@/modules/platform/knowledge/indexing');
  const results = await syncAllSources(full ? 'FULL' : 'INCREMENTAL');

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const r of results) {
    created += r.created;
    updated += r.updated;
    failed += r.failed;
    const detail = r.error
      ? `ERROR: ${r.error}`
      : `${r.processed} items → +${r.created} new, ~${r.updated} updated, -${r.pruned} pruned`;
    console.log(`  ${r.sourceKey.padEnd(12)} ${detail}`);
  }

  console.log(
    `\nDone — ${created} document(s) created, ${updated} updated${failed ? `, ${failed} failed` : ''}.`,
  );
  if (failed) process.exitCode = 1;
}

main()
  .then(() => process.exit(process.exitCode ?? 0))
  .catch((e) => {
    console.error('Knowledge sync failed:', e);
    process.exit(1);
  });
