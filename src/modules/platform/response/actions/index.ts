'use server';

// ==========================================================================
// AI Response server actions — admin-guarded PREVIEW surface. Lets an admin
// process a raw provider response (e.g. from a response-studio) and inspect the
// structured object. No public surface, no LLM. Reuses the Auth Platform guard.
// The action stamps `createdAt` (the pure core stays clock-free).
// ==========================================================================

import { requireAdminGuard } from '@/modules/core/shared';
import { processResponse } from '../services';
import type { ProcessResponseRequest, StructuredResponse } from '../types';

type Fail = { success: false; error: string };
const fail = (e: unknown): Fail => ({ success: false, error: e instanceof Error ? e.message : 'Failed' });

/** Process + structure a raw provider response (admin preview). */
export async function processResponseAction(input: ProcessResponseRequest) {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  try {
    const structured: StructuredResponse = processResponse(input);
    structured.metadata.createdAt = new Date().toISOString();
    return { success: true as const, data: structured };
  } catch (e) {
    return fail(e);
  }
}
