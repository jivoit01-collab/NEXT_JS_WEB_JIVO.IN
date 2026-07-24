'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Accessible star rating input (role="radiogroup"). Reusable everywhere. */
export function StarRating({
  value,
  onChange,
  size = 22,
  readOnly = false,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div role="radiogroup" aria-label="Rating" className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          disabled={readOnly}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => onChange?.(n)}
          className={cn(
            'rounded transition-transform focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
            !readOnly && 'cursor-pointer hover:scale-110',
          )}
        >
          <Star
            size={size}
            className={cn(active >= n ? 'fill-[#f5b301] text-[#f5b301]' : 'text-neutral-300 dark:text-neutral-600')}
          />
        </button>
      ))}
    </div>
  );
}
