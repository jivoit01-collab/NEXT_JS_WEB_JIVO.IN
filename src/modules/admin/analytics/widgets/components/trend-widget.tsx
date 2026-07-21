import type { ElementType } from 'react';
import { Card } from '@/components/ui/card';
import { PlaceholderPanel } from '../../components/placeholder-panel';
import type { WidgetProps } from '../types';

/**
 * Factory for the trend chart — a dependency-free CSS bar chart from
 * `data.trend` (time buckets). Falls back to the shared placeholder when there's
 * no data. Never a broken chart.
 */
export function makeTrendWidget(opts: { title: string; description: string; icon: ElementType }) {
  function TrendWidget({ data }: WidgetProps) {
    const points = data?.trend ?? [];
    if (points.length === 0) {
      return (
        <PlaceholderPanel
          title={opts.title}
          description={opts.description}
          icon={opts.icon}
          minHeight="min-h-56"
        />
      );
    }

    const max = Math.max(...points.map((p) => p.value), 1);
    const total = points.reduce((s, p) => s + p.value, 0);
    const Icon = opts.icon;

    return (
      <Card className="h-full gap-0 py-0">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3 2xl:px-5">
          <div className="flex items-center gap-2">
            <Icon size={16} className="text-primary shrink-0" />
            <p className="font-jost-medium text-sm 2xl:text-base">{opts.title}</p>
          </div>
          <span className="text-muted-foreground text-xs 2xl:text-sm">
            {total.toLocaleString()} total
          </span>
        </div>
        <div className="flex h-40 items-end gap-[3px] px-4 py-4 2xl:h-48 2xl:px-5">
          {points.map((p) => (
            <div
              key={p.label}
              className="group/bar flex flex-1 flex-col items-center justify-end"
              title={`${p.label}: ${p.value}`}
            >
              <div
                className="bg-primary/60 group-hover/bar:bg-primary w-full rounded-t transition-colors"
                style={{ height: `${Math.max(2, Math.round((p.value / max) * 100))}%` }}
              />
            </div>
          ))}
        </div>
      </Card>
    );
  }
  TrendWidget.displayName = `TrendWidget(${opts.title})`;
  return TrendWidget;
}
