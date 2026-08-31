import type { DateRangePreset } from '../types';

/** Labels for the (UI-only) date-range presets. */
export const DATE_RANGE_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'ytd', label: 'Year to date' },
  { value: 'all', label: 'All time' },
  { value: 'custom', label: 'Custom range' },
];

export const DEFAULT_DATE_RANGE: DateRangePreset = '30d';

/** A concrete, query-ready date window. `from`/`to` are inclusive day bounds;
 *  `null` from means "all time". `days` is the number of daily buckets to plot. */
export interface ResolvedDateRange {
  preset: DateRangePreset;
  from: Date | null;
  to: Date;
  days: number;
}

/** Start-of-day / end-of-day helpers (local time). */
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}
function daysBetween(from: Date, to: Date): number {
  return Math.max(1, Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86400000) + 1);
}

/**
 * Turn a preset (+ optional custom from/to strings, "YYYY-MM-DD") into a concrete
 * window used by every analytics query and the trend bucketing. Server-safe and
 * pure, so the page can call it from `searchParams`.
 */
export function resolveDateRange(
  preset: DateRangePreset = DEFAULT_DATE_RANGE,
  customFrom?: string,
  customTo?: string,
): ResolvedDateRange {
  const now = new Date();
  const to = endOfDay(now);

  const backDays = (d: number): ResolvedDateRange => {
    const from = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (d - 1)));
    return { preset, from, to, days: d };
  };

  switch (preset) {
    case 'today':
      return { preset, from: startOfDay(now), to, days: 1 };
    case '7d':
      return backDays(7);
    case '90d':
      return backDays(90);
    case 'ytd': {
      const from = startOfDay(new Date(now.getFullYear(), 0, 1));
      return { preset, from, to, days: daysBetween(from, now) };
    }
    case 'all':
      // No lower bound; cap the trend at a year of daily buckets for readability.
      return { preset, from: null, to, days: 365 };
    case 'custom': {
      const f = customFrom ? new Date(customFrom) : null;
      const t = customTo ? new Date(customTo) : now;
      const from = f && !Number.isNaN(f.getTime()) ? startOfDay(f) : null;
      const toEnd = !Number.isNaN(t.getTime()) ? endOfDay(t) : to;
      return { preset, from, to: toEnd, days: from ? daysBetween(from, toEnd) : 30 };
    }
    case '30d':
    default:
      return backDays(30);
  }
}

/**
 * Format a metric value for display. `null`/`undefined` → "—" (no data yet),
 * numbers get locale grouping. Keeps every card's empty state consistent.
 */
export function formatMetricValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') return value.toLocaleString();
  return value;
}

/** Format a signed percentage delta (or "" when absent). */
export function formatDelta(deltaPct: number | null | undefined): string {
  if (deltaPct === null || deltaPct === undefined) return '';
  const sign = deltaPct > 0 ? '+' : '';
  return `${sign}${deltaPct.toFixed(1)}%`;
}
