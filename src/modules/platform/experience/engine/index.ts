// ==========================================================================
// Experience Engine — turns a PlanDraft into a final ExperiencePlan: order the
// candidate cards, enforce the max-card limit (the answer is always kept and is
// exempt from the cap), and build the plan metadata. Pure; no emit here (the
// service emits) so the engine stays testable.
// ==========================================================================

import { EXPERIENCE_CONFIG } from '../config';
import { stableId } from '../utils';
import type { ExperienceCard, ExperiencePlan, PlanContext } from '../types';
import type { PlanDraft } from '../planner';

function sortCards(cards: ExperienceCard[]): ExperienceCard[] {
  // Primary: order band. Secondary: higher confidence first within a band.
  return [...cards].sort((a, b) => a.order - b.order || b.confidence - a.confidence);
}

/** Assemble the final ordered, limited plan from a draft. */
export function assemble(ctx: PlanContext, draft: PlanDraft): ExperiencePlan {
  const sorted = sortCards(draft.candidates);

  const answer = sorted.filter((c) => c.kind === 'answer');
  const rest = sorted.filter((c) => c.kind !== 'answer');

  const kept = rest.slice(0, EXPERIENCE_CONFIG.maxCards);
  const truncated = rest.length > kept.length;

  const cards = [...answer, ...kept];

  return {
    id: `plan_${stableId(ctx.correlationId, 'plan')}`,
    cards,
    intents: draft.intents,
    metadata: {
      correlationId: ctx.correlationId ?? null,
      surface: ctx.surface ?? null,
      cardCount: cards.length,
      truncated,
      createdAt: null, // stamped at the action boundary (clock-free core)
    },
  };
}
