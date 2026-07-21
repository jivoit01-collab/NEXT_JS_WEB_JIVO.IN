// ==========================================================================
// Auth Provider Registry — the auth analog of the analytics registry.
//
// The sign-in UI renders from this registry. A future provider (Microsoft,
// Apple, Facebook, Email/Phone OTP, Enterprise SSO) appears by calling
// `registerAuthProvider({...})` ONCE — no login-page redesign.
//
// Client-safe (pure) so the UI can read it without pulling server code.
// ==========================================================================

import { authProviderSchema } from '../validations';
import type { AuthProviderDefinition } from '../types';

const globalRef = globalThis as typeof globalThis & {
  __jivoAuthProviders?: Map<string, AuthProviderDefinition>;
};
const registry: Map<string, AuthProviderDefinition> =
  globalRef.__jivoAuthProviders ?? new Map();
if (!globalRef.__jivoAuthProviders) globalRef.__jivoAuthProviders = registry;

/** Register (or replace) an auth provider. Idempotent by `id`. */
export function registerAuthProvider(def: AuthProviderDefinition): void {
  const { icon, ...rest } = def;
  const parsed = authProviderSchema.safeParse(rest);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[auth] invalid provider "${def.id}":`, parsed.error.flatten().fieldErrors);
    }
    return;
  }
  registry.set(def.id, { ...def, icon });
}

/** All registered providers, sorted by priority then name. */
export function getAuthProviders(): AuthProviderDefinition[] {
  return [...registry.values()].sort(
    (a, b) => a.priority - b.priority || a.name.localeCompare(b.name),
  );
}

/** Only the providers currently enabled (what the UI should render). */
export function getEnabledAuthProviders(): AuthProviderDefinition[] {
  return getAuthProviders().filter((p) => p.enabled);
}

export function getAuthProvider(id: string): AuthProviderDefinition | undefined {
  return registry.get(id);
}
