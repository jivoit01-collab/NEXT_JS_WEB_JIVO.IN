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
 * UI-only date-range filter. Uses the theme-aware Radix Select so the trigger
 * AND the dropdown render correctly in both light and dark. No data fetch yet —
 * a later phase reads the value to scope queries.
 */
export function DateFilter() {
  const { range, setRange } = useDateRange();

  return (
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
  );
}
