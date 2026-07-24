'use client';

import { useContext } from 'react';
import { CookieConsentContext } from '../context';
import type { CookieConsentContextValue } from '../types';

/**
 * Access the global cookie-consent state + actions.
 * Must be used within `<CookieProvider>`.
 *
 * @example
 *   const { consent, loading, acceptAll, isAllowed, track } = useCookieConsent();
 *   if (isAllowed('ANALYTICS')) track({ eventType: 'BUTTON_CLICK', entityId: 'buy' });
 */
export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error('useCookieConsent() must be used within a <CookieProvider>.');
  }
  return ctx;
}
