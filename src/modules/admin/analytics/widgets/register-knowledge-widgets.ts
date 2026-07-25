// Knowledge-specific analytics widgets (Phase 7.0). Real data via the knowledge
// data source; UI reuses the shared breakdown / doughnut / facts widgets, plus a
// client search widget. The dashboard reads knowledge's widget DESCRIPTORS as
// data (knowledge never imports the dashboard).

import { KNOWLEDGE_ANALYTICS_WIDGETS } from '@/modules/platform/knowledge/analytics';
import { registerAnalyticsWidget } from './registry';
import {
  makeBreakdownWidget,
  makeChartWidget,
  makeFactsWidget,
  makePlaceholderWidget,
  KnowledgeSearchWidget,
} from './components';
import type { WidgetCategory, WidgetSize } from './types';

for (const w of KNOWLEDGE_ANALYTICS_WIDGETS) {
  const opts = { title: w.title, description: w.description, icon: w.icon };
  const component =
    w.kind === 'search'
      ? KnowledgeSearchWidget
      : w.kind === 'placeholder'
        ? makePlaceholderWidget(opts)
        : w.kind === 'doughnut'
          ? makeChartWidget({ ...opts, type: 'doughnut', source: 'breakdown' })
          : w.kind === 'facts'
            ? makeFactsWidget(opts)
            : makeBreakdownWidget(opts);

  registerAnalyticsWidget({
    id: w.id,
    title: w.title,
    description: w.description,
    category: w.category as WidgetCategory,
    size: w.size as WidgetSize,
    component,
    client: w.kind === 'search',
  });
}
