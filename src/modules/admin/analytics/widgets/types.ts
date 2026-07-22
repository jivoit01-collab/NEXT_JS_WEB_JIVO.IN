// ==========================================================================
// Analytics Widget Architecture — types (Phase 4.2)
//
// Every analytics page is built by a renderer from a list of widget ids. Widgets
// are registered (never hardcoded), so a future module adds capability by
// registering widgets + listing them — no page components, no dashboard changes.
// ==========================================================================

import type { ComponentType, ElementType } from 'react';
import type { AnalyticsMetric } from '../types';

/** Widget grouping. Additive — new categories just extend this union. */
export type WidgetCategory =
  | 'summary'
  | 'charts'
  | 'tables'
  | 'insights'
  | 'maps'
  | 'funnels'
  | 'conversions'
  | 'traffic'
  | 'engagement'
  | 'custom';

/** Layout footprint on the responsive grid. */
export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

/** What a page/module a widget is rendering for (passed to every widget). */
export interface WidgetContext {
  scope: 'overview' | 'module' | 'page';
  /** Display name of the current overview/module/page. */
  title: string;
  moduleId?: string;
  moduleName?: string;
  moduleRoute?: string;
  pageId?: string;
  /** Child pages (module scope) — used by the navigation widget. */
  pages?: { id: string; name: string; route: string; icon?: ElementType }[];
}

/**
 * A SERIALIZABLE subset of WidgetContext safe to pass to Client Components. It
 * drops `pages` (whose entries carry lucide icon COMPONENTS, which cannot cross
 * the server→client boundary). Used by the toolbar CSV export.
 */
export type AnalyticsExportContext = Pick<
  WidgetContext,
  'scope' | 'title' | 'moduleId' | 'moduleName' | 'moduleRoute' | 'pageId'
>;

/**
 * Lifecycle of a widget's data:
 *  - `loading`     — fetch in flight (renderer shows a skeleton via Suspense)
 *  - `ready`       — real data available
 *  - `empty`       — queried successfully but nothing tracked yet
 *  - `placeholder` — no real source for this widget yet (coming-soon UI)
 *  - `error`       — fetch failed (renderer falls back to placeholder, no error UI)
 */
export type WidgetDataStatus = 'loading' | 'ready' | 'empty' | 'placeholder' | 'error';

/** A single labelled value — used by breakdown lists and trend charts. */
export interface WidgetDatum {
  label: string;
  value: number;
  /** Optional secondary text (e.g. a percentage or sublabel). */
  hint?: string;
}

/** A labelled text fact (recent activity, etc.). */
export interface WidgetFact {
  label: string;
  value: string;
}

/** A current-vs-previous comparison row. */
export interface WidgetComparison {
  label: string;
  current: number;
  previous: number;
}

/**
 * A single feedback record surfaced to a widget (Recent Feedback table, Top
 * Comments). Fully serializable so client widgets can render/filter it and open
 * a detail dialog. Produced by the feedback data source from its DTOs.
 */
export interface WidgetFeedbackRecord {
  id: string;
  type: string;
  rating: number | null;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | null;
  message: string | null;
  contact: string | null;
  contactType: string | null;
  source: string;
  page: string | null;
  /** ISO timestamp. */
  createdAt: string;
}

/**
 * The data a widget renders. Produced by the Analytics Data Source layer, NOT by
 * the widget itself — widgets are 100% presentation.
 */
export interface WidgetData {
  status: WidgetDataStatus;
  /** Summary metrics (KPI/summary widgets). */
  metrics?: AnalyticsMetric[];
  /** Ranked breakdown rows (top pages, devices, sources, …). */
  breakdown?: WidgetDatum[];
  /** Time-bucketed series for the trend chart. */
  trend?: WidgetDatum[];
  /** Labelled text facts (recent activity). */
  facts?: WidgetFact[];
  /** Current-vs-previous comparison rows. */
  comparison?: WidgetComparison[];
  /** Optional grand total (for percentages / context). */
  total?: number;
  /** Feedback records (Recent Feedback table, Top Comments). */
  records?: WidgetFeedbackRecord[];
  /** Freeform extras. */
  meta?: Record<string, unknown>;
}

/** Props every widget component receives. Data is injected by the renderer. */
export interface WidgetProps {
  context: WidgetContext;
  /** Data resolved from the registered data source (placeholder for now). */
  data?: WidgetData;
}

/** A registered widget. `component` renders the (placeholder for now) UI. */
export interface AnalyticsWidgetDefinition {
  id: string;
  title: string;
  description?: string;
  category: WidgetCategory;
  component: ComponentType<WidgetProps>;
  size: WidgetSize;
  /** Order hint when auto-listing (config order wins in the renderer). */
  order?: number;
  /** Default true. A disabled widget is skipped by the renderer. */
  enabled?: boolean;
  /** Reserved for future authorization. */
  permissions?: string[];
  /** Optional platform feature flag that also gates the widget. */
  featureFlag?: string;
  /**
   * The component is a Client Component. The renderer then hands it a SERIALIZABLE
   * context (page icons stripped), since server→client props can't carry the
   * lucide icon components in `context.pages`.
   */
  client?: boolean;
}
