'use client';

import { useState } from 'react';
import type { DateRangePreset } from '../types';
import { DEFAULT_DATE_RANGE } from '../utils';

/**
 * UI-only date-range state for the analytics filter. Holds the selected preset;
 * it does NOT fetch anything in this phase — a later phase reads `range` to
 * scope queries. Lives in a hook so every page shares the same behaviour.
 */
export function useDateRange(initial: DateRangePreset = DEFAULT_DATE_RANGE) {
  const [range, setRange] = useState<DateRangePreset>(initial);
  return { range, setRange };
}
