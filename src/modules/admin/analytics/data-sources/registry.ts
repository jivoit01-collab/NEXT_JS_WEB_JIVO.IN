// ==========================================================================
// Data Source Registry — register once, resolve by context.
//
// A future module registers its OWN data source for its module id; the default
// catch-all serves everything else. No dashboard/renderer changes ever.
// ==========================================================================

import type { WidgetContext, WidgetData } from '../widgets/types';
import type { AnalyticsDataSource, AnalyticsDataSourceRegistration } from './types';

const globalRef = globalThis as typeof globalThis & {
  __jivoAnalyticsDataSources?: Map<string, AnalyticsDataSourceRegistration>;
};
const registry: Map<string, AnalyticsDataSourceRegistration> =
  globalRef.__jivoAnalyticsDataSources ?? new Map();
if (!globalRef.__jivoAnalyticsDataSources) globalRef.__jivoAnalyticsDataSources = registry;

/** Register (or replace) a data source. Idempotent by id. */
export function registerAnalyticsDataSource(reg: AnalyticsDataSourceRegistration): void {
  if (!reg.id || typeof reg.source?.getWidget !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[analytics] invalid data source registration:', reg?.id);
    }
    return;
  }
  registry.set(reg.id, reg);
}

export function getAnalyticsDataSources(): AnalyticsDataSourceRegistration[] {
  return [...registry.values()].sort((a, b) => b.priority - a.priority);
}

function matches(reg: AnalyticsDataSourceRegistration, moduleId?: string): boolean {
  if (!reg.enabled) return false;
  if (!reg.modules || reg.modules.length === 0 || reg.modules.includes('*')) return true;
  return moduleId ? reg.modules.includes(moduleId) : false;
}

/**
 * Resolve the best data source for a context: the highest-priority enabled
 * source whose scope matches the module (catch-all wins if none is scoped).
 */
export function resolveDataSource(context: WidgetContext): AnalyticsDataSource | null {
  const candidates = getAnalyticsDataSources().filter((r) => matches(r, context.moduleId));
  return candidates[0]?.source ?? null;
}

/** The renderer's entry point — one widget's data (never throws). */
export async function loadWidgetData(
  context: WidgetContext,
  widgetId: string,
): Promise<WidgetData> {
  const source = resolveDataSource(context);
  if (!source) return { status: 'placeholder' };
  try {
    return await source.getWidget(widgetId, context);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[analytics] data source failed for widget "${widgetId}"`, err);
    }
    return { status: 'error' };
  }
}
