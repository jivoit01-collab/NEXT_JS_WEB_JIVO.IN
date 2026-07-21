import 'server-only';

// ==========================================================================
// Real analytics queries for the default data source (Phase 4.4 + 4.5).
//
// Reads the EXISTING Core Analytics Platform (reuses Core count helpers +
// read-only Prisma aggregates). No writes, no duplicate ingestion, no Core
// changes. Every query is scoped correctly and fails soft (→ "—"/empty), so a
// widget never crashes and the dashboard never breaks.
//
// Scoping:
//   • overview / visitors / traffic / reports / auth → GLOBAL
//   • CMS module (site, our-essence) → that module's public path(s)
//   • CMS module without public pages (products/media/community) → NONE (empty)
// ==========================================================================

import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { countVisitors } from '@/modules/core/visitor/data';
import { countSessions } from '@/modules/core/session/data';
import { countEvents } from '@/modules/core/analytics/data';
import {
  OVERVIEW_METRICS,
  MODULE_SUMMARY_METRICS,
  VISITOR_METRICS,
  TRAFFIC_METRICS,
  REPORTS_METRICS,
} from '../data';
import type { WidgetContext, WidgetData, WidgetDatum } from '../widgets/types';
import type { AnalyticsMetric } from '../types';

type Value = string | number | null;

