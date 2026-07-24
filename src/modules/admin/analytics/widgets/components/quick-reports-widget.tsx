import Link from 'next/link';
import { LayoutDashboard, Users, Route, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ANALYTICS_ROOT } from '../../services';
import type { WidgetProps } from '../types';

/**
 * Quick Reports — one-click jumps to the ready-made analytics views. Reuses the
 * existing pages (no new routes); registry-driven root path.
 */
export function QuickReportsWidget(_props: WidgetProps) {
  void _props;
  const items = [
    { label: 'Website Overview', href: ANALYTICS_ROOT, icon: LayoutDashboard },
    { label: 'Visitor Report', href: `${ANALYTICS_ROOT}/visitors`, icon: Users },
    { label: 'Traffic Report', href: `${ANALYTICS_ROOT}/traffic`, icon: Route },
  ];

  return (
    <Card className="h-full gap-0 py-0">
      <div className="border-b px-4 py-3 2xl:px-5">
        <p className="font-jost-medium text-sm 2xl:text-base">Quick Reports</p>
      </div>
      <div className="grid gap-2 p-4 2xl:p-5">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className="group bg-card hover:border-primary/30 flex items-center gap-3 rounded-lg border p-3 transition-all hover:-translate-y-0.5 hover:shadow-sm"
            >
              <span className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                <Icon size={16} className="text-primary" />
              </span>
              <span className="group-hover:text-primary min-w-0 flex-1 truncate text-sm font-jost-medium transition-colors">
                {it.label}
              </span>
              <ArrowRight size={14} className="text-muted-foreground/40 group-hover:text-primary shrink-0 transition-colors" />
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
