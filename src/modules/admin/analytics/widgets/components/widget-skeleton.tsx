import { cn } from '@/lib/utils';
import type { WidgetSize } from '../types';

const MIN_H: Record<WidgetSize, string> = {
  small: 'min-h-44',
  medium: 'min-h-44',
  large: 'min-h-56',
  full: 'min-h-44',
};

/** Loading state — a pulsing skeleton matching the widget's footprint. */
export function WidgetSkeleton({ size }: { size: WidgetSize }) {
  // The KPI widget (full) is a row of cards; others are a single panel.
  if (size === 'full') {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card animate-pulse rounded-xl border p-4 2xl:p-5">
            <div className="bg-muted h-3 w-20 rounded" />
            <div className="bg-muted mt-3 h-7 w-16 rounded" />
            <div className="bg-muted/70 mt-2 h-2.5 w-24 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-card flex animate-pulse flex-col items-center justify-center gap-3 rounded-xl border p-6',
        MIN_H[size],
      )}
    >
      <div className="bg-muted h-11 w-11 rounded-xl" />
      <div className="bg-muted h-3 w-28 rounded" />
      <div className="bg-muted/70 h-2.5 w-40 rounded" />
    </div>
  );
}
