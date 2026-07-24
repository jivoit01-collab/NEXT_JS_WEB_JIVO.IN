# Business Intelligence Platform (Phase 4)

> The Analytics Dashboard **foundation** — a registry-driven admin section every
> future module plugs into. This phase builds the *architecture*, not charts:
> pages exist, navigate, and share one layout; data/aggregation comes later.

- **Module:** `src/modules/admin/analytics/` (a business module — consumes the frozen Core, never modifies it)
- **Route:** `/jivo-dev/analytics` (+ `/<module>` + `/<module>/<page>`) — ONE catch-all route file
- **No new APIs.** Reads (later) go through the existing admin-guarded Core action.

> **Phase 4.1 update — hierarchical, CMS-driven.** See §0 below. The dashboard now
> mirrors the CMS hierarchy (Modules → Pages) and scales to hundreds of pages.
> **Phase 4.2 update — widget-based.** See §0.1 below. Every page is now built by a
> single renderer from a list of registered widgets.
> **Phase 4.3 update — data-source layer.** See §0.2 below. Widgets receive data
> from a registered data source and never touch the database.
> **Phase 4.4 update — real data + fallback.** See §0.3 below. The default source
> now returns REAL data from the Core Analytics Platform, with a complete
> loading / empty / ready / error fallback so the UI never breaks.
> **Phase 4.5 update — dashboard completion.** See §0.4 below. Real, scoped data
> across modules/pages/visitors/traffic, reusable breakdown + trend charts, and
> one clear responsibility per page.
> **Phase 4.6 update — Reports page.** See §0.5 below. The Reports page is now
> production-ready (summary, recent activity, comparison, export center, quick
> reports) with export generation pluggable later — no redesign.

---

## 0.5 Reports page (Phase 4.6)

The Reports page is complete and works today, built from the same widget +
data-source architecture (widgets never touch Prisma).

### Widgets
| Widget | State | Source |
|---|---|---|
| **Summary** (`overview` w/ `moduleId:'reports'`) | ready | Total/Scheduled/Recent Exports = **0**, Last Export = "—" (no report subsystem yet — real zeros) |
| **Recent Activity** (`report-activity`, facts) | ready/empty | `getReportsActivity()` — most-visited page, highest-traffic page, latest event, latest activity |
| **Comparison Reports** (`report-comparison`) | ready/empty | `getReportsComparison()` — current 30d vs previous 30d (Events, New Visitors) + Δ% |
| **Export Center** (`report-exports`) | ready | CSV / Excel / PDF, status **Ready**; click → toast *"Export module will be implemented in a future phase."* (no error) |
| **Quick Reports** (`report-quick`) | ready | one-click links to Overview / Visitors / Traffic (reuses existing pages) |
| **Saved Reports** (`report-saved`) | empty | "No saved reports yet." |
| **Scheduled Reports** (`report-scheduled`) | empty | "No scheduled reports yet." |

### Data source (reuse, no duplication)
`getReportsKpis` / `getReportsActivity` / `getReportsComparison` live in the
data-source `queries.ts` and reuse existing `AnalyticsEvent` / `Visitor` tables
(groupBy top page, `findFirst` latest event, period counts). Every metric uses
`Promise.allSettled` → one failure = one "—".

### Fallback
Empty DB → activity/comparison return `empty` (friendly placeholder), summary shows
**0**; exports stay clickable-but-informative; saved/scheduled show empty states.
Layout never breaks.

### Future export architecture (plug-in, no redesign)
When CSV/Excel/PDF/email/scheduled generation lands: replace `ExportCenterWidget`'s
`onExport` with real generation, and add a reports subsystem the data source reads
for `getReportsKpis` (total/scheduled/recent) — **same page, same widgets, same
route**. Only placeholder logic is swapped.

### Verified (live DB)
Activity: most-visited `/`(10), latest `CUSTOM · /our-essence/milestones-timeline`.
Comparison: Events 165 vs 0 (+100%), New Visitors 7 vs 0. Summary: zeros. Exports: toast.

---

