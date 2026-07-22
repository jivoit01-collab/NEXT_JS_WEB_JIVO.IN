import type { ElementType } from 'react';
import { Card } from '@/components/ui/card';
import { PlaceholderPanel } from '../../components/placeholder-panel';
import type { WidgetProps } from '../types';

/**
 * Factory for a "facts list" widget (label → text value), used by Recent
 * Activity. Reuses the shared placeholder when there's nothing to show.
 */
export function makeFactsWidget(opts: { title: string; description: string; icon: ElementType }) {
  function FactsWidget({ data }: WidgetProps) {
    const facts = data?.facts ?? [];
    if (facts.length === 0) {
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
          {facts.map((f, i) => (
            <li key={`${f.label}-${i}`} className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs 2xl:px-5 2xl:text-sm">
              <span className="text-muted-foreground shrink-0">{f.label}</span>
              <span className="text-foreground/90 min-w-0 truncate text-right font-jost-medium">
                {f.value}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    );
  }
  FactsWidget.displayName = `FactsWidget(${opts.title})`;
  return FactsWidget;
}
