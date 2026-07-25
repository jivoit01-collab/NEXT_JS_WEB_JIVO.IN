// ==========================================================================
// AI Observability — types. Execution METADATA only (for debugging + tuning).
// Stores no conversation content; references it by soft id.
// ==========================================================================

/** Everything recorded for one AI Gateway request. */
export interface AIExecutionRecord {
  correlationId: string;
  conversationId?: string | null;
  messageId?: string | null;
  visitorId?: string | null;
  userId?: string | null;

  channel: string;
  promptTemplate?: string | null;
  promptVersion?: number | null;

  knowledgeVersion?: number | null;
  contextStrategy?: string | null;
  retrievedDocs: number;

  provider?: string | null;
  model?: string | null;
  fromFallback: boolean;

  responseTimeMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;

  experienceCards: number;

  success: boolean;
  errorType?: string | null;
  quality?: number | null;
  feedbackId?: string | null;
}

/** A stored execution row (record + id + createdAt). */
export interface AIExecutionDTO extends AIExecutionRecord {
  id: string;
  createdAt: string;
}

/** Aggregate stats for the Observability dashboard. */
export interface ObservabilityStats {
  totalExecutions: number;
  successRate: number; // 0..1
  avgResponseTimeMs: number;
  totalTokens: number;
  totalEstimatedCost: number;
  fallbackRate: number; // 0..1
}

export const OBSERVABILITY_EVENTS = {
  RECORDED: 'ai:execution_recorded',
  RECORD_FAILED: 'ai:execution_record_failed',
} as const;

export type ObservabilityEventName = (typeof OBSERVABILITY_EVENTS)[keyof typeof OBSERVABILITY_EVENTS];