## 0.4 Dashboard completion — scoped data, charts, responsibilities (Phase 4.5)

### Chart architecture (reuse over duplication)
Two dependency-free, reusable chart components power everything:
- **`makeBreakdownWidget({title, icon})`** — a ranked horizontal bar list from
  `data.breakdown`. ONE component serves top-pages, top-modules, top-cta,
  traffic-sources, referrers, landing-pages, devices, browsers, os, countries,
  languages, new-returning.
- **`makeTrendWidget({title, icon})`** — a CSS bar chart from `data.trend`
  (events over the last 30 days).
Both fall back to the shared `PlaceholderPanel` when there's no data — never a
broken chart.

### Module & page analytics (scoped)
The data source scopes every query by context:
- **CMS module** (`site`, `our-essence`) → its public path(s); a page → that exact
  page. Visitor breakdowns on a page are scoped to *that page's* visitors.
- **CMS module without public pages** (products/media/community) → `none` → empty
  ("—"), never global leakage.
Module dashboard shows its own top-pages / top-cta / trend / devices; a page shows
only its own numbers (no module-wide totals).

### Business Intelligence responsibilities (no duplication)
| Page | Responsibility | Widgets |
|---|---|---|
| **Overview** | Whole-site health | KPIs · trend · top-pages · traffic-sources · top-modules |
| **Module** | One module's performance | KPIs · trend · top-pages · traffic-sources · devices · top-cta · pages grid |
| **Page** | One page's performance | KPIs · trend · traffic-sources · devices · top-cta · scroll-depth |
| **Visitors** | Audience — *who visits* | KPIs (total/new/returning/countries) · new-vs-returning · devices · browsers · os · countries · languages · trend |
| **Traffic** | Acquisition — *where from* | KPIs (sessions/direct/referral/campaigns) · traffic-sources · referrers · landing-pages · top-pages · trend |
| **Reports** | Reporting & exports | exports · scheduled · templates · comparison (placeholders) |
| **Authentication** | Auth intelligence | logins/registrations/… (placeholders) |

### Data sources implemented (reuse Core, no duplication)
- **KPIs:** Overview (8), Visitors (4), Traffic (4), Module/Page summary (4) —
  reuse Core `countVisitors/countSessions/countEvents` + read-only Prisma aggregates.
- **Breakdowns:** `groupBy` over `AnalyticsEvent` (top pages/modules/CTA),
  `Visitor` (devices/browsers/os/countries/languages/new-returning/referrers/UTM),
  `VisitorSession` (landing pages).
- **Trend:** events bucketed by day (30d), scoped.
Every metric uses `Promise.allSettled` — one failure → one "—", widget survives.

### Widget states
`loading` (Suspense skeleton) · `ready` (real) · `empty` (friendly note / placeholder)
· `placeholder` (coming-soon) · `error` (falls back to placeholder, logged, no error UI).
No widget crashes; no invalid numbers.

### Verified (live DB)
Top pages: `/`(6), our-essence pages(2/2/1/1) · Devices: Desktop 2 / Mobile 1 ·
Landing: `/`(2) · Overview KPIs (3 visitors, 93 events, …). Empty/unmapped → "—".

---

## 0.3 Real data integration + fallback (Phase 4.4)

The default data source now reads **real** analytics from the Core Platform.
Widgets stay presentation-only; the renderer picks the right UI automatically.

### Real data integration
`data-sources/queries.ts` (server-only) computes the Overview KPIs by **reusing
Core** (`countVisitors`, `countSessions`, `countEvents`) plus read-only Prisma
aggregates for what Core doesn't expose — no writes, no duplicate ingestion, no
Core changes:

| Metric | Source |
|---|---|
| Total Visitors | `countVisitors()` |
| Total Sessions | `countSessions()` |
| Tracked Events | `countEvents()` |
| Returning Visitors | `visitor.count(visitCount > 1)` |
| Avg. Session Duration | `avg(visitorSession.duration)` → "30m 20s" |
| Pages Tracked | distinct `analyticsEvent.page` |
| Consent Accepted | `cookieConsent.count(status=ACCEPTED)` |
| Last Activity | `max(visitor.lastSeen)` |

