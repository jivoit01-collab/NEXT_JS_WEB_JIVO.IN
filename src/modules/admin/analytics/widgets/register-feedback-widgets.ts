// Feedback-specific analytics widgets (Phase 6). Real data via the feedback
// data source; UI reuses the shared breakdown / facts widgets. The dashboard
// reads feedback's widget DESCRIPTORS as data (feedback never imports the
// dashboard).

import { FEEDBACK_ANALYTICS_WIDGETS } from '@/modules/platform/feedback/analytics';
import { registerAnalyticsWidget } from './registry';
import { makeBreakdownWidget, makeFactsWidget } from './components';
import type { WidgetCategory, WidgetSize } from './types';

for (const w of FEEDBACK_ANALYTICS_WIDGETS) {
  const component =
    w.kind === 'facts'
      ? makeFactsWidget({ title: w.title, description: w.description, icon: w.icon })
      : makeBreakdownWidget({ title: w.title, description: w.description, icon: w.icon });

  registerAnalyticsWidget({
    id: w.id,
    title: w.title,
    description: w.description,
    category: w.category as WidgetCategory,
    size: w.size as WidgetSize,
    component,
  });
}
