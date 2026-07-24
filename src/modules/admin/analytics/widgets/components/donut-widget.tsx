import type { ElementType } from 'react';
import { makeChartWidget } from './chart-widget';

/**
 * Doughnut breakdown widget — delegates to the single reusable
 * {@link makeChartWidget} / AnalyticsChart. Kept as a named factory for backward
 * compatibility with existing registrations (Traffic Sources, Devices, …).
 */
export function makeDonutWidget(opts: { title: string; description: string; icon: ElementType }) {
  return makeChartWidget({ ...opts, type: 'doughnut', source: 'breakdown' });
}
