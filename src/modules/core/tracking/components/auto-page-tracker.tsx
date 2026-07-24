'use client';

import { usePageTracking } from '../hooks/use-page-tracking';

/**
 * Zero-config page-view tracking. Drop once high in the tree (the
 * TrackingProvider already does) and every SPA navigation is counted.
 * Renders nothing.
 */
export function AutoPageTracker(): null {
  usePageTracking();
  return null;
}
