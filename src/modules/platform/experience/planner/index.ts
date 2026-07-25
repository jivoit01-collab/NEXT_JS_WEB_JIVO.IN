// ==========================================================================
// Experience Planner — decides WHAT to show, from intent + business rules, by
// iterating the card registry. The LLM is NOT consulted here: eligibility comes
// from each builder's `canRender` (a business rule) plus feature flags.
//
// Output is an unordered candidate list; the Engine orders + limits + emits.
// ==========================================================================

import { deriveIntents } from '../utils';
import { listCardBuilders } from '../registry';
import { isExperienceFeatureEnabled } from '../config';
import type { ExperienceCard, PlanContext } from '../types';

export interface PlanDraft {
  intents: string[];
  candidates: ExperienceCard[];
}

/** Run the planner: derive intents, then collect eligible cards from the registry. */
export function plan(ctx: PlanContext): PlanDraft {
  if (!isExperienceFeatureEnabled('planner')) {
    return { intents: [], candidates: [] };
  }

  const intents = deriveIntents(ctx.response, ctx.question);
  const candidates: ExperienceCard[] = [];

  // Registry-driven: every registered builder gets a chance (highest priority
  // first). New card kinds / future modules participate with no planner change.
  for (const builder of listCardBuilders()) {
    try {
      if (!builder.canRender(ctx, intents)) continue;
      const cards = builder.build(ctx, intents);
      for (const card of cards) if (card) candidates.push(card);
    } catch {
      // A misbehaving builder must never break the whole plan.
      continue;
    }
  }

  return { intents: [...intents], candidates };
}
