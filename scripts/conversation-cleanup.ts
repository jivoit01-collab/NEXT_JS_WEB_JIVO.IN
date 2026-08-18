/**
 * Weekly conversation cleanup.
 *
 *   npm run chat:cleanup             → delete using CHAT_RETENTION_DAYS (default 7)
 *   npm run chat:cleanup -- --days=30 → override the retention window
 *   npm run chat:cleanup -- --dry-run → report what WOULD be deleted
 *
 * Schedule this weekly (cron / Task Scheduler / platform scheduler). It is
 * idempotent: running it twice deletes nothing extra, and an interrupted run is
 * simply finished by the next one.
 *
 * Aggregated analytics are NOT affected — `AIExecution` keeps `conversationId`
 * as a soft reference with no foreign key, so long-term reporting survives.
 */
import 'dotenv/config';
import { config as loadEnv } from 'dotenv';

// Match prisma/seed.ts: the live server only has a .env.production file.
loadEnv({ path: '.env.local' });
loadEnv({ path: '.env.production' });

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.split('=')[1];
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const days = Number(arg('days') ?? process.env.CHAT_RETENTION_DAYS ?? 7) || 7;

  // Imported dynamically: `@/lib/db` builds its pool at import time, so it must
  // not be hoisted above the loadEnv() calls above.
  const { cleanupConversations, CHAT_RETENTION_DAYS } = await import(
    '@/modules/platform/conversation/retention'
  );
  const { prisma } = await import('@/lib/db');

  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  console.log(`Conversation cleanup — retention ${days} day(s), cutoff ${cutoff.toISOString()}`);
  if (days !== CHAT_RETENTION_DAYS) console.log(`  (overriding configured ${CHAT_RETENTION_DAYS})`);

  if (dryRun) {
    const [expired, empty] = await Promise.all([
      prisma.conversation.count({
        where: {
          OR: [
            { lastMessageAt: { lt: cutoff } },
            { lastMessageAt: null, createdAt: { lt: cutoff } },
          ],
        },
      }),
      prisma.conversation.count({
        where: {
          createdAt: { lt: new Date(Date.now() - 15 * 60_000) },
          messages: { none: { role: 'USER' } },
        },
      }),
    ]);
    console.log(`DRY RUN — would delete ${expired} expired and ${empty} empty conversation(s).`);
    return;
  }

  const result = await cleanupConversations(days);
  console.log(
    `Deleted: ${result.expired} expired, ${result.empty} empty, ${result.orphans} orphaned dependent row(s). ` +
      `Titles repaired: ${result.titlesFixed}.`,
  );
  if (result.error) {
    console.error(`Cleanup reported an error (safe to re-run): ${result.error}`);
    process.exitCode = 1;
  } else if (result.incomplete) {
    console.warn('Cleanup hit the batch cap — run again to finish.');
  }
}

main()
  .then(() => process.exit(process.exitCode ?? 0))
  .catch((e) => {
    console.error('Conversation cleanup failed:', e);
    process.exit(1);
  });
