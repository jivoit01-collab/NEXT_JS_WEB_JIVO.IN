// Feedback-specific analytics widgets (Phase 6). Real data via the feedback
// data source; UI reuses the shared breakdown / facts widgets. The dashboard
// reads feedback's widget DESCRIPTORS as data (feedback never imports the
// dashboard).

import { FEEDBACK_ANALYTICS_WIDGETS } from '@/modules/platform/feedback/analytics';
import { registerAnalyticsWidget } from './registry';
import {
  makeBreakdownWidget,
  makeChartWidget,
  makeTopCommentsWidget,
  RecentFeedbackWidget,
} from './components';
import type { WidgetCategory, WidgetSize } from './types';

for (const w of FEEDBACK_ANALYTICS_WIDGETS) {
  const opts = { title: w.title, description: w.description, icon: w.icon };
  const component =
    w.kind === 'recent'
      ? RecentFeedbackWidget
      : w.kind === 'comments'
        ? makeTopCommentsWidget(opts)
        : w.kind === 'doughnut'
          ? makeChartWidget({ ...opts, type: 'doughnut', source: 'breakdown' })
          : w.kind === 'pie'
            ? makeChartWidget({ ...opts, type: 'pie', source: 'breakdown' })
            : makeBreakdownWidget(opts);

  registerAnalyticsWidget({
    id: w.id,
    title: w.title,
    description: w.description,
    category: w.category as WidgetCategory,
    size: w.size as WidgetSize,
    component,
    client: w.kind === 'recent',
  });
}