function settled<T extends Value>(r: PromiseSettledResult<T>): Value {
  return r.status === 'fulfilled' ? r.value : null;
}
function settledNum(r: PromiseSettledResult<number>): number | null {
  return r.status === 'fulfilled' ? r.value : null;
}
function formatDuration(seconds: number | null): string | null {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return null;
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}
function formatWhen(date: Date | null): string | null {
  if (!date) return null;
  try {
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return date.toISOString().slice(0, 10);
  }
}
function fill(defs: AnalyticsMetric[], values: Record<string, Value>): AnalyticsMetric[] {
  return defs.map((m) => ({ ...m, value: values[m.id] ?? null }));
}
function titleCase(s: string | null | undefined): string {
  if (!s) return '—';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
function breakdownResult(rows: WidgetDatum[]): WidgetData {
  return { status: rows.length ? 'ready' : 'empty', breakdown: rows };
}

// ── Scope resolution ─────────────────────────────────────────
function resolvePublicPath(ctx: WidgetContext): { path: string; prefix: boolean } | null {
  const { moduleId, pageId } = ctx;
  if (moduleId === 'site') return pageId === 'home' ? { path: '/', prefix: false } : null;
  if (moduleId === 'our-essence') {
    return pageId
      ? { path: `/our-essence/${pageId}`, prefix: false }
      : { path: '/our-essence', prefix: true };
  }
  return null;
}

type Scope =
  | { kind: 'global' }
  | { kind: 'page'; where: Prisma.AnalyticsEventWhereInput }
  | { kind: 'none' };

function resolveScope(ctx: WidgetContext): Scope {
  if (ctx.scope === 'overview') return { kind: 'global' };
  const m = ctx.moduleId;
  if (m === 'visitors' || m === 'traffic' || m === 'reports' || m === 'authentication') {
    return { kind: 'global' };
  }
  const rp = resolvePublicPath(ctx);
  if (rp) {
    return { kind: 'page', where: rp.prefix ? { page: { startsWith: rp.path } } : { page: rp.path } };
  }
  return { kind: 'none' };
}

function eventWhere(ctx: WidgetContext): Prisma.AnalyticsEventWhereInput | null {
  const scope = resolveScope(ctx);
  if (scope.kind === 'none') return null;
  return scope.kind === 'page' ? scope.where : {};
}

async function pageVisitorIds(where: Prisma.AnalyticsEventWhereInput): Promise<string[]> {
  const rows = await prisma.analyticsEvent.findMany({
    where: { ...where, visitorId: { not: null } },
    distinct: ['visitorId'],
    select: { visitorId: true },
    take: 10000,
  });
  return rows.map((r) => r.visitorId).filter((v): v is string => !!v);
}

/** Visitor where-clause for the current scope, or null when there's nothing to show. */
async function visitorScopeWhere(ctx: WidgetContext): Promise<Prisma.VisitorWhereInput | null> {
  const scope = resolveScope(ctx);
  if (scope.kind === 'none') return null;
  const base: Prisma.VisitorWhereInput = { deletedAt: null };
  if (scope.kind === 'page') {
    const ids = await pageVisitorIds(scope.where);
    if (ids.length === 0) return null;
    base.visitorId = { in: ids };
  }
  return base;
}

// ── Overview (platform-wide KPIs) ────────────────────────────
export async function getOverviewData(): Promise<WidgetData> {
  const [visitors, sessions, events, returning, avgDuration, distinctPages, consent, lastSeen] =
    await Promise.allSettled([
      countVisitors(),
      countSessions(),
      countEvents(),
      prisma.visitor.count({ where: { visitCount: { gt: 1 }, deletedAt: null } }),
      prisma.visitorSession
        .aggregate({ _avg: { duration: true }, where: { duration: { not: null } } })
        .then((r) => r._avg.duration ?? null),
      prisma.analyticsEvent
        .findMany({ where: { page: { not: null } }, distinct: ['page'], select: { page: true } })
        .then((rows) => rows.length),
      prisma.cookieConsent.count({ where: { status: 'ACCEPTED' } }),
      prisma.visitor.aggregate({ _max: { lastSeen: true } }).then((r) => r._max.lastSeen ?? null),
    ]);

  const totalVisitors = settledNum(visitors);
  const totalSessions = settledNum(sessions);
  const totalEvents = settledNum(events);

  const metrics = fill(OVERVIEW_METRICS, {
    'total-visitors': totalVisitors,
    'total-sessions': totalSessions,
    'total-events': totalEvents,
    'returning-visitors': settledNum(returning),
    'avg-session': formatDuration(settled(avgDuration) as number | null),
    'pages-tracked': settledNum(distinctPages),
    'consent-accepted': settledNum(consent),
    'last-activity': formatWhen((lastSeen.status === 'fulfilled' ? lastSeen.value : null) as Date | null),
  });

  const hasData = [totalVisitors, totalSessions, totalEvents].some((v) => (v ?? 0) > 0);
  return { status: hasData ? 'ready' : 'empty', metrics };
}

// ── Module / page summary KPIs ───────────────────────────────
export async function getModuleData(ctx: WidgetContext): Promise<WidgetData> {
  const scope = resolveScope(ctx);
  if (scope.kind === 'none') return { status: 'placeholder', metrics: fill(MODULE_SUMMARY_METRICS, {}) };
  const pageWhere = scope.kind === 'page' ? scope.where : {};

  const [views, uniqueVisitors, interactions] = await Promise.allSettled([
    prisma.analyticsEvent.count({ where: { ...pageWhere, eventType: 'PAGE_VIEW' } }),
    prisma.analyticsEvent
      .findMany({ where: pageWhere, distinct: ['visitorId'], select: { visitorId: true } })
      .then((rows) => rows.length),
    prisma.analyticsEvent.count({ where: { ...pageWhere, eventType: { not: 'PAGE_VIEW' } } }),
  ]);

  const pageViews = settledNum(views);
  const inter = settledNum(interactions);
  const metrics = fill(MODULE_SUMMARY_METRICS, {
    views: pageViews,
    visitors: settledNum(uniqueVisitors),
    'avg-time': null, // per-page duration not computed yet → "—"
    interactions: inter,
  });
  const hasData = (pageViews ?? 0) > 0 || (inter ?? 0) > 0;
  return { status: hasData ? 'ready' : 'empty', metrics };
}

// ── Visitor / Traffic KPIs (standalone pages) ────────────────
export async function getVisitorKpis(): Promise<WidgetData> {
  const [total, nw, rt, countries] = await Promise.allSettled([
    countVisitors(),
    prisma.visitor.count({ where: { visitCount: { lte: 1 }, deletedAt: null } }),
    prisma.visitor.count({ where: { visitCount: { gt: 1 }, deletedAt: null } }),
    prisma.visitor
      .findMany({ where: { country: { not: null }, deletedAt: null }, distinct: ['country'], select: { country: true } })
      .then((r) => r.length),
  ]);
  const totalV = settledNum(total);
  const metrics = fill(VISITOR_METRICS, {
    'total-visitors': totalV,
    'new-visitors': settledNum(nw),
    'returning-visitors': settledNum(rt),
    countries: settledNum(countries),
  });
  return { status: (totalV ?? 0) > 0 ? 'ready' : 'empty', metrics };
}

export async function getTrafficKpis(): Promise<WidgetData> {
  const [sessions, direct, referral, campaigns] = await Promise.allSettled([
    countSessions(),
    prisma.visitor.count({ where: { referrer: null, utmSource: null, deletedAt: null } }),
    prisma.visitor.count({ where: { referrer: { not: null }, utmSource: null, deletedAt: null } }),
    prisma.visitor.count({ where: { utmSource: { not: null }, deletedAt: null } }),
  ]);
  const totalS = settledNum(sessions);
  const metrics = fill(TRAFFIC_METRICS, {
    'total-sessions': totalS,
    direct: settledNum(direct),
    referral: settledNum(referral),
    campaigns: settledNum(campaigns),
  });
  return { status: (totalS ?? 0) > 0 ? 'ready' : 'empty', metrics };
}

// ── Reports ──────────────────────────────────────────────────
/** Reports KPIs. No report/export subsystem yet → real zeros (never breaks). */
export async function getReportsKpis(): Promise<WidgetData> {
  const metrics = fill(REPORTS_METRICS, {
    'total-reports': 0,
    'scheduled-reports': 0,
    'recent-exports': 0,
    'last-export': null,
  });
  return { status: 'ready', metrics };
}

/** Recent analytics activity — reuses existing tables (no duplicate queries). */
export async function getReportsActivity(): Promise<WidgetData> {
  const [topPage, latestEvent, lastSeen] = await Promise.allSettled([
    prisma.analyticsEvent
      .groupBy({
        by: ['page'],
        where: { eventType: 'PAGE_VIEW', page: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { page: 'desc' } },
        take: 1,
      })
      .then((r) => r[0] ?? null),
    prisma.analyticsEvent.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { eventType: true, page: true },
    }),
    prisma.visitor.aggregate({ _max: { lastSeen: true } }).then((r) => r._max.lastSeen ?? null),
  ]);

  const tp = topPage.status === 'fulfilled' ? topPage.value : null;
  const le = latestEvent.status === 'fulfilled' ? latestEvent.value : null;
  const ls = lastSeen.status === 'fulfilled' ? lastSeen.value : null;

  const facts = [
    { label: 'Most visited page', value: tp ? `${tp.page} (${tp._count._all})` : '—' },
    { label: 'Highest traffic page', value: tp ? (tp.page ?? '—') : '—' },
    { label: 'Latest event', value: le ? `${le.eventType}${le.page ? ` · ${le.page}` : ''}` : '—' },
    { label: 'Latest activity', value: ls ? (formatWhen(ls) ?? '—') : '—' },
  ];
  const hasAny = facts.some((f) => f.value !== '—');
  return { status: hasAny ? 'ready' : 'empty', facts };
}

