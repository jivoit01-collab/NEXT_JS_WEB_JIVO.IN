import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Resolve DATABASE_URL the same way `next build` does. The live server only has
// a `.env.production` file, so the Prisma CLI (db push) MUST load it too —
// otherwise it sees an empty connection URL. dotenv does not override an
// already-set value, so precedence is: .env.local > .env.production > .env.
loadEnv({ path: '.env.local' });
loadEnv({ path: '.env.production' });
loadEnv({ path: '.env' });

export default defineConfig({
  schema: path.join('prisma', 'schema'),
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});


// ─────────────────────────────────────────────────────────────────────────
// # MANUAL LIVE DB SYNC  (run from this machine, one time / after content changes)
// #   1) Point DATABASE_URL below at the LIVE url (comment out the test one).
// #        ⚠ Percent-encode specials in the password:  @ → %40   # → %23   : → %3A
// #          e.g.  dev01@124  →  dev01%40124   (an un-encoded @ breaks the URL)
// #   2) npm run db:push      # create/update tables on live
// #   3) npm run db:seed      # insert missing data (safe: insert-only, skips existing)
// #   4) Switch DATABASE_URL back to the test url for local development.
// # ─────────────────────────────────────────────────────────────────────────
