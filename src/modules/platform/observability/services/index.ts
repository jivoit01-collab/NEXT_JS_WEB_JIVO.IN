import 'server-only';

// ==========================================================================
// AI Observability service — the reusable recorder. The Gateway pipeline calls
// `recordExecution(input)` once per request. Recording is BEST-EFFORT and never
// throws into the request path (a monitoring failure must not break a user
// answer). Cost is computed here via the shared estimator (no duplication).
// ==========================================================================

import { platformEvents } from '@/modules/core/events';
import { OBSERVABILITY_FEATURES } from '../config';
import { estimateCost } from '../utils';
import { insertExecution, executionStats, recentExecutions, executionsByProvider } from '../data';
import { OBSERVABILITY_EVENTS } from '../types';
import type { AIExecutionRecord } from '../types';

/** Everything the pipeline knows about one request — cost is derived here. */
export interface RecordExecutionInput extends Omit<AIExecutionRecord, 'estimatedCost'> {
  estimatedCost?: number;
}

/**
 * Record one AI execution. Best-effort: returns the row id or null; never throws.
 */
export async function recordExecution(input: RecordExecutionInput): Promise<string | null> {
  if (!OBSERVABILITY_FEATURES.recording) return null;
  try {
    const estimatedCost =
      input.estimatedCost ??
      (OBSERVABILITY_FEATURES.costEstimation
        ? estimateCost(input.model, input.promptTokens, input.completionTokens)
        : 0);

    const id = await insertExecution({ ...input, estimatedCost });
    platformEvents.emit(OBSERVABILITY_EVENTS.RECORDED, {
      id,
      provider: input.provider,
      success: input.success,
      totalTokens: input.totalTokens,
      estimatedCost,
    });
    return id;
  } catch (e) {
    // Monitoring must never break the request path.
    platformEvents.emit(OBSERVABILITY_EVENTS.RECORD_FAILED, {
      error: e instanceof Error ? e.message : 'record_failed',
    });
    return null;
  }
}

export { executionStats, recentExecutions, executionsByProvider };