/** Current 30 days vs previous 30 days. Placeholder when there's no data. */
export async function getReportsComparison(): Promise<WidgetData> {
  const now = new Date();
  const start = new Date(now.getTime() - 30 * 86400000);
  const prevStart = new Date(now.getTime() - 60 * 86400000);

  const [curEvents, prevEvents, curVisitors, prevVisitors] = await Promise.allSettled([
    prisma.analyticsEvent.count({ where: { timestamp: { gte: start } } }),
    prisma.analyticsEvent.count({ where: { timestamp: { gte: prevStart, lt: start } } }),
    prisma.visitor.count({ where: { createdAt: { gte: start }, deletedAt: null } }),
    prisma.visitor.count({ where: { createdAt: { gte: prevStart, lt: start }, deletedAt: null } }),
  ]);

  const or0 = (r: PromiseSettledResult<number>) => (r.status === 'fulfilled' ? r.value : 0);
  const comparison = [
    { label: 'Events', current: or0(curEvents), previous: or0(prevEvents) },
    { label: 'New Visitors', current: or0(curVisitors), previous: or0(prevVisitors) },
  ];
  const hasData = comparison.some((c) => c.current > 0 || c.previous > 0);
  return { status: hasData ? 'ready' : 'empty', comparison };
}

// ── Trend (events over the last 30 days) ─────────────────────
function dayKey(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
export async function getTrend(ctx: WidgetContext): Promise<WidgetData> {
  const w = eventWhere(ctx);
  if (!w) return { status: 'empty', trend: [] };

  const DAYS = 30;
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (DAYS - 1));
  const events = await prisma.analyticsEvent.findMany({
    where: { ...w, timestamp: { gte: from } },
    select: { timestamp: true },
    take: 50000,
  });

  const buckets = new Map<string, number>();
  for (let i = 0; i < DAYS; i++) {
    buckets.set(dayKey(new Date(from.getFullYear(), from.getMonth(), from.getDate() + i)), 0);
  }
  for (const e of events) {
    const k = dayKey(e.timestamp);
    if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + 1);
  }
  const trend: WidgetDatum[] = [...buckets.entries()].map(([label, value]) => ({ label, value }));
  return { status: events.length ? 'ready' : 'empty', trend };
}

