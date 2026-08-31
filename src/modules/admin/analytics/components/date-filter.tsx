'use client';

import { useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { CalendarDays } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DATE_RANGE_OPTIONS, DEFAULT_DATE_RANGE } from '../utils';
import type { DateRangePreset } from '../types';

/**
 * Date-range filter. The selection lives in the URL (`?range=…&from=…&to=…`), so
 * changing it re-renders the SERVER analytics page with a scoped window — this is
 * what actually filters the data. Choosing "Custom range" reveals from/to pickers.
 */
export function DateFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const range = (searchParams.get('range') as DateRangePreset) || DEFAULT_DATE_RANGE;
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';

  // Write updated params to the URL (removing empty ones), preserving the rest.
  const push = useCallback(
    (next: { range?: string; from?: string; to?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(next)) {
        if (v) params.set(k, v);
        else params.delete(k);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const onPreset = (v: DateRangePreset) => {
    if (v === 'custom') {
      // Keep any existing custom dates; the query only applies once both are set.
      push({ range: 'custom', from, to });
    } else {
      push({ range: v, from: '', to: '' });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={range} onValueChange={(v) => onPreset(v as DateRangePreset)}>
        <SelectTrigger size="sm" className="h-9 gap-2 font-jost-medium">
          <CalendarDays size={15} className="text-muted-foreground shrink-0" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DATE_RANGE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {range === 'custom' && (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => push({ range: 'custom', from: e.target.value, to })}
            aria-label="From date"
            className="border-input bg-background focus:border-primary focus:ring-primary/20 h-9 rounded-lg border px-2.5 text-xs font-jost-medium focus:outline-none focus:ring-2 2xl:text-sm"
          />
          <span className="text-muted-foreground text-xs">to</span>
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => push({ range: 'custom', from, to: e.target.value })}
            aria-label="To date"
            className="border-input bg-background focus:border-primary focus:ring-primary/20 h-9 rounded-lg border px-2.5 text-xs font-jost-medium focus:outline-none focus:ring-2 2xl:text-sm"
          />
        </div>
      )}
    </div>
  );
}