Module/page scope maps the analytics module/page to its **public path** and
counts `PAGE_VIEW` / interactions for it (unmapped modules → "—", never an error).
Every metric is computed with `Promise.allSettled` — one failure yields "—" for
that metric only; the widget never fails as a whole.

### Widget states (the renderer chooses the UI)
`WidgetData.status`:
- **loading** — the renderer wraps each widget in `<Suspense>` with a
  `WidgetSkeleton`; data streams in per-widget.
- **ready** — real values shown.
- **empty** — queried successfully but nothing tracked yet → keeps the cards +
  a friendly "No analytics data available yet — start using the website…" note.
- **placeholder** — no real source for this widget yet → the existing "coming soon" UI.
- **error** — fetch failed → falls back to the "—" cards; **no error shown**;
  the failure is logged safely.

### Fallback strategy
```
loadWidgetData() ──▶ resolveDataSource() ──▶ source.getWidget()
      │ (try/catch)                                │ (Promise.allSettled per metric)
      └── error → { status:'error' }               └── failure → "—" for that metric
Empty DB (0/0/0/0) ──▶ status 'empty' ──▶ cards + friendly message (never blank)
```

### Error handling
DB unavailable, query failure, widget failure, or a module with no data **never
break the page** — the widget renders the placeholder ("—") cards and the error is
`console.error`-logged (dev only). The dashboard always looks complete.

### Performance (+ future caching)
Only the current page's widgets are queried; only the `overview` widget hits the
DB today (one query set per page). Core count helpers are reused. **Caching is not
implemented yet** — a future phase can memoize `getOverviewData()` / `getModuleData()`
(e.g. `unstable_cache` / a short TTL) behind the same interface with zero widget
or renderer changes.

### Verified (live DB)
`{ visitors: 3, sessions: 3, events: 93, returning: 2, avgDuration: 1820s→"30m 20s",
pagesTracked: 5, consentAccepted: 2, lastActivity: 20 Jul 2026 }` → status `ready`,
real values render. Empty DB → `empty` + message. Query failure → `—` fallback.

---

## 0.2 Analytics Data Source layer (Phase 4.3)

Widgets are now fully decoupled from the database. They **receive data**; they
never query Prisma or know where data comes from.

```
Widget ◀── WidgetRenderer ◀── Data Source ◀── Core Analytics ◀── Prisma
 (presentation)   (injects data)   (registered)   (events/sessions/visitors)   (future)
```

### Module — `src/modules/admin/analytics/data-sources/`
```
data-sources/
├── types.ts               AnalyticsDataSource, AnalyticsPageData, registration, WidgetData
├── registry.ts            registerAnalyticsDataSource, resolveDataSource, loadWidgetData
├── default-data-sources.ts the catch-all PLACEHOLDER source (no queries)
└── index.ts               barrel (registers the default on import)
```

### The interface
```ts
interface AnalyticsDataSource {
  getOverview(ctx): Promise<AnalyticsPageData>;
  getModule(moduleId, ctx): Promise<AnalyticsPageData>;
  getPage(moduleId, pageId, ctx): Promise<AnalyticsPageData>;
  getWidget(widgetId, ctx): Promise<WidgetData>;   // the renderer's primary call
}
```
All async, so a real source can read the Core event log / sessions / visitors via
Prisma later — **widgets and the renderer never change.**

### Data source registry
```ts
registerAnalyticsDataSource({ id, source, modules, pages, widgets, enabled, priority });
```
- `resolveDataSource(context)` picks the highest-priority **enabled** source whose
  `modules` match `context.moduleId` (`['*']`/omit = catch-all).
- The **default** source (`modules: ['*']`, `priority: 0`) serves Overview, every
  module/page dashboard, Authentication, Visitors, Traffic, Reports — with
  placeholder data.
- A future module registers a **higher-priority** source scoped to its module id
  → it overrides the default for that module only. No dashboard/renderer changes.

