// ==========================================================================
// Admin / Analytics — Business Intelligence Platform (Phase 4) public barrel.
//
// Registry-driven analytics dashboard. Future modules appear by calling
// `registerAnalyticsModule({...})` once — no sidebar/route/layout changes.
//
// NOTE: server-only actions live at '@/modules/admin/analytics/actions'; the
// registry (client-safe) at '@/modules/admin/analytics/services'. Keep those
// import paths specific to avoid pulling server code into client bundles.
//
// Docs: docs/business-intelligence-platform.md
// ==========================================================================

export {
  ANALYTICS_ROOT,
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  registerAnalyticsModule,
  getAnalyticsModules,
  getAnalyticsModule,
  getAnalyticsModuleByRoute,
  getAnalyticsPageByRoute,
  getAnalyticsModulesByCategory,
  getAnalyticsNavTree,
  getAnalyticsEntry,
  type AnalyticsEntry,
} from './services';

export { OverviewPage, ModuleAnalyticsPage, ModuleDashboardPage } from './pages';

export {
  AnalyticsLayout,
  MetricCard,
  MetricCardGrid,
  PlaceholderPanel,
  SectionHeading,
} from './components';

export { OVERVIEW_METRICS, MODULE_SUMMARY_METRICS } from './data';

// Widget architecture (Phase 4.2) — register once, render anywhere.
export {
  WidgetRenderer,
  registerAnalyticsWidget,
  getAnalyticsWidget,
  getAnalyticsWidgets,
  makePlaceholderWidget,
  DEFAULT_OVERVIEW_WIDGETS,
  DEFAULT_MODULE_WIDGETS,
  DEFAULT_PAGE_WIDGETS,
} from './widgets';
export type {
  AnalyticsWidgetDefinition,
  WidgetCategory,
  WidgetSize,
  WidgetContext,
  WidgetProps,
} from './widgets';

export type {
  AnalyticsModuleDefinition,
  AnalyticsPageDefinition,
  AnalyticsNavItem,
  AnalyticsCategory,
  AnalyticsMetric,
  DateRangePreset,
} from './types';

// Analytics Data Source layer (Phase 4.3) — widgets receive data, never DB.
export {
  registerAnalyticsDataSource,
  getAnalyticsDataSources,
  resolveDataSource,
  loadWidgetData,
  defaultAnalyticsDataSource,
} from './data-sources';
export type {
  AnalyticsDataSource,
  AnalyticsDataSourceRegistration,
  AnalyticsPageData,
  WidgetData,
} from './data-sources';
