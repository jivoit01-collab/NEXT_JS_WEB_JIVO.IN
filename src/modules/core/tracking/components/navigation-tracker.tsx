'use client';

import { useEffect } from 'react';
import { getTrackingEngine } from '../data';
import { TRACK_EVENT } from '../constants';

/**
 * On leaving the site, emits the full ordered navigation path for the session
 * (the "journey"). The engine records `previousPath` on each page view for
 * step-by-step flow; this component adds a single end-of-session summary so
 * funnels/journeys are reconstructable without stitching. Renders nothing.
 */
export function NavigationTracker(): null {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onLeave = () => {
      const path = getTrackingEngine().getNavigationPath();
      if (path.length < 2) return; // single-page visit — nothing to summarize
      getTrackingEngine().track({
        eventType: TRACK_EVENT.CUSTOM,
        entityType: 'navigation-path',
        entityId: 'journey',
        metadata: { steps: path.length, path: path.join(' > ') },
      });
    };

    window.addEventListener('pagehide', onLeave);
    return () => window.removeEventListener('pagehide', onLeave);
  }, []);

  return null;
}
