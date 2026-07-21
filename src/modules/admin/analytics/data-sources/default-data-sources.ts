// The default (catch-all) analytics data source — now backed by REAL data from
// the Core Analytics Platform (Phase 4.4), with a complete fallback.
//
// Only the `overview` (KPI) widget consumes data today; it returns real metrics
// (or a friendly empty/placeholder state). All other widgets have no real source
// yet → `placeholder` (their existing "coming soon" UI). A future module
// registers a HIGHER-priority source for its module id to override this.

import type { WidgetContext, WidgetData } from '../widgets/types';
import { registerAnalyticsDataSource } from './registry';
import {
  getOverviewData,
  getModuleData,
  getVisitorKpis,
  getTrafficKpis,
  getTrend,
  getBreakdown,
  getReportsKpis,
  getReportsActivity,
  getReportsComparison,
} from './queries';
import type { AnalyticsDataSource, AnalyticsPageData } from './types';

const BREAKDOWN_WIDGETS = new Set([
  'top-pages',
  'top-cta',
  'top-modules',
  'traffic-sources',
  'referrers',
  'landing-pages',
  'devices',
  'countries',
  'browsers',
  'os',
  'languages',
  'new-returning',
]);

function emptyPage(scope: WidgetContext['scope'], title: string): AnalyticsPageData {
  // Empty per-widget map → the renderer resolves each widget via getWidget().
  return { scope, title, widgets: {} };
}

export const defaultAnalyticsDataSource: AnalyticsDataSource = {
  async getOverview(ctx) {
    return emptyPage('overview', ctx.title);
  },
  async getModule(_moduleId, ctx) {
    return emptyPage('module', ctx.title);
  },
  async getPage(_moduleId, _pageId, ctx) {
    return emptyPage('page', ctx.title);
  },
  async getWidget(widgetId, ctx): Promise<WidgetData> {
    // KPI summary — scope-aware (platform / module / page / visitors / traffic / reports).
    if (widgetId === 'overview') {
      if (ctx.moduleId === 'visitors') return getVisitorKpis();
      if (ctx.moduleId === 'traffic') return getTrafficKpis();
      if (ctx.moduleId === 'reports') return getReportsKpis();
      return ctx.scope === 'overview' ? getOverviewData() : getModuleData(ctx);
    }
    if (widgetId === 'trend') return getTrend(ctx);
    if (widgetId === 'report-activity') return getReportsActivity();
    if (widgetId === 'report-comparison') return getReportsComparison();
    if (BREAKDOWN_WIDGETS.has(widgetId)) return getBreakdown(widgetId, ctx);
    // Scroll-depth / CTA-perf / insights / auth / export / saved / scheduled → placeholder.
    return { status: 'placeholder' };
  },
};

// Catch-all: lowest priority, so any future module-scoped source overrides it.
registerAnalyticsDataSource({
  id: 'default',
  source: defaultAnalyticsDataSource,
  modules: ['*'],
  enabled: true,
  priority: 0,
});