### Widget data flow
1. `WidgetRenderer` (async server component) resolves the widget list.
2. For each widget it calls `loadWidgetData(context, widgetId)` → the resolved
   source's `getWidget(...)` (errors are caught → `{ status: 'error' }`).
3. It passes `data` into each widget via `WidgetProps` (`{ context, data }`).
4. Widgets render from `data` only — e.g. the KPI `OverviewWidget` renders
   `data.metrics` (falling back to placeholder metrics when none are supplied).

### Current behaviour
Placeholder only — **no calculations, no SQL, no Prisma.** `WidgetData.status`
is `'placeholder'`; the KPI widget shows the existing "—" metrics.

### Future real data integration
Register a source that implements the interface over the **frozen Core** (reuse
`getTrackedEventsAction` / event log / sessions / visitors), set a higher priority
for its module, and flip it on. Widgets and the renderer work unmodified — the
`WidgetData.status` becomes `'ready'` and the same cards fill with real numbers.

---

## 0.1 Widget architecture (Phase 4.2)

Every analytics page is assembled by ONE renderer from a **widget config** — a list
of widget ids. No page composes its own layout; no dashboard component is written
per module. Future modules add capability by **registering widgets** and listing
them.

```
Analytics ▸ Module ▸ Page ▸ Widgets ▸ Widget Components ▸ (future data)

  page/module config            registry                  reusable UI
  widgets: ['overview',   ──▶   getAnalyticsWidget(id) ──▶ <OverviewWidget/> …
            'trend', … ]        (resolveWidgets)           <PlaceholderPanel/> …
                    │
                    ▼
             <WidgetRenderer widgets={…} context={…} />
             → responsive grid, size = column span, config order preserved
```

### Widget registry
`src/modules/admin/analytics/widgets/registry.ts`

```ts
registerAnalyticsWidget({
  id, title, description, category, component, size, order, enabled, permissions, featureFlag,
});
```
- Idempotent by `id`; unknown/disabled ids are skipped by the renderer (dev-warned).
- `getAnalyticsWidget` / `getAnalyticsWidgets` / `resolveWidgets(ids)`.

