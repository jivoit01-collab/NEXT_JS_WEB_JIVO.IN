'use server';

// ==========================================================================
// AI Experience server actions — admin-guarded PREVIEW surface. Lets an admin
// plan the experience for a StructuredResponse (e.g. an experience-studio) and
// inspect the resulting cards. No public surface, no LLM. Reuses the Auth guard.
// The action stamps `createdAt` (the pure core stays clock-free).
// ==========================================================================

import { requireAdminGuard } from '@/modules/core/shared';
import { planExperience } from '../services';
import { registeredCardKinds } from '../registry';
import type { ExperiencePlan, PlanContext } from '../types';

type Fail = { success: false; error: string };
const fail = (e: unknown): Fail => ({ success: false, error: e instanceof Error ? e.message : 'Failed' });

/** Plan cards for a StructuredResponse (admin preview). */
export async function planExperienceAction(input: PlanContext) {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  try {
    const plan: ExperiencePlan = planExperience(input);
    plan.metadata.createdAt = new Date().toISOString();
    return { success: true as const, data: plan };
  } catch (e) {
    return fail(e);
  }
}

/** List the registered card kinds (admin — shows what the planner can render). */
export async function listCardKindsAction() {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  return { success: true as const, data: registeredCardKinds() };
}
