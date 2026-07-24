import { GitCompareArrows, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { PlaceholderPanel } from '../../components/placeholder-panel';
import type { WidgetProps } from '../types';

/**
 * Comparison Reports widget — current period vs previous period + difference.
 * Falls back to the shared placeholder when there's insufficient data.
 */
export function ComparisonWidget({ data }: WidgetProps) {
  const rows = data?.comparison ?? [];
  if (rows.length === 0) {
    return (
      <PlaceholderPanel
        title="Comparison reports"
        description="Compare the current period with the previous one."
        icon={GitCompareArrows}
      />
    );
  }

  return (
    <Card className="h-full gap-0 py-0">
      <div className="flex items-center gap-2 border-b px-4 py-3 2xl:px-5">
        <GitCompareArrows size={16} className="text-primary shrink-0" />
        <p className="font-jost-medium text-sm 2xl:text-base">Comparison — last 30 days</p>
      </div>
      <ul className="divide-border/60 divide-y">
        {rows.map((r) => {
          const delta = r.current - r.previous;
          const pct = r.previous > 0 ? Math.round((delta / r.previous) * 100) : r.current > 0 ? 100 : 0;
          const up = delta > 0;
          const flat = delta === 0;
          const DeltaIcon = flat ? Minus : up ? TrendingUp : TrendingDown;
          return (
            <li key={r.label} className="px-4 py-3 2xl:px-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-foreground/90 text-sm font-jost-medium">{r.label}</span>
                <span
                  className={cn(
                    'flex items-center gap-1 text-xs font-jost-medium 2xl:text-sm',
                    flat ? 'text-muted-foreground' : up ? 'text-emerald-600' : 'text-red-500',
                  )}
                >
                  <DeltaIcon size={13} />
                  {up ? '+' : ''}
                  {pct}%
                </span>
              </div>
              <div className="text-muted-foreground mt-1 flex items-center gap-4 text-xs 2xl:text-sm">
                <span>
                  Current: <span className="text-foreground/80 tabular-nums">{r.current.toLocaleString()}</span>
                </span>
                <span>
                  Previous: <span className="text-foreground/80 tabular-nums">{r.previous.toLocaleString()}</span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
