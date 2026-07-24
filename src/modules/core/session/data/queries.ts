import { cache } from 'react';
import { prisma } from '@/lib/db';
import type { Paginated } from '../../shared/types';
import type { SessionDTO } from '../types';

const sessionPublicSelect = {
  sessionId: true,
  visitorId: true,
  startedAt: true,
  endedAt: true,
  duration: true,
  entryPage: true,
  exitPage: true,
  isBounce: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** Fetch one (non-deleted) session by its public id. */
export const getSessionBySessionId = cache(
  async (sessionId: string): Promise<SessionDTO | null> => {
    return prisma.visitorSession.findFirst({
      where: { sessionId, deletedAt: null },
      select: sessionPublicSelect,
    });
  },
);

/** Admin: paginated list of sessions (newest first). Optionally scoped to a visitor. */
export async function listSessions(
  page: number,
  pageSize: number,
  visitorId?: string,
): Promise<Paginated<SessionDTO>> {
  const where = { deletedAt: null, ...(visitorId ? { visitorId } : {}) };
  const [items, total] = await Promise.all([
    prisma.visitorSession.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: sessionPublicSelect,
    }),
    prisma.visitorSession.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function countSessions(): Promise<number> {
  return prisma.visitorSession.count({ where: { deletedAt: null } });
}
