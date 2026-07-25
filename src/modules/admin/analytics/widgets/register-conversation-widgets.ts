// AI/Conversation analytics widgets (Phase 7.1). Real data via the conversation
// data source; UI reuses the shared breakdown / doughnut / facts / placeholder
// widgets. The dashboard reads conversation's widget DESCRIPTORS as data
// (conversation never imports the dashboard).

import { AI_ANALYTICS_WIDGETS } from '@/modules/platform/conversation/analytics';
import { registerAnalyticsWidget } from './registry';
import { makeBreakdownWidget, makeChartWidget, makeFactsWidget, makePlaceholderWidget } from './components';
import type { WidgetCategory, WidgetSize } from './types';

for (const w of AI_ANALYTICS_WIDGETS) {
  const opts = { title: w.title, description: w.description, icon: w.icon };
  const component =
    w.kind === 'placeholder'
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
  });
}
