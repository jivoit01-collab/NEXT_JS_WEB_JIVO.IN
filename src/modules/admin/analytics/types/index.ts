// ==========================================================================
// Business Intelligence Platform — types (Phase 4)
//
// The Analytics dashboard is a registry-driven business module. Every future
// module registers itself; the dashboard + sidebar render from the registry so
// they NEVER need redesign. No data/aggregation is implemented in this phase —
// the interfaces below are the ready-made contracts future phases will fill.
// ==========================================================================

import type { ElementType } from 'react';

/** Grouping used to order/section the dashboard navigation. */
export type AnalyticsCategory = 'overview' | 'cms' | 'audience' | 'reports' | 'business';

/**
 * A single analytics page inside a module (e.g. Our Essence → The Story).
 * Pages are derived from the CMS registry, so a new CMS page automatically
 * gets an analytics page — no analytics code changes.
 */
export interface AnalyticsPageDefinition {
  /** kebab-case id, unique within its module. */
  id: string;
  name: string;
  /** Absolute analytics route, e.g. '/jivo-dev/analytics/our-essence/the-story'. */
  route: string;
  icon?: ElementType;
  /** Optional widget-id list for this page (renderer falls back to defaults). */
  widgets?: string[];
}

/**
 * A registered analytics module. This is the ONLY thing a future feature must
 * provide to appear in the dashboard + sidebar. Modules may contain PAGES
 * (mirroring the CMS hierarchy) so the dashboard scales to hundreds of pages.
 */
export interface AnalyticsModuleDefinition {
  /** Stable unique id, e.g. 'our-essence'. */
  id: string;
  /** Human label shown in the sidebar + page header. */
  name: string;
  /** Lucide (or any) icon component. */
  icon: ElementType;
  /** Absolute admin route (the module's dashboard), e.g. '/jivo-dev/analytics/our-essence'. */
  route: string;
  /** Section/grouping for ordering. */
  category: AnalyticsCategory;
  /** One-line description for the page header. */
  description?: string;
  /** Lower sorts first within a category (default 100). */
  order?: number;
  /**
   * Child pages (CMS-driven). A module WITH pages renders as a collapsible
   * group (Dashboard + pages) in the sidebar. Omit/empty for a leaf module.
   */
  pages?: AnalyticsPageDefinition[];
  /**
   * A standalone leaf (Overview, Visitors, Traffic, Reports, Authentication) —
   * a single sidebar link, never a group. Ignored when `pages` is non-empty.
   */
  standalone?: boolean;
  /** Optional widget-id list for this module's dashboard (falls back to defaults). */
  widgets?: string[];
  /**
   * Optional named placeholder sections for this module's page (e.g. auth →
   * Logins, Registrations, …). When present, the generic module page renders a
   * "coming soon" panel per section instead of the default Chart/Table/Insights.
   * Additive — modules without it keep the default layout.
   */
  sections?: string[];
}

/** A sidebar entry derived from the registry (leaf link or collapsible group). */
export type AnalyticsNavItem =
  | { kind: 'leaf'; id: string; title: string; href: string; icon: ElementType }
  | {
      kind: 'group';
      id: string;
      title: string;
      href: string;
      icon: ElementType;
      children: { id: string; title: string; href: string; icon?: ElementType }[];
    };

/** Date-range presets for the (UI-only) filter. */
export type DateRangePreset = 'today' | '7d' | '30d' | '90d' | 'ytd' | 'all' | 'custom';

// ── Future aggregation contracts (NOT implemented this phase) ──────────────
// These let later phases plug real numbers in without touching the dashboard.

/** A single KPI value rendered by a MetricCard. */
export interface AnalyticsMetric {
  id: string;
  label: string;
  /** Formatted display value; `null` = "no data yet". */
  value: string | number | null;
  /** Optional % change vs the previous period. */
  deltaPct?: number | null;
  /** Optional hint/subtitle. */
  hint?: string;
  icon?: ElementType;
}

// NOTE: the analytics data-source contract now lives in
// `../data-sources` (Phase 4.3) — the richer `AnalyticsDataSource` with
// getOverview/getModule/getPage/getWidget. The old stub was removed.
