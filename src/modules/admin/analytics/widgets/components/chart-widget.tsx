import type { ElementType } from 'react';
import { Card } from '@/components/ui/card';
import { AnalyticsChart, type AnalyticsChartType } from './analytics-chart';
import type { WidgetProps } from '../types';

/**
 * THE single chart-widget factory. Every chart/breakdown/trend widget in the
 * registry is built from this — it wraps the ONE reusable {@link AnalyticsChart}
 * in the standard titled Card and feeds it the right slice of the widget data.
 * No page-specific chart widgets exist; only the config (type/source) differs.
 *
 * `source` picks the data field: 'trend' → time series (line/area), 'breakdown'
 * → ranked rows (bar/pie/doughnut/horizontal-bar). Empty data renders the
 * chart's own professional empty state, so the layout never breaks.
 */
export function makeChartWidget(opts: {
  title: string;
  description: string;
  icon: ElementType;
  type: AnalyticsChartType;
  source?: 'trend' | 'breakdown';
  /** Chart plot height in px (default 200; trends read better taller). */
  height?: number;
}) {
  const source = opts.source ?? (opts.type === 'line' || opts.type === 'area' ? 'trend' : 'breakdown');

  function ChartWidget({ data }: WidgetProps) {
    const rows = (source === 'trend' ? data?.trend : data?.breakdown) ?? [];
    const Icon = opts.icon;
    const total = rows.reduce((s, r) => s + r.value, 0);

    return (
      <Card className="h-full gap-0 py-0">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3 2xl:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <Icon size={16} className="text-primary shrink-0" />
            <p className="font-jost-medium truncate text-sm 2xl:text-base">{opts.title}</p>
          </div>
          {source === 'trend' && rows.length > 0 && (
            <span className="text-muted-foreground shrink-0 text-xs 2xl:text-sm">
              {total.toLocaleString()} total
            </span>
          )}
        </div>
        <div className="p-4 2xl:p-5">
          <AnalyticsChart
            type={opts.type}
            data={rows}
            height={opts.height ?? (source === 'trend' ? 176 : 160)}
            emptyMessage={opts.description}
          />
        </div>
      </Card>
    );
  }
  ChartWidget.displayName = `ChartWidget(${opts.title}:${opts.type})`;
  return ChartWidget;
}
