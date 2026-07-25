// ==========================================================================
// Card Registry — the single place card builders register themselves. The
// planner iterates the registry, so NEW card kinds and FUTURE modules plug in
// with one registerCard() call and appear automatically. globalThis singleton.
// ==========================================================================

import type { CardBuilder, CardKind } from '../types';

type Registry = Map<CardKind, CardBuilder>;
const KEY = '__jivo_experience_cards__';
function registry(): Registry {
  const g = globalThis as Record<string, unknown>;
  if (!g[KEY]) g[KEY] = new Map<CardKind, CardBuilder>();
  return g[KEY] as Registry;
}

/** Register (or override) a card builder. */
export function registerCard(builder: CardBuilder): void {
  registry().set(builder.kind, builder);
}

export function getCard(kind: CardKind): CardBuilder | null {
  return registry().get(kind) ?? null;
}

/** All registered builders, highest priority first (planner consideration order). */
export function listCardBuilders(): CardBuilder[] {
  return [...registry().values()].sort((a, b) => b.priority - a.priority);
}

export function registeredCardKinds(): CardKind[] {
  return listCardBuilders().map((b) => b.kind);
}
