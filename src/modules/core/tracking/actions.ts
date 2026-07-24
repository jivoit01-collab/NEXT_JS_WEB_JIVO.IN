'use server';

// The tracking engine writes exclusively through the existing Phase 1 public
// ingestion endpoints — it introduces NO new server action for writes.
//
// For reads, a future admin dashboard queries the universal event log via
// Phase 1's already-admin-guarded action. A "use server" module may only export
// async functions, so we wrap (not re-export) it.

import { listEventsAction } from '@/modules/core/analytics';

/** Admin: query the tracked event log (filters + pagination). Guarded by Phase 1. */
export async function listTrackedEventsAction(input?: Record<string, unknown>) {
  return listEventsAction(input);
}
