import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { formatDelta, formatMetricValue } from '../utils';
import type { AnalyticsMetric } from '../types';

/**
 * Reusable KPI card. Presentational + data-agnostic — pass any `AnalyticsMetric`.
 * With `value: null` it renders the shared "no data yet" empty state ("—").
 */
export function MetricCard({ metric }: { metric: AnalyticsMetric }) {
  const Icon = metric.icon;
  const hasData = metric.value !== null && metric.value !== undefined;
  const delta = formatDelta(metric.deltaPct);
  const deltaUp = (metric.deltaPct ?? 0) >= 0;

  return (
    <Card className="group gap-0 py-0 transition-all duration-300 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3 p-4 2xl:p-5">
        <div className="min-w-0">
          <p className="text-muted-foreground truncate text-[11px] font-jost-medium uppercase tracking-wider 2xl:text-xs">
            {metric.label}
          </p>
          <p
            className={cn(
              'mt-2 font-jost-bold text-2xl 2xl:text-3xl',
              hasData ? 'text-foreground' : 'text-muted-foreground/40',
            )}
          >
            {formatMetricValue(metric.value)}
          </p>
          <div className="mt-1 flex items-center gap-2">
            {metric.hint && (
              <span className="text-muted-foreground text-[11px] 2xl:text-xs">{metric.hint}</span>
            )}
            {delta && (
              <span
                className={cn(
                  'text-[11px] font-jost-medium 2xl:text-xs',
                  deltaUp ? 'text-emerald-600' : 'text-red-500',
                )}
              >
                {delta}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110 2xl:h-11 2xl:w-11">
            <Icon size={18} className="text-primary" />
          </div>
        )}
      </div>
    </Card>
  );
}

/** Responsive grid of metric cards. */
export function MetricCardGrid({ metrics }: { metrics: AnalyticsMetric[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:gap-4">
      {metrics.map((m) => (
        <MetricCard key={m.id} metric={m} />
      ))}
    </div>
  );
}
