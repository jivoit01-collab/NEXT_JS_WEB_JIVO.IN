import 'server-only';
import { prisma } from '@/lib/db';

/**
 * Merge an anonymous Core Visitor into an authenticated User.
 *
 * Idempotent upsert keyed by the unique `visitorId`, so:
 *   • no duplicate links,
 *   • re-login just re-points the link,
 *   • the Core Visitor / its analytics / sessions / events are untouched and
 *     stay queryable — they simply become attributable to `userId`.
 *
 * The frozen Core `Visitor` model is NOT modified (soft reference by string).
 */
export async function mergeVisitorIntoUser(userId: string, visitorId: string): Promise<void> {
  await prisma.userVisitorLink.upsert({
    where: { visitorId },
    update: { userId },
    create: { userId, visitorId },
  });
}

/** All visitor ids ever linked to a user (multiple devices/sessions over time). */
export async function getUserVisitorIds(userId: string): Promise<string[]> {
  const links = await prisma.userVisitorLink.findMany({
    where: { userId },
    select: { visitorId: true },
  });
  return links.map((l) => l.visitorId);
}

/** Reverse lookup — which user (if any) a visitor is linked to. */
export async function getUserIdForVisitor(visitorId: string): Promise<string | null> {
  const link = await prisma.userVisitorLink.findUnique({
    where: { visitorId },
    select: { userId: true },
  });
  return link?.userId ?? null;
}
