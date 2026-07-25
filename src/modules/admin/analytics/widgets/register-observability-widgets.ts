// AI Observability analytics widgets (Phase 7.9). Real data via the observability
// data source; UI reuses the shared doughnut / breakdown / facts widgets. The
// dashboard reads observability's widget DESCRIPTORS as data.

import { OBSERVABILITY_ANALYTICS_WIDGETS } from '@/modules/platform/observability/analytics';
import { registerAnalyticsWidget } from './registry';
import { makeBreakdownWidget, makeChartWidget, makeFactsWidget, makePlaceholderWidget } from './components';
import type { WidgetCategory, WidgetSize } from './types';

for (const w of OBSERVABILITY_ANALYTICS_WIDGETS) {
  const opts = { title: w.title, description: w.description, icon: w.icon };
  const component =
    w.kind === 'doughnut'
      ? makeChartWidget({ ...opts, type: 'doughnut', source: 'breakdown' })
      : w.kind === 'facts'
        ? makeFactsWidget(opts)
        : w.kind === 'breakdown'
          ? makeBreakdownWidget(opts)
          : makePlaceholderWidget(opts);

  registerAnalyticsWidget({
    id: w.id,
    title: w.title,
    description: w.description,
    category: w.category as WidgetCategory,
    size: w.size as WidgetSize,
    component,
  });
}
