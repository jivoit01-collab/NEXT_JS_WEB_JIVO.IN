// Importing this module registers all analytics modules (side effects), then
// exposes the registry API. Registration order: standalone core (Overview/
// Visitors/Traffic/Reports) → CMS-generated modules+pages → platform (auth).

import './register-core-modules';
import './register-cms-modules';
import './register-platform-modules';

export {
  ANALYTICS_ROOT,
  CATEGORY_ORDER,
  CATEGORY_LABEL,
  registerAnalyticsModule,
  getAnalyticsModules,
  getAnalyticsModule,
  getAnalyticsModuleByRoute,
  getAnalyticsPageByRoute,
  getAnalyticsModulesByCategory,
  getAnalyticsNavTree,
  getAnalyticsEntry,
  type AnalyticsEntry,
} from './registry';
