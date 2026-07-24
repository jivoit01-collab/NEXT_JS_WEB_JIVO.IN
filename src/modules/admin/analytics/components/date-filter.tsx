'use client';

import { CalendarDays } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DATE_RANGE_OPTIONS } from '../utils';
import { useDateRange } from '../hooks';

/**
 * UI-only date-range filter. Theme-aware Radix Select (correct in light + dark).
 * Choosing "Custom range" reveals from/to date pickers. No data fetch yet — a
 * later phase reads the value to scope queries.
 */
export function DateFilter() {
  const { range, setRange, from, setFrom, to, setTo } = useDateRange();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={range} onValueChange={(v) => setRange(v as typeof range)}>
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
            onChange={(e) => setFrom(e.target.value)}
            aria-label="From date"
            className="border-input bg-background focus:border-primary focus:ring-primary/20 h-9 rounded-lg border px-2.5 text-xs font-jost-medium focus:outline-none focus:ring-2 2xl:text-sm"
          />
          <span className="text-muted-foreground text-xs">to</span>
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => setTo(e.target.value)}
            aria-label="To date"
            className="border-input bg-background focus:border-primary focus:ring-primary/20 h-9 rounded-lg border px-2.5 text-xs font-jost-medium focus:outline-none focus:ring-2 2xl:text-sm"
          />
        </div>
      )}
    </div>
  );
}
