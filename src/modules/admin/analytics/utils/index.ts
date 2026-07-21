import type { DateRangePreset } from '../types';

/** Labels for the (UI-only) date-range presets. */
export const DATE_RANGE_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'ytd', label: 'Year to date' },
  { value: 'all', label: 'All time' },
];

export const DEFAULT_DATE_RANGE: DateRangePreset = '30d';

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
