'use client';

import { createContext } from 'react';
import type { CookieConsentContextValue } from './types';

/** Global cookie-consent context — consumed via the `useCookieConsent()` hook. */
export const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);
