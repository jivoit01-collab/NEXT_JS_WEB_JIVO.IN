import Link from 'next/link';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import { PlaceholderPanel } from '../../components/placeholder-panel';
import type { WidgetProps } from '../types';

/**
 * Module navigation widget — a registry-driven grid of the module's child pages
 * (from `context.pages`). This is how you drill from a module dashboard into its
 * (potentially hundreds of) pages, keeping the sidebar uncluttered.
 */
export function ModulePagesWidget({ context }: WidgetProps) {
  const pages = context.pages ?? [];

  if (pages.length === 0) {
    return (
      <PlaceholderPanel
        title="Future pages"
        description={`Pages added to ${context.title} in the CMS appear here automatically.`}
        icon={LayoutGrid}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:gap-4">
      {pages.map((p) => {
        const Icon = p.icon ?? LayoutGrid;
        return (
          <Link
            key={p.id}
            href={p.route}
            className="group bg-card hover:border-primary/30 flex items-center gap-3 rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm"
          >
            <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <Icon size={18} className="text-primary" />
            </div>
            <span className="group-hover:text-primary min-w-0 flex-1 truncate text-sm font-jost-medium transition-colors">
              {p.name}
            </span>
            <ArrowRight
              size={15}
              className="text-muted-foreground/40 group-hover:text-primary shrink-0 transition-colors"
            />
          </Link>
        );
      })}
    </div>
  );
}
