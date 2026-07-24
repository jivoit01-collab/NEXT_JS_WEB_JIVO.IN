// ==========================================================================
// Analytics Data Source layer — types (Phase 4.3)
//
// Separates WIDGETS from the database. Widgets never touch Prisma; they receive
// `WidgetData` from a registered data source:
//
//     Widget ◀── Renderer ◀── Data Source ◀── Core Analytics ◀── Prisma
//
// Today every source returns placeholder data (no queries). A future source
// swaps the body — widgets work unchanged.
// ==========================================================================

import type { WidgetContext, WidgetData } from '../widgets/types';

/** A whole page's data — per-widget, keyed by widget id (may be empty). */
export interface AnalyticsPageData {
  scope: WidgetContext['scope'];
  title: string;
  /** ISO timestamp the data was produced (stamped by the caller, not the source). */
  generatedAt?: string;
  /** Pre-computed per-widget data. Empty → renderer falls back to `getWidget`. */
  widgets: Record<string, WidgetData>;
}

/**
 * The contract a data source implements. Methods are async so a real source can
 * consume the Core Analytics Platform (events / sessions / visitors) via Prisma
 * without changing any widget or the renderer.
 */
export interface AnalyticsDataSource {
  getOverview(ctx: WidgetContext): Promise<AnalyticsPageData>;
  getModule(moduleId: string, ctx: WidgetContext): Promise<AnalyticsPageData>;
  getPage(moduleId: string, pageId: string, ctx: WidgetContext): Promise<AnalyticsPageData>;
  /** The renderer's primary call — one widget's data. */
  getWidget(widgetId: string, ctx: WidgetContext): Promise<WidgetData>;
}

/** Registration record for a data source (scoped + prioritised). */
export interface AnalyticsDataSourceRegistration {
  id: string;
  source: AnalyticsDataSource;
  /** Module ids this source serves. Omit / ['*'] = catch-all. */
  modules?: string[];
  /** Optional finer scope (informational — matching is by module today). */
  pages?: string[];
  widgets?: string[];
  enabled: boolean;
  /** Higher wins when multiple sources match a context. */
  priority: number;
}

export type { WidgetData };
