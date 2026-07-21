// The built-in widget library. Real widgets (charts/breakdowns) render live data
// via the data source and fall back to the shared placeholder when there's none.
// Placeholder widgets stay "coming soon".

import {
  TrendingUp,
  ListOrdered,
  Radar,
  MonitorSmartphone,
  Map,
  Globe,
  Cpu,
  Languages,
  UserCheck,
  ExternalLink,
  DoorOpen,
  Layers,
  MousePointerClick,
  ArrowDownWideNarrow,
  Lightbulb,
  Activity,
  CalendarClock,
  LayoutTemplate,
} from 'lucide-react';
import { registerAnalyticsWidget } from './registry';
import {
  makePlaceholderWidget,
  makeChartWidget,
  makeBreakdownWidget,
  makeTrendWidget,
  makeFactsWidget,
  ComparisonWidget,
  ExportCenterWidget,
  QuickReportsWidget,
  OverviewWidget,
  ExportWidget,
  ModulesGridWidget,
  ModulePagesWidget,
} from './components';
import type { ElementType } from 'react';
import type { WidgetCategory, WidgetSize } from './types';

// ── Summary + navigation ─────────────────────────────────────
registerAnalyticsWidget({ id: 'overview', title: 'Overview', description: 'Key metrics', category: 'summary', size: 'full', order: 10, component: OverviewWidget });
registerAnalyticsWidget({ id: 'modules-grid', title: 'Modules', category: 'custom', size: 'full', order: 15, component: ModulesGridWidget });
registerAnalyticsWidget({ id: 'module-pages', title: 'Pages', category: 'custom', size: 'full', order: 15, component: ModulePagesWidget });

// ── Real chart / breakdown widgets ───────────────────────────
registerAnalyticsWidget({
  id: 'trend',
  title: 'Trend Chart',
  category: 'charts',
  size: 'full',
  order: 20,
  component: makeTrendWidget({ title: 'Trend', description: 'Events over the last 30 days.', icon: TrendingUp }),
});
// Visitors / Traffic trends — same area chart, distinct titles per Phase 6.1.
registerAnalyticsWidget({
  id: 'visitors-trend',
  title: 'Visitors Trend',
  category: 'charts',
  size: 'full',
  order: 21,
  component: makeChartWidget({ title: 'Visitors Trend', description: 'Visitors over the last 30 days.', icon: TrendingUp, type: 'area', source: 'trend' }),
});
registerAnalyticsWidget({
  id: 'traffic-trend',
  title: 'Traffic Trend',
  category: 'charts',
  size: 'full',
  order: 22,
  component: makeChartWidget({ title: 'Traffic Trend', description: 'Traffic over the last 30 days.', icon: Activity, type: 'area', source: 'trend' }),
});

function breakdown(
  id: string,
  title: string,
  description: string,
  icon: ElementType,
  category: WidgetCategory,
  order: number,
  size: WidgetSize = 'medium',
) {
  registerAnalyticsWidget({
    id,
    title,
    category,
    size,
    order,
    component: makeBreakdownWidget({ title, description, icon }),
  });
}

breakdown('top-pages', 'Top Pages', 'Most-visited pages by views.', ListOrdered, 'tables', 30);
breakdown('top-modules', 'Top Modules', 'Most-engaged sections.', Layers, 'tables', 32);
breakdown('top-cta', 'Top CTAs', 'Most-clicked buttons & links.', MousePointerClick, 'conversions', 34);
breakdown('referrers', 'Referrers', 'Sites sending visitors.', ExternalLink, 'traffic', 42);
breakdown('landing-pages', 'Landing Pages', 'Where sessions start.', DoorOpen, 'traffic', 44);

