'use server';

// ==========================================================================
// AI Provider server actions — admin-guarded. Read-only surface for now: inspect
// the provider catalog + live health (for a provider-ops dashboard). No public
// generate endpoint is exposed here — a future Chat feature adds its own guarded,
// rate-limited entry point via the service.
// ==========================================================================

import { requireAdminGuard } from '@/modules/core/shared';
import { getProviderCatalog, getProviderHealth } from '../services';

type Fail = { success: false; error: string };
const fail = (e: unknown): Fail => ({ success: false, error: e instanceof Error ? e.message : 'Failed' });

/** List registered providers (name, label, models, implemented). */
export async function listProvidersAction() {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  try {
    return { success: true as const, data: getProviderCatalog() };
  } catch (e) {
    return fail(e);
  }
}

/** Live health/metrics snapshot for every provider. */
export async function providerHealthAction() {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  try {
    return { success: true as const, data: getProviderHealth() };
  } catch (e) {
    return fail(e);
  }
}
