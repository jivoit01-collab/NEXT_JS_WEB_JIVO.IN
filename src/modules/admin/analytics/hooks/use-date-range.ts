'use client';

import { useState } from 'react';
import type { DateRangePreset } from '../types';
import { DEFAULT_DATE_RANGE } from '../utils';

/**
 * UI-only date-range state for the analytics filter. Holds the selected preset
 * plus optional custom from/to dates. It does NOT fetch anything in this phase —
 * a later phase reads these to scope queries. Lives in a hook so every page
 * shares the same behaviour.
 */
export function useDateRange(initial: DateRangePreset = DEFAULT_DATE_RANGE) {
  const [range, setRange] = useState<DateRangePreset>(initial);
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  return { range, setRange, from, setFrom, to, setTo };
}
