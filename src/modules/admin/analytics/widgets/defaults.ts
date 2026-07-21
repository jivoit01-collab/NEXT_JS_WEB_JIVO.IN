// Default widget configurations. A module/page can override with its own
// `widgets: string[]`; otherwise the renderer falls back to these.
//
// Each page has ONE responsibility (no duplicate analytics across pages):
//   Overview → whole-site health · Module → one module · Page → one page
//   Visitors → audience · Traffic → acquisition · Reports → exports (see
//   register-core-modules for Visitors/Traffic/Reports widget lists).

/** Overview — whole-website health. */
export const DEFAULT_OVERVIEW_WIDGETS = [
  'overview',
  'trend',
  'top-pages',
  'traffic-sources',
  'top-modules',
  'insights',
];

/** A module dashboard (hub) — that module's performance; pages grid LAST. */
export const DEFAULT_MODULE_WIDGETS = [
  'overview',
  'trend',
  'top-pages',
  'traffic-sources',
  'devices',
  'top-cta',
  'insights',
  'module-pages',
];

/** A leaf page — that single page's performance. */
export const DEFAULT_PAGE_WIDGETS = [
  'overview',
  'trend',
  'traffic-sources',
  'devices',
  'top-cta',
  'scroll-depth',
  'insights',
];
