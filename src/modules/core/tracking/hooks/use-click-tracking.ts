'use client';

import { useCallback } from 'react';
import { getTrackingEngine } from '../data';
import { TRACK_EVENT } from '../constants';

/**
 * Imperative click tracking for cases where the automatic, delegated click
 * capture isn't enough (e.g. a synthetic control, or you want a custom name).
 * Global click tracking is already automatic via the engine — this is opt-in
 * sugar. No-op unless analytics consent is granted (engine enforces it).
 *
 *   const trackClick = useClickTracking();
 *   <button onClick={() => trackClick('newsletter-signup', { placement: 'footer' })} />
 */
export function useClickTracking() {
  return useCallback((name: string, metadata?: Record<string, unknown>) => {
    getTrackingEngine().track({
      eventType: TRACK_EVENT.BUTTON_CLICK,
      entityType: 'button',
      entityId: name,
      metadata,
    });
  }, []);
}
