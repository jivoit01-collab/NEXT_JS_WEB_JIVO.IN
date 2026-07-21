// ==========================================================================
// Analytics Widgets (Phase 4.2) — register-once, render-anywhere.
//
// Importing this barrel registers the default widget library (side effect),
// then exposes the renderer + registry API + default configs. Page renderers
// import from here; that guarantees the widgets exist before rendering.
// ==========================================================================

import './register-default-widgets';
import './register-auth-widgets';

export { WidgetRenderer } from './widget-renderer';
export {
  registerAnalyticsWidget,
  getAnalyticsWidget,
  getAnalyticsWidgets,
  resolveWidgets,
} from './registry';
export {
  DEFAULT_OVERVIEW_WIDGETS,
  DEFAULT_MODULE_WIDGETS,
  DEFAULT_PAGE_WIDGETS,
} from './defaults';
export { makePlaceholderWidget } from './components';
export type {
  AnalyticsWidgetDefinition,
  WidgetCategory,
  WidgetSize,
  WidgetContext,
  WidgetProps,
} from './types';