// Traffic Sources & Devices read best as share-of-total donut charts.
registerAnalyticsWidget({
  id: 'traffic-sources',
  title: 'Traffic Sources',
  category: 'traffic',
  size: 'medium',
  order: 40,
  component: makeChartWidget({
    title: 'Traffic Sources',
    description: 'Direct, referral and campaigns.',
    icon: Radar,
    type: 'doughnut',
    source: 'breakdown',
  }),
});
registerAnalyticsWidget({
  id: 'devices',
  title: 'Devices',
  category: 'engagement',
  size: 'medium',
  order: 46,
  component: makeChartWidget({
    title: 'Devices',
    description: 'Mobile / tablet / desktop.',
    icon: MonitorSmartphone,
    type: 'doughnut',
    source: 'breakdown',
  }),
});
breakdown('browsers', 'Browsers', 'Browser share.', Globe, 'engagement', 48);
breakdown('os', 'Operating Systems', 'OS share.', Cpu, 'engagement', 50);
// Countries reads best as a pie chart (share of visitors by geography).
registerAnalyticsWidget({
  id: 'countries',
  title: 'Countries',
  category: 'maps',
  size: 'medium',
  order: 52,
  component: makeChartWidget({ title: 'Countries', description: 'Visitors by geography.', icon: Map, type: 'pie', source: 'breakdown' }),
});
breakdown('languages', 'Languages', 'Visitor languages.', Languages, 'engagement', 54);
// New vs Returning reads best as a two-slice doughnut.
registerAnalyticsWidget({
  id: 'new-returning',
  title: 'New vs Returning',
  category: 'engagement',
  size: 'medium',
  order: 56,
  component: makeChartWidget({ title: 'New vs Returning', description: 'First-time vs repeat visitors.', icon: UserCheck, type: 'doughnut', source: 'breakdown' }),
});

// ── Placeholder widgets (no real source yet) ─────────────────
registerAnalyticsWidget({ id: 'scroll-depth', title: 'Scroll Depth', category: 'engagement', size: 'medium', order: 58, component: makePlaceholderWidget({ title: 'Scroll depth', description: '25 / 50 / 75 / 100% reach.', icon: ArrowDownWideNarrow }) });
registerAnalyticsWidget({ id: 'cta-performance', title: 'CTA Performance', category: 'conversions', size: 'medium', order: 60, component: makePlaceholderWidget({ title: 'CTA performance', description: 'Conversion on calls-to-action.', icon: MousePointerClick }) });
registerAnalyticsWidget({ id: 'campaigns', title: 'Campaigns', category: 'traffic', size: 'medium', order: 45, component: makePlaceholderWidget({ title: 'Campaigns', description: 'UTM campaign performance.', icon: Radar }) });
registerAnalyticsWidget({ id: 'insights', title: 'Insights', category: 'insights', size: 'full', order: 90, component: makePlaceholderWidget({ title: 'Automated insights', description: 'AI-assisted highlights and anomalies.', icon: Lightbulb }) });
registerAnalyticsWidget({ id: 'export', title: 'Export', category: 'custom', size: 'small', order: 95, component: ExportWidget });

// ── Reports (production-ready page) ──────────────────────────
registerAnalyticsWidget({ id: 'report-activity', title: 'Recent Activity', category: 'custom', size: 'medium', order: 70, component: makeFactsWidget({ title: 'Recent activity', description: 'No recent activity yet.', icon: Activity }) });
registerAnalyticsWidget({ id: 'report-comparison', title: 'Comparison Reports', category: 'custom', size: 'medium', order: 72, component: ComparisonWidget });
registerAnalyticsWidget({ id: 'report-exports', title: 'Export Center', category: 'custom', size: 'medium', order: 74, component: ExportCenterWidget });
registerAnalyticsWidget({ id: 'report-quick', title: 'Quick Reports', category: 'custom', size: 'medium', order: 76, component: QuickReportsWidget });
registerAnalyticsWidget({ id: 'report-saved', title: 'Saved Reports', category: 'custom', size: 'medium', order: 78, component: makePlaceholderWidget({ title: 'Saved reports', description: 'No saved reports yet.', icon: LayoutTemplate }) });
registerAnalyticsWidget({ id: 'report-scheduled', title: 'Scheduled Reports', category: 'custom', size: 'medium', order: 80, component: makePlaceholderWidget({ title: 'Scheduled reports', description: 'No scheduled reports yet.', icon: CalendarClock }) });
