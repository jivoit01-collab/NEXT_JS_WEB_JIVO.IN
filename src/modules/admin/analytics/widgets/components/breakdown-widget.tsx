import type { ElementType } from 'react';
import { makeChartWidget } from './chart-widget';

/**
 * "Top-N breakdown" widget — now a proper HORIZONTAL BAR chart via the single
 * reusable {@link makeChartWidget} / AnalyticsChart (was a CSS progress-bar list).
 * Kept as a named factory for backward compatibility with existing registrations.
 */
export function makeBreakdownWidget(opts: {
  title: string;
  description: string;
  icon: ElementType;
}) {
  return makeChartWidget({ ...opts, type: 'horizontal-bar', source: 'breakdown' });
}
