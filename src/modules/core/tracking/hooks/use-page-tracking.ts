'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getTrackingEngine } from '../data';

/**
 * Feeds SPA route changes to the engine so every client-side navigation is
 * counted as a page view. The engine itself records the very first (landing)
 * page view on enable(); this hook covers every subsequent Next.js navigation.
 *
 * Uses `usePathname` only (no `useSearchParams`) so it never forces a Suspense
 * boundary; the engine reads the full path+query from `window` when firing.
 */
export function usePageTracking(): void {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const full = window.location.pathname + window.location.search;
    getTrackingEngine().handleRouteChange(full);
  }, [pathname]);
}
