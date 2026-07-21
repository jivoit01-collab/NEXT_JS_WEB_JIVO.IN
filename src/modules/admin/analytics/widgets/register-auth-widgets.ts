// Auth-specific analytics widgets (Phase 5.1). Placeholder UI via the widget
// platform — the Authentication page lists these ids. The dashboard reads auth's
// widget descriptors as DATA (auth never imports the dashboard).

import { AUTH_ANALYTICS_WIDGETS } from '@/modules/platform/auth/analytics';
import { registerAnalyticsWidget } from './registry';
import { makePlaceholderWidget } from './components';
import type { WidgetCategory, WidgetSize } from './types';

for (const w of AUTH_ANALYTICS_WIDGETS) {
  registerAnalyticsWidget({
    id: w.id,
    title: w.title,
    description: w.description,
    category: w.category as WidgetCategory,
    size: w.size as WidgetSize,
    component: makePlaceholderWidget({ title: w.title, description: w.description, icon: w.icon }),
  });
}
