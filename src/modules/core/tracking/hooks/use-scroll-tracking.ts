'use client';

import { useEffect, useRef } from 'react';
import { getTrackingEngine } from '../data';
import { SCROLL_DEPTHS, SCROLL_THROTTLE_MS, TRACK_EVENT } from '../constants';

/**
 * Track scroll depth within a SPECIFIC scrollable element (modals, drawers,
 * long inner panels). Window/page scroll is already tracked automatically by
 * the engine — use this only for custom scroll containers.
 *
 *   const ref = useScrollTracking<HTMLDivElement>('product-gallery');
 *   <div ref={ref} className="overflow-y-auto">…</div>
 */
export function useScrollTracking<T extends HTMLElement>(label: string) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;

    const fired = new Set<number>();
    let lastRun = 0;

    const onScroll = () => {
      const now = Date.now();
      if (now - lastRun < SCROLL_THROTTLE_MS) return;
      lastRun = now;

      const scrollable = el.scrollHeight - el.clientHeight;
      const percent = scrollable <= 0 ? 100 : Math.min(100, Math.round((el.scrollTop / scrollable) * 100));

      for (const depth of SCROLL_DEPTHS) {
        if (percent >= depth && !fired.has(depth)) {
          fired.add(depth);
          getTrackingEngine().track({
            eventType: TRACK_EVENT.SCROLL,
            entityType: 'scroll-depth',
            entityId: `${label}:${depth}`,
            metadata: { container: label, depth, percent },
          });
        }
      }
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [label]);

  return ref;
}
