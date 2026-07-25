// ==========================================================================
// AI Experience service — the reusable facade. Runs the full flow:
//
//   plan(intent + business rules, registry-driven) → assemble(order + limit)
//   → emit analytics
//
// Pure & isomorphic (no LLM, no network, no Prisma). Importing this registers the
// built-in card builders (side effect). `planExperience` returns an ExperiencePlan
// (card DESCRIPTORS) for a future Chat UI — it renders nothing itself.
// ==========================================================================

import '../cards'; // register built-in card builders
import { plan as runPlanner } from '../planner';
import { assemble } from '../engine';
import { emitExperienceEvents } from '../analytics';
import type { ExperiencePlan, PlanContext } from '../types';

/**
 * Plan the experience for a StructuredResponse. `emit` (default true) publishes
 * analytics events; pass false for a dry run.
 */
export function planExperience(ctx: PlanContext, emit = true): ExperiencePlan {
  const draft = runPlanner(ctx);
  const plan = assemble(ctx, draft);
  if (emit) emitExperienceEvents(plan);
  return plan;
}

export { listCardBuilders, registeredCardKinds } from '../registry';
