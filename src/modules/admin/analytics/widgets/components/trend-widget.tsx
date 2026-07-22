import type { ElementType } from 'react';
import { makeChartWidget } from './chart-widget';

/**
 * Trend chart — now an AREA chart via the single reusable {@link makeChartWidget}
 * / AnalyticsChart (was a CSS bar chart). Kept as a named factory for backward
 * compatibility with existing registrations.
 */
export function makeTrendWidget(opts: { title: string; description: string; icon: ElementType }) {
  return makeChartWidget({ ...opts, type: 'area', source: 'trend' });
}
