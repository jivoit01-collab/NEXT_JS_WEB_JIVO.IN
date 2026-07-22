// ==========================================================================
// Widget Registry — register once, render anywhere.
//
// Pages reference widgets by id; this registry resolves them. A future widget
// (Revenue, Inventory, Chats, …) appears by calling registerAnalyticsWidget()
// once — no renderer or page changes.
// ==========================================================================

import type { AnalyticsWidgetDefinition, WidgetSize } from './types';

const SIZES: readonly WidgetSize[] = ['small', 'medium', 'large', 'full'];

const globalRef = globalThis as typeof globalThis & {
  __jivoAnalyticsWidgets?: Map<string, AnalyticsWidgetDefinition>;
};
const registry: Map<string, AnalyticsWidgetDefinition> =
  globalRef.__jivoAnalyticsWidgets ?? new Map();
if (!globalRef.__jivoAnalyticsWidgets) globalRef.__jivoAnalyticsWidgets = registry;

/** Register (or replace) a widget. Idempotent by id. */
export function registerAnalyticsWidget(def: AnalyticsWidgetDefinition): void {
  if (!def.id || typeof def.component !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[analytics] invalid widget registration:', def?.id);
    }
    return;
  }
  registry.set(def.id, { enabled: true, order: 100, ...def });
}

export function getAnalyticsWidget(id: string): AnalyticsWidgetDefinition | undefined {
  return registry.get(id);
}

/** All registered widgets, sorted by order then title. */
export function getAnalyticsWidgets(): AnalyticsWidgetDefinition[] {
  return [...registry.values()].sort(
    (a, b) => (a.order ?? 100) - (b.order ?? 100) || a.title.localeCompare(b.title),
  );
}

/**
 * Resolve an ordered list of widget ids to their definitions (skips unknown/
 * disabled). A config entry may carry a per-page SIZE OVERRIDE as `id@size`
 * (e.g. `visitors-trend@medium`), so the same widget can be full-width on one
 * page and half-width on another without a duplicate registration.
 */
export function resolveWidgets(ids: string[]): AnalyticsWidgetDefinition[] {
  const out: AnalyticsWidgetDefinition[] = [];
  for (const entry of ids) {
    const [id, sizeRaw] = entry.split('@');
    const w = registry.get(id);
    if (!w) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[analytics] unknown widget "${id}" — skipped`);
      }
      continue;
    }
    if (w.enabled === false) continue;
    const size = SIZES.includes(sizeRaw as WidgetSize) ? (sizeRaw as WidgetSize) : w.size;
    out.push(size === w.size ? w : { ...w, size });
  }
  return out;
}