// ── Breakdown widgets ────────────────────────────────────────
export async function getBreakdown(widgetId: string, ctx: WidgetContext): Promise<WidgetData> {
  switch (widgetId) {
    case 'top-pages':
      return breakdownTopPages(ctx);
    case 'top-cta':
      return breakdownTopCta(ctx);
    case 'top-modules':
      return breakdownTopModules(ctx);
    case 'traffic-sources':
      return breakdownTrafficSources(ctx);
    case 'referrers':
      return breakdownReferrers(ctx);
    case 'landing-pages':
      return breakdownLandingPages(ctx);
    case 'devices':
      return breakdownDevices(ctx);
    case 'countries':
      return breakdownCountries(ctx);
    case 'browsers':
      return breakdownBrowsers(ctx);
    case 'os':
      return breakdownOs(ctx);
    case 'languages':
      return breakdownLanguages(ctx);
    case 'new-returning':
      return breakdownNewReturning(ctx);
    default:
      return { status: 'placeholder' };
  }
}

async function breakdownTopPages(ctx: WidgetContext): Promise<WidgetData> {
  const w = eventWhere(ctx);
  if (!w) return { status: 'empty', breakdown: [] };
  const rows = await prisma.analyticsEvent.groupBy({
    by: ['page'],
    // AND so the scoped page filter (from `w`) is NOT overwritten by `page: not null`.
    where: { AND: [w, { eventType: 'PAGE_VIEW', page: { not: null } }] },
    _count: { _all: true },
    orderBy: { _count: { page: 'desc' } },
    take: 8,
  });
  return breakdownResult(rows.map((r) => ({ label: r.page ?? '—', value: r._count._all })));
}

async function breakdownTopCta(ctx: WidgetContext): Promise<WidgetData> {
  const w = eventWhere(ctx);
  if (!w) return { status: 'empty', breakdown: [] };
  const rows = await prisma.analyticsEvent.groupBy({
    by: ['entityId'],
    where: { ...w, entityType: { in: ['button', 'link', 'external-link'] }, entityId: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { entityId: 'desc' } },
    take: 8,
  });
  return breakdownResult(rows.map((r) => ({ label: r.entityId ?? '—', value: r._count._all })));
}

