// ==========================================================================
// Provider Registry — the single place adapters register themselves.
//
// The platform resolves a provider by name here and (separately) wraps calls with
// resilience + health tracking. The registry knows the INTERFACE, never a concrete
// implementation's internals. globalThis singleton (survives HMR).
// ==========================================================================

import type { AIProvider, ProviderInfo } from '../types';
import { PROVIDER_CONFIG } from '../config';
import { getHealth } from '../health';
import type { ProviderHealth } from '../types';

type Registry = Map<string, AIProvider>;
const KEY = '__jivo_ai_providers__';
function registry(): Registry {
  const g = globalThis as Record<string, unknown>;
  if (!g[KEY]) g[KEY] = new Map<string, AIProvider>();
  return g[KEY] as Registry;
}

export function registerProvider(provider: AIProvider): void {
  registry().set(provider.info.name, provider);
}

export function getProvider(name?: string): AIProvider | null {
  return registry().get(name ?? PROVIDER_CONFIG.defaultProvider) ?? null;
}

export function listProviders(): AIProvider[] {
  return [...registry().values()];
}

export function listProviderInfo(): ProviderInfo[] {
  return listProviders().map((p) => p.info);
}

/** Health snapshots for every registered provider (for the dashboard). */
export function allProviderHealth(): ProviderHealth[] {
  return listProviders().map((p) => getHealth(p.info.name, p.isConfigured()));
}

/**
 * The ordered list of providers to attempt: default (or requested) first, then
 * the configured+implemented fallbacks. Only names that are registered, live and
 * configured are included.
 */
export function resolveProviderChain(preferred?: string): AIProvider[] {
  const order = [preferred ?? PROVIDER_CONFIG.defaultProvider, ...PROVIDER_CONFIG.fallbackOrder];
  const seen = new Set<string>();
  const chain: AIProvider[] = [];
  for (const name of order) {
    if (seen.has(name)) continue;
    seen.add(name);
    const p = registry().get(name);
    if (p && p.info.implemented && p.isConfigured()) chain.push(p);
  }
  return chain;
}
