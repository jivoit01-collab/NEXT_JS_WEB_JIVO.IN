'use client';

import { useEffect } from 'react';
import { useCookieConsent } from '@/modules/core/cookie-consent/hooks/use-cookie-consent';
import { canTrackVisitor } from '@/modules/core/cookie-consent/analytics-permission';
import { getTrackingEngine } from '../data';
import { AutoPageTracker } from './auto-page-tracker';
import { VisibilityTracker } from './visibility-tracker';
import { NavigationTracker } from './navigation-tracker';

/**
 * The single mount point for the Universal Visitor Tracking Engine.
 *
 * Wrap the app once (inside CookieProvider so it can read consent). It:
 *   • enables the engine the moment ANALYTICS consent is granted,
 *   • disables + flushes it if consent is revoked,
 *   • mounts the declarative trackers (page / visibility / navigation).
 *
 * Everything downstream is then tracked with ZERO extra code.
 */
export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const { consent, loading } = useCookieConsent();
  const allowed = canTrackVisitor(consent);

  useEffect(() => {
    if (loading) return;
    const engine = getTrackingEngine();
    if (allowed) engine.enable();
    else engine.disable();
  }, [allowed, loading]);

  return (
    <>
      {children}
      {/* Null-rendering trackers — safe no-ops until the engine is enabled. */}
      <AutoPageTracker />
      <VisibilityTracker />
      <NavigationTracker />
    </>
  );
}