### Widget renderer
`widgets/widget-renderer.tsx` — the ONE renderer. Reads the id list, resolves the
registry, lays widgets out on a **responsive grid** (`1 → 2 → 4` columns) where
**size = column span**: `small`=1, `medium`=2, `large`=3, `full`=4. No page-specific
logic. Each widget receives a `WidgetContext` (`scope` overview|module|page, title,
moduleId/pageId, and the module's `pages` for navigation widgets).

### Categories & sizes
Categories: `summary · charts · tables · insights · maps · funnels · conversions ·
traffic · engagement · custom` (additive). Sizes: `small · medium · large · full`.

### Default widget library (placeholder UI only — reuses existing components)
`overview` (KPI grid — `MetricCardGrid`), `trend`, `breakdown`, `top-pages`,
`traffic-sources`, `devices`, `countries`, `scroll-depth`, `cta-performance`,
`insights`, `export` (reuses `ExportButton`), plus navigation widgets `modules-grid`
(Overview) and `module-pages` (module hub). Every placeholder is the SAME
`PlaceholderPanel` via a `makePlaceholderWidget(...)` factory — one "coming soon" UI.

### Widget config (per page/module)
`AnalyticsModuleDefinition.widgets?` / `AnalyticsPageDefinition.widgets?` — an
optional id list. When omitted, the renderer falls back to defaults:
```
DEFAULT_OVERVIEW_WIDGETS = [overview, modules-grid, trend, top-pages, insights]
DEFAULT_MODULE_WIDGETS   = [overview, module-pages, trend, top-pages, traffic-sources, insights]
DEFAULT_PAGE_WIDGETS     = [overview, trend, scroll-depth, traffic-sources, devices, cta-performance, insights]
```

### Widget lifecycle
```
register (register-default-widgets, or a future module's own file)
   → page/module lists widget ids  (config, or defaults)
   → WidgetRenderer resolves + lays out
   → widget renders placeholder UI  (later: real data via the Core event log)
```

### Future widget development
1. Build a component `({ context }: WidgetProps) => …` (reuse `PlaceholderPanel`,
   `MetricCard`, or a real chart later).
2. `registerAnalyticsWidget({ id, title, category, size, component })`.
3. Add its id to a page/module's `widgets` list. Done — no renderer/page/dashboard
   change. (E.g. Products → register `revenue`, `inventory`, `conversion` widgets
   and list them.)

### Files (4.2)
- **New:** `widgets/{types,registry,widget-renderer,defaults,register-default-widgets,index}.ts`
  and `widgets/components/{placeholder-widget,overview-widget,export-widget,
  modules-grid-widget,module-pages-widget,index}`.
- **Changed (additive):** analytics `types` (`widgets?`), `validations` (widgets),
  page renderers (`OverviewPage`/`ModuleDashboardPage`/`ModuleAnalyticsPage` → thin
  Layout + Renderer), the catch-all (passes `WidgetContext`), and the barrel.

### Backward compatibility
Additive. `AnalyticsLayout`, `MetricCard`, `PlaceholderPanel` unchanged; auth's
`sections` still render (a legacy shim) until it registers widgets; no Core / API /
tracking / hierarchy changes.

---

## 0. Hierarchical, CMS-driven architecture (Phase 4.1)

The flat page list was replaced by a **Modules → Pages → Routes** hierarchy that
mirrors the CMS, generated entirely from registries:

```
Analytics
├── Overview                       (standalone leaf)
├── Dashboard                      (CMS module) → Home · Navbar · Footer
├── Our Essence                    (CMS module) → The Story · Core Values · … (9 pages)
├── Our Products                   (CMS module) → (future pages)
├── Jivo Media                     (CMS module) → (future pages)
├── Community                      (CMS module) → (future pages)
├── Authentication                 (platform leaf, named sections)
├── Visitors · Traffic · Reports   (standalone leaves)
```

### CMS is the single source of truth
`src/modules/admin/cms/` (`CMS_MODULES`) defines every managed module + page ONCE.
Three consumers derive from it — **no duplicate page definitions**:

```
                         @/modules/admin/cms  (CMS_MODULES — source of truth)
                          │            │                │
        admin sidebar ◀───┘   SEO manager (getSeoPages) └──▶ analytics registry
        (CMS sections)                                        (register-cms-modules)
```

- **Admin sidebar** CMS + SEO sections are built from the CMS registry.
- **Analytics** auto-generates a module (with a Dashboard + one page per CMS page)
  for every CMS module via `services/register-cms-modules.ts`.

### Automatic registration flow (add a page once → analytics appears)
```
add a CMS page to CMS_MODULES         e.g. Products → "Cold Pressed Coconut Oil"
        │
        ├─▶ admin sidebar shows it under Products (management)
        ├─▶ SEO manager shows it (if seo: true)
        └─▶ analytics registry creates  /jivo-dev/analytics/products/cold-pressed-coconut-oil
                 → appears in the Analytics sidebar (under Products) AND the
                   Products dashboard's page grid — ZERO analytics code changes.
```

### Registry model
- `registerAnalyticsModule({ …, pages?, standalone? })` — a module may carry child
  `pages` (CMS-driven) or be a `standalone` leaf (Overview/Visitors/Traffic/Reports/Authentication).
- `getAnalyticsNavTree()` → the sidebar tree (leaves + collapsible groups).
- `getAnalyticsEntry(route)` → resolves any route to `overview | module | page | notfound`.

### Sidebar
The Analytics section renders the tree from `getAnalyticsNavTree()`: standalone
modules are single links; CMS modules are **collapsible groups** (Dashboard + pages)
— collapsed by default unless you're inside them, so hundreds of pages never crowd
the sidebar. Drilling is also available via each module dashboard's page grid.

### Routing & pages (one layout, only data changes)
The single catch-all `analytics/[[...slug]]/page.tsx` renders:
`OverviewPage` (root) · `ModuleDashboardPage` (a CMS module hub — summary + its
pages grid) · `ModuleAnalyticsPage` (a CMS page or a standalone leaf). All reuse
the same `AnalyticsLayout`.

### New / changed files (4.1)
- **New:** `src/modules/admin/cms/{types,pages,index}.ts`,
  `analytics/services/register-cms-modules.ts`, `analytics/pages/module-dashboard-page.tsx`.
- **Changed (additive):** analytics `types` (`pages`/`standalone`/`AnalyticsPageDefinition`/
  `AnalyticsNavItem`), `services/registry.ts` (+ page/tree/entry resolvers),
  `register-core-modules.ts` (standalone leaves), `register-platform-modules.ts`
  (auth standalone), `module-analytics-page.tsx` (generic props), `analytics-breadcrumb`/
  `analytics-layout` (parent crumb), and the admin dashboard layout (CMS/SEO from
  registry + nested Analytics tree).

### Backward compatibility
Fully additive. `getAnalyticsModuleByRoute` retained; `AnalyticsLayout`/`MetricCard`/
`PlaceholderPanel` unchanged in behaviour; the Authentication registration (Phase 5)
keeps working as a standalone leaf with its named sections; no Core changes, no API
changes, no tracking changes.

---

## 1. Architecture

```
                      ┌──────────── Analytics Module Registry ────────────┐
 registerAnalyticsModule({id,name,icon,route,category}) ─▶ Map<id, def>   │
                      └───────────────┬───────────────────┬───────────────┘
                                      │ getAnalyticsModules()
                    ┌─────────────────┘                   └─────────────────┐
                    ▼                                                       ▼
        Sidebar "Analytics" section                        One catch-all route
        (dashboard layout maps the registry)               /analytics/[[...slug]]
        → future modules appear automatically              → resolves route → page
                                                                    │
                                       ┌────────────────────────────┴──────────────┐
                                       ▼                                            ▼
                                  OverviewPage                             ModuleAnalyticsPage(def)
                                  (KPI cards + module grid)                (shared layout, per module)
                                       └───────────────┬────────────────────────────┘
                                                       ▼
                                             <AnalyticsLayout>  (breadcrumb · title ·
                                              date filter · export · refresh · content)
```

**The rule:** the sidebar, routing, and page layouts NEVER change when a module
is added. A module registers once; everything else renders from the registry.

---

## 2. Folder structure

```
src/modules/admin/analytics/
├── components/     AnalyticsLayout, MetricCard(+Grid), PlaceholderPanel,
│                   DateFilter, RefreshButton/ExportButton, Breadcrumb, SectionHeading
├── pages/          OverviewPage, ModuleAnalyticsPage (the two renderers)
├── hooks/          useDateRange (UI-only date state)
├── actions/        getTrackedEventsAction (reuses Core; server-only)
├── services/       registry.ts (registerAnalyticsModule / getAnalyticsModules …)
│                   register-core-modules.ts (the initial 8)
├── data/           overview-metrics.ts (KPI + summary card configs — values null)
├── types/          AnalyticsModuleDefinition, AnalyticsMetric, AnalyticsDataSource …
├── validations/    zod schema for a registration payload + date range
├── utils/          formatMetricValue, date-range options
└── index.ts        barrel (services · pages · components · data · types)
```

> Import boundaries: the **registry** is client-safe (`.../services`); **actions**
> are server-only (`.../actions`). Keep those paths specific so server code never
> leaks into a client bundle.

---

## 3. Registration system

```ts
import { registerAnalyticsModule } from '@/modules/admin/analytics/services';

registerAnalyticsModule({
  id: 'products',
  name: 'Products',
  icon: Package,
  route: '/jivo-dev/analytics/products',
  category: 'business',   // 'overview' | 'cms' | 'business' | 'audience' | 'reports'
  description: 'Product views, add-to-cart, conversions.',
  order: 100,
});
```

- Idempotent by `id` (safe under HMR).
- Validated (except `icon`) by `analyticsModuleSchema` — a bad registration logs
  in dev and is skipped, never crashes.
- Sorted by category → order → name for a stable sidebar/dashboard.
- Stored on a `globalThis` singleton so server + client bundles stay consistent.

### Initially registered (this phase)
Overview · Home · Navbar · Footer · Our Essence · Visitors · Traffic · Reports.

### Later phases register (no existing code changes)
Products · Media · Community · Feedback · AI Chatbot · Knowledge Base · CRM ·
Orders · Recommendations.

---

## 4. Analytics Module Lifecycle

1. **Register** — the module calls `registerAnalyticsModule({...})` (ideally from
   its own `*.analytics.ts` imported by `services/register-core-modules.ts`).
2. **Appear** — it shows up in the sidebar "Analytics" section and the Overview
   module grid automatically (both map `getAnalyticsModules()`).
3. **Route** — `/jivo-dev/analytics/<id>` is served by the single catch-all,
   which renders `ModuleAnalyticsPage` with the registered definition.
4. **Render** — the shared `AnalyticsLayout` + placeholder cards + future
   Chart/Table/Insights areas display immediately.
5. **Data (future)** — a later phase implements `AnalyticsDataSource`
   (`getOverview` / `getModule`) backed by the Core event log/sessions/visitors,
   and the same cards/areas fill with real numbers — no layout change.

---

## 5. Pages

- **Overview** (`/jivo-dev/analytics`) — 8 KPI cards (Total Visitors, Active
  Sessions, Tracked Events, Bounce Rate, Average Session, Returning Visitors,
  Top Module, Last Updated) + a registry-driven module grid + placeholder
  Traffic-trend and Top-pages areas. Cards show "—" (no data yet).
- **Every module page** — shared header + placeholder summary cards + Future
  Chart Area + Future Table Area + Future Insights Area. All from one component.

Only Overview carries summary KPIs; the rest are placeholder layouts, ready for
implementation.

---

## 6. Shared layout & reusable components

| Component | Purpose |
|---|---|
| `AnalyticsLayout` | Breadcrumb · title · description · toolbar (date filter, export, refresh) · content. Every page uses it. |
| `MetricCard` / `MetricCardGrid` | Reusable KPI card (data-agnostic; renders "—" when `value` is null). |
| `PlaceholderPanel` | Titled "coming soon" area for future chart/table/insight regions. |
| `DateFilter` | UI-only range selector (holds state; no fetch this phase). |
| `RefreshButton` / `ExportButton` | Refresh re-runs the render; Export is a disabled placeholder. |
| `AnalyticsBreadcrumb`, `SectionHeading` | Consistent chrome. |

Charts are intentionally NOT implemented.

---

## 7. APIs (reuse only)

No analytics-calculation API is added. `actions/getTrackedEventsAction` wraps the
existing admin-guarded Core action (`listTrackedEventsAction`). The
`AnalyticsDataSource` interface is the seam a future aggregation phase implements
— consuming Core, never creating a parallel analytics system.

---

## 8. Future expansion

- **New module** → one `registerAnalyticsModule(...)` call. Sidebar + route +
  Overview grid update automatically. No redesign, no duplicated routing/layout.
- **Real data** → implement `AnalyticsDataSource`; wire it into the existing
  cards/areas. (Also closes the "aggregation layer" item from the maturity check.)
- **Charts/tables** → drop real widgets into the `PlaceholderPanel` slots.
- **Per-category dashboard sections** → `getAnalyticsModulesByCategory()` is ready.

---

## 9. Architecture improvements (this phase)

- **Reduced routing/layout duplication** — ONE catch-all route + ONE
  `AnalyticsLayout` + ONE `ModuleAnalyticsPage` serve every module (vs. a page
  file per module).
- **Reusable dashboard primitives** — `MetricCard`, `PlaceholderPanel`,
  `AnalyticsLayout` are shared, preventing future copy-paste.
- **Sidebar made data-driven (additive)** — the admin layout gained a registry-fed
  Analytics section + an optional `exact` match flag on `NavChild`; no existing
  section changed. This is the only touch to shared admin UI, and it is additive.

## 10. Build verification

ESLint · TypeScript · production build · Prisma all pass; all 8 analytics routes
resolve; no existing route/import broke. (No Core module was modified — the
freeze holds.)
