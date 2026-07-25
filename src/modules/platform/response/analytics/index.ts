// ==========================================================================
// Response analytics — placeholder events on the Core Event Bus. A future
// analytics module (or the AI dashboard) can subscribe. No direct tracking, so
// consent handling stays centralized in the platform.
// ==========================================================================

import { platformEvents } from '@/modules/core/events';
import { RESPONSE_EVENTS } from '../types';
import type { StructuredResponse } from '../types';

/** Emit the analytics events implied by a processed response. */
export function emitResponseEvents(res: StructuredResponse): void {
  platformEvents.emit(RESPONSE_EVENTS.PROCESSED, {
    id: res.id,
    provider: res.provider,
    model: res.model,
    valid: res.validation.valid,
    quality: res.validation.quality,
    tokens: res.usage.totalTokens,
    responseTimeMs: res.responseTimeMs,
    fromFallback: res.fromFallback,
    correlationId: res.metadata.correlationId,
  });

  if (!res.validation.valid) {
    platformEvents.emit(RESPONSE_EVENTS.VALIDATION_FAILED, {
      id: res.id,
      issues: res.validation.issues.map((i) => i.code),
    });
  }
  if (res.citations.length) {
    platformEvents.emit(RESPONSE_EVENTS.CITATIONS_EXTRACTED, {
      id: res.id,
      count: res.citations.length,
      resolved: res.citations.filter((c) => c.resolved).length,
    });
  }
  if (res.actions.length) {
    platformEvents.emit(RESPONSE_EVENTS.ACTIONS_SUGGESTED, {
      id: res.id,
      types: res.actions.map((a) => a.type),
    });
  }
  if (res.lead.isLead) {
    platformEvents.emit(RESPONSE_EVENTS.LEAD_DETECTED, {
      id: res.id,
      score: res.lead.score,
      reasons: res.lead.reasons,
    });
  }
  if (res.lead.wantsContact) {
    platformEvents.emit(RESPONSE_EVENTS.CONTACT_REQUESTED, {
      id: res.id,
      hasEmail: Boolean(res.lead.contact.email),
      hasPhone: Boolean(res.lead.contact.phone),
    });
  }
}
