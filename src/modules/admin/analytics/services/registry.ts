// ==========================================================================
// Analytics Module Registry — hierarchical (Modules → Pages → Routes).
//
// The dashboard sidebar + routing render from this registry. Modules may carry
// child PAGES (derived from the CMS registry), so the dashboard mirrors the CMS
// hierarchy and scales to hundreds of pages with no redesign. A future module or
// page appears by registering — no sidebar edit, no new route file.
// ==========================================================================

import { analyticsModuleSchema } from '../validations';
import type {
  AnalyticsCategory,
  AnalyticsModuleDefinition,
  AnalyticsNavItem,
  AnalyticsPageDefinition,
} from '../types';

/** Root route of the analytics dashboard (Overview lives here). */
export const ANALYTICS_ROOT = '/jivo-dev/analytics';

/** Display order + labels for categories in the sidebar/dashboard. */
export const CATEGORY_ORDER: Record<AnalyticsCategory, number> = {
  overview: 0,
  cms: 1,
  business: 2,
  audience: 3,
  reports: 4,
};

export const CATEGORY_LABEL: Record<AnalyticsCategory, string> = {
  overview: 'Overview',
  cms: 'Content',
  business: 'Business',
  audience: 'Audience',
  reports: 'Reports',
};

const globalRef = globalThis as typeof globalThis & {
  __jivoAnalyticsRegistry?: Map<string, AnalyticsModuleDefinition>;
};
const registry: Map<string, AnalyticsModuleDefinition> =
  globalRef.__jivoAnalyticsRegistry ?? new Map();
if (!globalRef.__jivoAnalyticsRegistry) globalRef.__jivoAnalyticsRegistry = registry;

/** Register (or replace) an analytics module. Idempotent by `id`. */
export function registerAnalyticsModule(def: AnalyticsModuleDefinition): void {
  const { icon, pages, ...rest } = def;
  const parsed = analyticsModuleSchema.safeParse(rest);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[analytics] invalid module "${def.id}":`, parsed.error.flatten().fieldErrors);
    }
    return;
  }
  registry.set(def.id, { ...def, icon, pages, order: def.order ?? 100 });
}

/** All registered modules, sorted by category then order then name. */
export function getAnalyticsModules(): AnalyticsModuleDefinition[] {
  return [...registry.values()].sort((a, b) => {
    const cat = CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
    if (cat !== 0) return cat;
    const ord = (a.order ?? 100) - (b.order ?? 100);
    if (ord !== 0) return ord;
    return a.name.localeCompare(b.name);
  });
}

/** Look up a module by its exact dashboard route. */
export function getAnalyticsModuleByRoute(route: string): AnalyticsModuleDefinition | undefined {
  return getAnalyticsModules().find((m) => m.route === route);
}

/** Look up a page (and its module) by exact route. */
export function getAnalyticsPageByRoute(
  route: string,
): { module: AnalyticsModuleDefinition; page: AnalyticsPageDefinition } | undefined {
  for (const mod of getAnalyticsModules()) {
    const page = mod.pages?.find((p) => p.route === route);
    if (page) return { module: mod, page };
  }
  return undefined;
}

/** Resolve any analytics route to what should render. */
export type AnalyticsEntry =
  | { type: 'overview'; module: AnalyticsModuleDefinition }
  | { type: 'module'; module: AnalyticsModuleDefinition }
  | { type: 'page'; module: AnalyticsModuleDefinition; page: AnalyticsPageDefinition }
  | { type: 'notfound' };

export function getAnalyticsEntry(route: string): AnalyticsEntry {
  const mod = getAnalyticsModuleByRoute(route);
  if (mod) {
    return mod.route === ANALYTICS_ROOT
      ? { type: 'overview', module: mod }
      : { type: 'module', module: mod };
  }
  const hit = getAnalyticsPageByRoute(route);
  if (hit) return { type: 'page', module: hit.module, page: hit.page };
  return { type: 'notfound' };
}

/** Look up a module by id. */
export function getAnalyticsModule(id: string): AnalyticsModuleDefinition | undefined {
  return registry.get(id);
}

/** Grouped by category (for a sectioned dashboard, if desired). */
export function getAnalyticsModulesByCategory(): Record<string, AnalyticsModuleDefinition[]> {
  const out: Record<string, AnalyticsModuleDefinition[]> = {};
  for (const m of getAnalyticsModules()) {
    (out[m.category] ??= []).push(m);
  }
  return out;
}

/**
 * The sidebar tree. The module header IS the dashboard link, so there is no
 * redundant "Dashboard" child. A module WITH pages is a collapsible group (its
 * pages only); a standalone module or a module with NO pages is a plain leaf
 * (its header links straight to the dashboard). Generated from the registry —
 * hundreds of pages need no sidebar edits.
 */
export function getAnalyticsNavTree(): AnalyticsNavItem[] {
  return getAnalyticsModules()
    // Overview is the Analytics section's own hub (the header links to it), so it
    // is NOT repeated as a separate leaf.
    .filter((m) => m.route !== ANALYTICS_ROOT)
    .map((m) => {
      const pages = m.pages ?? [];
      if (m.standalone || pages.length === 0) {
        return { kind: 'leaf', id: m.id, title: m.name, href: m.route, icon: m.icon };
      }
      const children = pages.map((p) => ({
        id: `${m.id}--${p.id}`,
        title: p.name,
        href: p.route,
        icon: p.icon,
      }));
      return { kind: 'group', id: m.id, title: m.name, href: m.route, icon: m.icon, children };
    });
}
