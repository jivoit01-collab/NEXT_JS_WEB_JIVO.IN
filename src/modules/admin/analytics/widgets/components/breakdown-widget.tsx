import type { ElementType } from 'react';
import { Card } from '@/components/ui/card';
import { PlaceholderPanel } from '../../components/placeholder-panel';
import type { WidgetProps } from '../types';

/**
 * Factory for a reusable "top-N breakdown" widget — a labelled horizontal bar
 * list (top pages, devices, sources, countries, …). ONE component powers every
 * breakdown; the data source supplies `data.breakdown`. Falls back to the shared
 * placeholder when there's no data (empty/placeholder/error), so it never breaks.
 */
export function makeBreakdownWidget(opts: {
  title: string;
  description: string;
  icon: ElementType;
}) {
  function BreakdownWidget({ data }: WidgetProps) {
    const rows = data?.breakdown ?? [];
    if (rows.length === 0) {
      return <PlaceholderPanel title={opts.title} description={opts.description} icon={opts.icon} />;
    }

    const max = Math.max(...rows.map((r) => r.value), 1);
    const Icon = opts.icon;

    return (
      <Card className="h-full gap-0 py-0">
        <div className="flex items-center gap-2 border-b px-4 py-3 2xl:px-5">
          <Icon size={16} className="text-primary shrink-0" />
          <p className="font-jost-medium text-sm 2xl:text-base">{opts.title}</p>
        </div>
        <ul className="divide-border/60 divide-y">
          {rows.map((r) => (
            <li key={r.label} className="px-4 py-2.5 2xl:px-5">
              <div className="mb-1.5 flex items-center justify-between gap-3 text-xs 2xl:text-sm">
                <span className="text-foreground/90 min-w-0 truncate">{r.label}</span>
                <span className="text-muted-foreground shrink-0 font-jost-medium tabular-nums">
                  {r.value.toLocaleString()}
                  {r.hint ? <span className="ml-1 opacity-70">{r.hint}</span> : null}
                </span>
              </div>
              <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className="bg-primary/70 h-full rounded-full"
                  style={{ width: `${Math.max(3, Math.round((r.value / max) * 100))}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </Card>
    );
  }
  BreakdownWidget.displayName = `BreakdownWidget(${opts.title})`;
  return BreakdownWidget;
}
