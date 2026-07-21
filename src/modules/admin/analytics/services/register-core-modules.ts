// Standalone (leaf) analytics modules registered by Phase 4 / 4.1.
// The CMS-backed modules (Dashboard, Our Essence, Products, …) are generated
// from the CMS registry in `register-cms-modules.ts`.

import { LayoutDashboard, Users, Route, FileBarChart } from 'lucide-react';
import { ANALYTICS_ROOT, registerAnalyticsModule } from './registry';

registerAnalyticsModule({
  id: 'overview',
  name: 'Overview',
  icon: LayoutDashboard,
  route: ANALYTICS_ROOT,
  category: 'overview',
  description: 'Platform-wide summary across every tracked module.',
  order: 0,
  standalone: true,
});

// Visitors — audience intelligence (who visits). No page analytics here.
registerAnalyticsModule({
  id: 'visitors',
  name: 'Visitors',
  icon: Users,
  route: `${ANALYTICS_ROOT}/visitors`,
  category: 'audience',
  description: 'Who is visiting — new vs returning, devices, geography.',
  order: 50,
  standalone: true,
  widgets: ['overview', 'new-returning', 'devices', 'browsers', 'os', 'countries', 'languages', 'trend'],
});

// Traffic — acquisition intelligence (where visitors come from). No device/page analytics.
registerAnalyticsModule({
  id: 'traffic',
  name: 'Traffic',
  icon: Route,
  route: `${ANALYTICS_ROOT}/traffic`,
  category: 'audience',
  description: 'Where visitors come from — sources, referrers, campaigns.',
  order: 60,
  standalone: true,
  widgets: ['overview', 'traffic-sources', 'referrers', 'landing-pages', 'top-pages', 'trend'],
});

// Reports — reporting & exports only (placeholders until implemented).
registerAnalyticsModule({
  id: 'reports',
  name: 'Reports',
  icon: FileBarChart,
  route: `${ANALYTICS_ROOT}/reports`,
  category: 'reports',
  description: 'Scheduled reports and exports.',
  order: 70,
  standalone: true,
  widgets: [
    'overview', // Summary (Total/Scheduled/Recent Exports/Last Export)
    'report-activity', // Recent Activity
    'report-comparison', // Current vs Previous
    'report-exports', // Export Center (CSV/Excel/PDF)
    'report-quick', // Quick Reports
    'report-saved', // Saved Reports (empty)
    'report-scheduled', // Scheduled Reports (empty)
  ],
});
