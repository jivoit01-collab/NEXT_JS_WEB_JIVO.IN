'use server';

// Phase 4 introduces NO analytics calculation APIs. The dashboard reads through
// the EXISTING, admin-guarded Core action. This wrapper is the single seam a
// later aggregation phase will build on (add getOverview/getModule here, backed
// by the Core event log + sessions + visitors — never a new analytics system).

import { listTrackedEventsAction } from '@/modules/core/tracking';
import { requireAdminGuard } from '@/modules/core/shared';
import { loadWidgetData } from '../data-sources';
import type { AnalyticsExportContext } from '../widgets/types';

/** Admin: raw tracked-event log (filters + pagination). Reuses frozen Core. */
export async function getTrackedEventsAction(input?: Record<string, unknown>) {
  return listTrackedEventsAction(input);
}

const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

/**
 * Admin: export the current analytics page as CSV. Re-reads the page's data
 * through the SAME data-source layer the widgets use (KPIs + top breakdowns), so
 * the export always matches what's on screen. Returns the CSV text + a filename;
 * the client turns it into a download. Empty sections are omitted, so the file
 * only carries what data actually exists.
 */
export async function exportAnalyticsCsvAction(context: AnalyticsExportContext) {
  const guard = await requireAdminGuard();
  if (guard) return guard;

  const [overview, topPages, sources, devices, topCta] = await Promise.all([
    loadWidgetData(context, 'overview'),
    loadWidgetData(context, 'top-pages'),
    loadWidgetData(context, 'traffic-sources'),
    loadWidgetData(context, 'devices'),
    loadWidgetData(context, 'top-cta'),
  ]);

  const lines: string[] = [`Analytics Export,${csvCell(context.title)}`, ''];

  if (overview.metrics?.length) {
    lines.push('KPIs', 'Metric,Value');
    for (const m of overview.metrics) lines.push(`${csvCell(m.label)},${csvCell(m.value ?? '—')}`);
    lines.push('');
  }

  const section = (name: string, rows?: { label: string; value: number }[]) => {
    if (!rows?.length) return;
    lines.push(name, 'Label,Value');
    for (const r of rows) lines.push(`${csvCell(r.label)},${csvCell(r.value)}`);
    lines.push('');
  };
  section('Top Pages', topPages.breakdown);
  section('Top CTAs', topCta.breakdown);
  section('Traffic Sources', sources.breakdown);
  section('Devices', devices.breakdown);

  const slug = context.pageId ?? context.moduleId ?? 'overview';
  return {
    success: true as const,
    data: { filename: `analytics-${slug}.csv`, csv: lines.join('\r\n') },
  };
}