function moduleFromPath(p: string): string {
  const seg = p.split('/').filter(Boolean)[0];
  if (!seg) return 'Home';
  return titleCase(seg.replace(/-/g, ' '));
}
async function breakdownTopModules(ctx: WidgetContext): Promise<WidgetData> {
  const w = eventWhere(ctx);
  if (!w) return { status: 'empty', breakdown: [] };
  const rows = await prisma.analyticsEvent.groupBy({
    by: ['page'],
    where: { AND: [w, { eventType: 'PAGE_VIEW', page: { not: null } }] },
    _count: { _all: true },
    orderBy: { _count: { page: 'desc' } },
    take: 300,
  });
  const map = new Map<string, number>();
  for (const r of rows) {
    const label = moduleFromPath(r.page ?? '');
    map.set(label, (map.get(label) ?? 0) + r._count._all);
  }
  const breakdown = [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  return breakdownResult(breakdown);
}

async function breakdownTrafficSources(ctx: WidgetContext): Promise<WidgetData> {
  const where = await visitorScopeWhere(ctx);
  if (!where) return { status: 'empty', breakdown: [] };
  const [direct, referral, utmRows] = await Promise.all([
    prisma.visitor.count({ where: { ...where, referrer: null, utmSource: null } }),
    prisma.visitor.count({ where: { ...where, referrer: { not: null }, utmSource: null } }),
    prisma.visitor.groupBy({
      by: ['utmSource'],
      where: { ...where, utmSource: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { utmSource: 'desc' } },
      take: 6,
    }),
  ]);
  const breakdown: WidgetDatum[] = [];
  if (direct) breakdown.push({ label: 'Direct', value: direct });
  for (const r of utmRows) breakdown.push({ label: titleCase(r.utmSource), value: r._count._all });
  if (referral) breakdown.push({ label: 'Referral', value: referral });
  breakdown.sort((a, b) => b.value - a.value);
  return breakdownResult(breakdown);
}

async function breakdownReferrers(ctx: WidgetContext): Promise<WidgetData> {
  const where = await visitorScopeWhere(ctx);
  if (!where) return { status: 'empty', breakdown: [] };
  const rows = await prisma.visitor.groupBy({
    by: ['referrer'],
    where: { ...where, referrer: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { referrer: 'desc' } },
    take: 8,
  });
  return breakdownResult(rows.map((r) => ({ label: r.referrer ?? '—', value: r._count._all })));
}

async function breakdownLandingPages(ctx: WidgetContext): Promise<WidgetData> {
  const scope = resolveScope(ctx);
  if (scope.kind === 'none') return { status: 'empty', breakdown: [] };
  const rows = await prisma.visitorSession.groupBy({
    by: ['entryPage'],
    where: { entryPage: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { entryPage: 'desc' } },
    take: 8,
  });
  return breakdownResult(rows.map((r) => ({ label: r.entryPage ?? '—', value: r._count._all })));
}

async function breakdownDevices(ctx: WidgetContext): Promise<WidgetData> {
  const where = await visitorScopeWhere(ctx);
  if (!where) return { status: 'empty', breakdown: [] };
  const rows = await prisma.visitor.groupBy({
    by: ['deviceType'],
    where,
    _count: { _all: true },
    orderBy: { _count: { deviceType: 'desc' } },
    take: 8,
  });
  return breakdownResult(rows.map((r) => ({ label: titleCase(r.deviceType), value: r._count._all })));
}

async function breakdownCountries(ctx: WidgetContext): Promise<WidgetData> {
  const where = await visitorScopeWhere(ctx);
  if (!where) return { status: 'empty', breakdown: [] };
  const rows = await prisma.visitor.groupBy({
    by: ['country'],
    where: { ...where, country: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { country: 'desc' } },
    take: 8,
  });
  return breakdownResult(rows.map((r) => ({ label: r.country ?? '—', value: r._count._all })));
}

async function breakdownBrowsers(ctx: WidgetContext): Promise<WidgetData> {
  const where = await visitorScopeWhere(ctx);
  if (!where) return { status: 'empty', breakdown: [] };
  const rows = await prisma.visitor.groupBy({
    by: ['browser'],
    where: { ...where, browser: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { browser: 'desc' } },
    take: 8,
  });
  return breakdownResult(rows.map((r) => ({ label: r.browser ?? '—', value: r._count._all })));
}

async function breakdownOs(ctx: WidgetContext): Promise<WidgetData> {
  const where = await visitorScopeWhere(ctx);
  if (!where) return { status: 'empty', breakdown: [] };
  const rows = await prisma.visitor.groupBy({
    by: ['os'],
    where: { ...where, os: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { os: 'desc' } },
    take: 8,
  });
  return breakdownResult(rows.map((r) => ({ label: r.os ?? '—', value: r._count._all })));
}

async function breakdownLanguages(ctx: WidgetContext): Promise<WidgetData> {
  const where = await visitorScopeWhere(ctx);
  if (!where) return { status: 'empty', breakdown: [] };
  const rows = await prisma.visitor.groupBy({
    by: ['language'],
    where: { ...where, language: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { language: 'desc' } },
    take: 8,
  });
  return breakdownResult(rows.map((r) => ({ label: r.language ?? '—', value: r._count._all })));
}

async function breakdownNewReturning(ctx: WidgetContext): Promise<WidgetData> {
  const where = await visitorScopeWhere(ctx);
  if (!where) return { status: 'empty', breakdown: [] };
  const [nw, rt] = await Promise.all([
    prisma.visitor.count({ where: { ...where, visitCount: { lte: 1 } } }),
    prisma.visitor.count({ where: { ...where, visitCount: { gt: 1 } } }),
  ]);
  const breakdown: WidgetDatum[] = [];
  if (nw) breakdown.push({ label: 'New', value: nw });
  if (rt) breakdown.push({ label: 'Returning', value: rt });
  return breakdownResult(breakdown);
}
