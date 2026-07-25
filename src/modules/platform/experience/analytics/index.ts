// ==========================================================================
// Experience analytics — placeholder events on the Core Event Bus. A future
// analytics module (or the AI dashboard) can subscribe. No direct tracking.
// ==========================================================================

import { platformEvents } from '@/modules/core/events';
import { EXPERIENCE_EVENTS } from '../types';
import type { ExperiencePlan } from '../types';

/** Emit the analytics events implied by a finished plan. */
export function emitExperienceEvents(plan: ExperiencePlan): void {
  platformEvents.emit(EXPERIENCE_EVENTS.PLANNED, {
    id: plan.id,
    correlationId: plan.metadata.correlationId,
    surface: plan.metadata.surface,
    cardCount: plan.metadata.cardCount,
    intents: plan.intents,
    kinds: plan.cards.map((c) => c.kind),
  });

  for (const card of plan.cards) {
    platformEvents.emit(EXPERIENCE_EVENTS.CARD_ADDED, {
      planId: plan.id,
      kind: card.kind,
      source: card.source,
      confidence: card.confidence,
    });
  }

  if (plan.cards.length === 0) {
    platformEvents.emit(EXPERIENCE_EVENTS.EMPTY, { correlationId: plan.metadata.correlationId });
  }
  if (plan.metadata.truncated) {
    platformEvents.emit(EXPERIENCE_EVENTS.TRUNCATED, { planId: plan.id });
  }
}
