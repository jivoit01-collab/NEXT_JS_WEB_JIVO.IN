import { Info } from 'lucide-react';
import { MetricCardGrid } from '../../components/metric-card';
import {
  OVERVIEW_METRICS,
  MODULE_SUMMARY_METRICS,
  VISITOR_METRICS,
  TRAFFIC_METRICS,
  REPORTS_METRICS,
} from '../../data';
import type { WidgetProps } from '../types';

/**
 * Summary KPI widget — 100% presentation, data-driven with a safe fallback:
 *  - `ready`   → real metric values (platform / module / page / visitors / traffic)
 *  - `empty`   → keeps the cards ("—") + a friendly "no data yet" note
 *  - `error` / `placeholder` / no data → the existing "—" cards, no error UI
 * It never queries anything and never breaks.
 */
export function OverviewWidget({ context, data }: WidgetProps) {
  const fallback =
    context.moduleId === 'visitors'
      ? VISITOR_METRICS
      : context.moduleId === 'traffic'
        ? TRAFFIC_METRICS
        : context.moduleId === 'reports'
          ? REPORTS_METRICS
          : context.scope === 'overview'
            ? OVERVIEW_METRICS
            : MODULE_SUMMARY_METRICS;

  const metrics = data?.metrics ?? fallback;
  const isEmpty = data?.status === 'empty';

  return (
    <div className="space-y-3">
      <MetricCardGrid metrics={metrics} />
      {isEmpty && (
        <p className="text-muted-foreground flex items-center justify-center gap-2 rounded-lg border border-dashed py-3 text-center text-xs 2xl:text-sm">
          <Info size={14} className="shrink-0" />
          No analytics data available yet — start using the website to generate analytics.
        </p>
      )}
    </div>
  );
}
