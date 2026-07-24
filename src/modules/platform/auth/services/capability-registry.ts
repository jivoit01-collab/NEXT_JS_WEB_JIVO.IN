// ==========================================================================
// Auth Capability Registry — infrastructure for FUTURE capabilities (Phase 5.1).
//
// Orders, Wishlist, Addresses, Notifications, Customer Dashboard, AI Profile,
// Loyalty, … are registered here as data ONLY (no UI, no routes, all disabled).
// A future phase turns one on by flipping its AUTH_FEATURES flag + `enabled` —
// callers just ask `isAuthCapabilityEnabled(id)`.
// ==========================================================================

import { isAuthFeatureEnabled } from '../config';
import { authCapabilitySchema } from '../validations';
import type { AuthCapabilityDefinition } from '../types';

const globalRef = globalThis as typeof globalThis & {
  __jivoAuthCapabilities?: Map<string, AuthCapabilityDefinition>;
};
const registry: Map<string, AuthCapabilityDefinition> =
  globalRef.__jivoAuthCapabilities ?? new Map();
if (!globalRef.__jivoAuthCapabilities) globalRef.__jivoAuthCapabilities = registry;

/** Register (or replace) a capability. Idempotent by id. */
export function registerAuthCapability(def: AuthCapabilityDefinition): void {
  const parsed = authCapabilitySchema.safeParse(def);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[auth] invalid capability "${def.id}":`, parsed.error.flatten().fieldErrors);
    }
    return;
  }
  registry.set(def.id, def);
}

export function getAuthCapability(id: string): AuthCapabilityDefinition | undefined {
  return registry.get(id);
}

export function getAuthCapabilities(): AuthCapabilityDefinition[] {
  return [...registry.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * A capability is enabled only when: it's flagged `enabled`, its feature flag is
 * on, AND every dependency is itself enabled. Everything is OFF today, so this
 * returns false for all future capabilities — safe by construction.
 */
export function isAuthCapabilityEnabled(id: string, seen = new Set<string>()): boolean {
  if (seen.has(id)) return false; // cycle guard
  seen.add(id);

  const cap = registry.get(id);
  if (!cap || !cap.enabled) return false;
  if (cap.featureFlag && !isAuthFeatureEnabled(cap.featureFlag)) return false;
  return (cap.dependencies ?? []).every((dep) => isAuthCapabilityEnabled(dep, seen));
}
