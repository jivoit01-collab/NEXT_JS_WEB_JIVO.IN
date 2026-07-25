// AI Provider analytics widgets (Phase 7.3). Real data via the ai-provider data
// source; UI reuses the shared breakdown / facts widgets. The dashboard reads the
// provider's widget DESCRIPTORS as data (ai-provider never imports the dashboard).

import { PROVIDER_ANALYTICS_WIDGETS } from '@/modules/platform/ai-provider/analytics';
import { registerAnalyticsWidget } from './registry';
import { makeBreakdownWidget, makeFactsWidget, makePlaceholderWidget } from './components';
import type { WidgetCategory, WidgetSize } from './types';

for (const w of PROVIDER_ANALYTICS_WIDGETS) {
  const opts = { title: w.title, description: w.description, icon: w.icon };
  const component =
    w.kind === 'facts'
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
