import { Suspense } from 'react';
import { cn } from '@/lib/utils';
import { resolveWidgets } from './registry';
import { loadWidgetData } from '../data-sources';
import { WidgetSkeleton } from './components/widget-skeleton';
import { WidgetBoundary } from './components/widget-boundary';
import type { AnalyticsWidgetDefinition, WidgetContext, WidgetSize } from './types';

/**
 * The ONE renderer that builds every analytics page. It reads a widget-id list,
 * resolves the registered widgets, and renders each in its own Suspense boundary
 * so data streams in per-widget with a skeleton fallback.
 *
 * Widgets receive DATA, never database access — they are 100% presentation.
 *
 * Grid: 1 col (mobile) → 2 (md+). `small`/`medium` = half; `large`/`full` = full.
 */
const SIZE_SPAN: Record<WidgetSize, string> = {
  small: 'md:col-span-1',
  medium: 'md:col-span-1',
  large: 'md:col-span-2',
  full: 'md:col-span-2',
};

export function WidgetRenderer({
  widgets,
  context,
}: {
  /** Ordered widget ids (config order is preserved). */
  widgets: string[];
  context: WidgetContext;
}) {
  const resolved = resolveWidgets(widgets);
  if (resolved.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {resolved.map((w) => (
        <section key={w.id} className={cn('min-w-0', SIZE_SPAN[w.size])} data-widget={w.id}>
          {/* A single widget failing never crashes the page. */}
          <WidgetBoundary>
            <Suspense fallback={<WidgetSkeleton size={w.size} />}>
              {/* Async slot: fetches this widget's data, then renders it. */}
              <WidgetSlot widget={w} context={context} />
            </Suspense>
          </WidgetBoundary>
        </section>
      ))}
    </div>
  );
}

/** Fetches one widget's data from the data-source layer, then renders it. */
async function WidgetSlot({
  widget,
  context,
}: {
  widget: AnalyticsWidgetDefinition;
  context: WidgetContext;
}) {
  const data = await loadWidgetData(context, widget.id);
  const Widget = widget.component;
  // Client widgets can't receive `context.pages` (lucide icon components don't
  // serialize across the server→client boundary) — hand them a plain context.
  const safeContext =
    widget.client && context.pages
      ? { ...context, pages: context.pages.map((p) => ({ id: p.id, name: p.name, route: p.route })) }
      : context;
  return <Widget context={safeContext} data={data} />;
}
