// ==========================================================================
// Analytics Data Sources (Phase 4.3) — the layer between widgets and the DB.
//
// Importing this barrel registers the default (placeholder) source, then exposes
// the registry API. The WidgetRenderer imports `loadWidgetData` from here.
// ==========================================================================

import './default-data-sources';
import './feedback-source';

export {
  registerAnalyticsDataSource,
  getAnalyticsDataSources,
  resolveDataSource,
  loadWidgetData,
} from './registry';

export { defaultAnalyticsDataSource } from './default-data-sources';

export type {
  AnalyticsDataSource,
  AnalyticsDataSourceRegistration,
  AnalyticsPageData,
  WidgetData,
} from './types';
