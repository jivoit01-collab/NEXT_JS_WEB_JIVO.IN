'use client';

import { useEffect } from 'react';
import { getTrackingEngine } from '../data';
import { TRACK_EVENT } from '../constants';

/**
 * Emits explicit tab visibility signals (user switched away / came back).
 * This is a SEMANTIC event, separate from the engine's internal
 * time-on-page accounting + unload flush (which always run). Useful for
 * measuring engagement / distraction. Renders nothing.
 */
export function VisibilityTracker(): null {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const onChange = () => {
      getTrackingEngine().track({
        eventType: TRACK_EVENT.CUSTOM,
        entityType: 'visibility',
        entityId: document.visibilityState,
        metadata: { state: document.visibilityState },
      });
    };

    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  return null;
}
