// Default widget configurations. A module/page can override with its own
// `widgets: string[]`; otherwise the renderer falls back to these.
//
// Each page has ONE responsibility (no duplicate analytics across pages):
//   Overview → whole-site health · Module → one module · Page → one page
//   Visitors → audience · Traffic → acquisition · Reports → exports (see
//   register-core-modules for Visitors/Traffic/Reports widget lists).

/**
 * Overview — whole-website health (Phase 6.1 spec). Three two-up rows under the
 * KPI strip: Visitors Trend · Traffic Trend, then Top Pages · Recent Activity,
 * then Traffic Sources · Devices. Trends are forced half-width here (`@medium`).
 */
export const DEFAULT_OVERVIEW_WIDGETS = [
  'overview', // KPIs (full)
  'visitors-trend@medium', // Row 1
  'traffic-trend@medium',
  'top-pages@medium', // Row 2
  'report-activity@medium',
  'traffic-sources@medium', // Row 3
  'devices@medium',
];

/**
 * A module dashboard (hub) — that module's performance (Phase 6.1 spec).
 * KPIs · Top Pages · Traffic Sources · Devices · CTA Performance · Most Visited
 * Pages. Top Pages / Top CTAs are half-width bars; Traffic Sources / Devices are
 * half-width doughnuts; the pages grid comes last.
 */
export const DEFAULT_MODULE_WIDGETS = [
  'overview', // KPIs
  'top-pages', // Top Pages
  'top-cta', // CTA Performance
  'traffic-sources', // Traffic Sources
  'devices', // Devices
  'module-pages', // Most Visited Pages (drill-down grid)
];

/**
 * A leaf page — that single page's performance (Phase 6.1 spec). NEVER shows Top
 * Pages (the user is already inside one page).
 */
export const DEFAULT_PAGE_WIDGETS = [
  'overview', // KPIs
  'visitors-trend', // Visitors Trend
  'traffic-sources', // Traffic Sources
  'devices', // Devices
  'scroll-depth', // Scroll Depth
  'top-cta', // CTA Clicks
  'insights', // AI Insights
];
