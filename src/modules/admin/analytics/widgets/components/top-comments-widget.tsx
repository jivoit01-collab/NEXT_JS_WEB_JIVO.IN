import type { ElementType } from 'react';
import { Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PlaceholderPanel } from '../../components/placeholder-panel';
import type { WidgetProps } from '../types';

/**
 * "Top good comments" — the highest-rated feedback that left a written comment
 * (top 5, from the feedback source). Pure presentation; server component. Falls
 * back to the shared placeholder when there's nothing to show.
 */
export function makeTopCommentsWidget(opts: { title: string; description: string; icon: ElementType }) {
  function TopCommentsWidget({ data }: WidgetProps) {
    const records = data?.records ?? [];
    if (records.length === 0) {
      return <PlaceholderPanel title={opts.title} description={opts.description} icon={opts.icon} />;
    }
    const Icon = opts.icon;
    return (
      <Card className="h-full gap-0 py-0">
        <div className="flex items-center gap-2 border-b px-4 py-3 2xl:px-5">
          <Icon size={16} className="text-primary shrink-0" />
          <p className="font-jost-medium text-sm 2xl:text-base">{opts.title}</p>
        </div>
        <ul className="divide-border/60 divide-y">
          {records.map((r) => (
            <li key={r.id} className="px-4 py-3 2xl:px-5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-0.5" aria-label={`${r.rating ?? 0} out of 5`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={i < (r.rating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'}
                    />
                  ))}
                </span>
                <span className="text-muted-foreground text-[11px] 2xl:text-xs">{r.type}</span>
              </div>
              <p className="text-foreground/90 mt-1 text-xs leading-snug 2xl:text-sm">{r.message}</p>
              {r.contact && (
                <p className="text-muted-foreground mt-0.5 truncate text-[11px]">— {r.contact}</p>
              )}
            </li>
          ))}
        </ul>
      </Card>
    );
  }
  TopCommentsWidget.displayName = `TopCommentsWidget(${opts.title})`;
  return TopCommentsWidget;
}
