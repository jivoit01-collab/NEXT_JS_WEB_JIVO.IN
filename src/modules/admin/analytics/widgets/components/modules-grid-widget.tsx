import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getAnalyticsModules, ANALYTICS_ROOT } from '../../services';
import type { WidgetProps } from '../types';

/** Overview navigation widget — a registry-driven grid of every module. */
export function ModulesGridWidget(_props: WidgetProps) {
  void _props;
  const modules = getAnalyticsModules().filter((m) => m.route !== ANALYTICS_ROOT);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:gap-4">
      {modules.map((m) => {
        const Icon = m.icon;
        return (
          <Link
            key={m.id}
            href={m.route}
            className="group bg-card hover:border-primary/30 flex items-center gap-3 rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm"
          >
            <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <Icon size={18} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="group-hover:text-primary truncate text-sm font-jost-medium transition-colors">
                {m.name}
              </p>
              <p className="text-muted-foreground truncate text-[11px] 2xl:text-xs">
                {m.description ?? 'Module analytics'}
              </p>
            </div>
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
