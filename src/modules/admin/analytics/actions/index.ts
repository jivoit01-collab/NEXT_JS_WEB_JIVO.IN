'use server';

// Phase 4 introduces NO analytics calculation APIs. The dashboard reads through
// the EXISTING, admin-guarded Core action. This wrapper is the single seam a
// later aggregation phase will build on (add getOverview/getModule here, backed
// by the Core event log + sessions + visitors — never a new analytics system).

import { listTrackedEventsAction } from '@/modules/core/tracking';

/** Admin: raw tracked-event log (filters + pagination). Reuses frozen Core. */
export async function getTrackedEventsAction(input?: Record<string, unknown>) {
  return listTrackedEventsAction(input);
}
