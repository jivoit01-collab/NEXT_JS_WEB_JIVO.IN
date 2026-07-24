'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { CookieConsentContext } from '../context';
import {
  COOKIE_POLICY_VERSION,
  CONSENT_STATUS,
  OPTIONAL_CATEGORIES,
  type ConsentCategory,
} from '../constants';
import { canTrackAnalytics, hasConsent, isCategoryAllowed } from '../consent-guards';
import { platformEvents } from '@/modules/core/events';
import {
  fetchServerConsent,
  getOrCreateSessionId,
  getOrCreateVisitorId,
  identifyVisitor,
  recordConsent,
  sendEvent,
  writeStoredConsent,
  readStoredConsent,
} from '../data';
import type {
  CategoryPreferences,
  ConsentState,
  CookieConsentContextValue,
  TrackableEvent,
} from '../types';
import { CookieBanner } from './cookie-banner';

// Preferences modal is loaded ONLY when first opened (keeps the banner lightweight).
const CookiePreferencesModal = dynamic(
  () => import('./cookie-preferences-modal').then((m) => m.CookiePreferencesModal),
  { ssr: false },
);

const ALL_CATEGORIES: ConsentCategory[] = ['NECESSARY', 'ANALYTICS', 'MARKETING', 'PREFERENCES'];

/** Collect non-PII client hints for the analytics identify call. */
function collectClientHints(visitorId: string) {
  const url = new URL(window.location.href);
  const q = url.searchParams;
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  return {
    visitorId,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenWidth: window.screen?.width,
    screenHeight: window.screen?.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    platform: nav.userAgentData?.platform,
    referrer: document.referrer || undefined,
    utmSource: q.get('utm_source') ?? undefined,
    utmMedium: q.get('utm_medium') ?? undefined,
    utmCampaign: q.get('utm_campaign') ?? undefined,
  };
}

/**
 * Global cookie-consent provider.
 *  - Reconciles localStorage ↔ server on mount (respects the policy version).
 *  - Shows the first-visit banner when no valid decision exists.
 *  - Starts the analytics pipeline ONLY when ANALYTICS consent is granted.
 */
export function CookieProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [loading, setLoading] = useState(true);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  // Refs so stable callbacks always see the latest values.
  const consentRef = useRef<ConsentState | null>(null);
  const visitorIdRef = useRef<string>('');
  const analyticsStartedRef = useRef(false);

  useEffect(() => {
    consentRef.current = consent;
  }, [consent]);

  /**
   * Identify (enrich) the visitor once, only if analytics is allowed.
   *
   * Session lifecycle + page/scroll/click/etc. events are owned by the Phase 3
   * Tracking Engine (`@/modules/core/tracking`) so there is a single source of
   * truth and no duplicate PAGE_VIEW / session rows. This provider's job is the
   * consent decision + the one-time visitor enrichment.
   */
  const startAnalytics = useCallback((state: ConsentState) => {
    if (analyticsStartedRef.current || !canTrackAnalytics(state)) return;
    analyticsStartedRef.current = true;

    void identifyVisitor(collectClientHints(state.visitorId));
  }, []);

  // ── Initial reconciliation (all state updates run off the sync effect body) ──
  useEffect(() => {
    let active = true;

    void (async () => {
      await Promise.resolve(); // defer state updates out of the synchronous effect body

      const visitorId = getOrCreateVisitorId();
      visitorIdRef.current = visitorId;

      let stored = readStoredConsent();
      if (stored && stored.version !== COOKIE_POLICY_VERSION) stored = null; // policy changed → re-ask

      if (stored && stored.status !== CONSENT_STATUS.UNKNOWN) {
        if (!active) return;
        setConsent(stored);
        setLoading(false);
        startAnalytics(stored);
        return;
      }

      // No valid local decision — check the server (covers cleared localStorage).
      const server = await fetchServerConsent(visitorId);
      if (!active) return;

      if (server && server.status !== 'UNKNOWN' && server.version === COOKIE_POLICY_VERSION) {
        const hydrated: ConsentState = {
          visitorId,
          status: server.status,
          categories: server.acceptedCategories.length ? server.acceptedCategories : ['NECESSARY'],
          version: server.version,
          updatedAt: server.acceptedAt ?? new Date().toISOString(),
        };
        writeStoredConsent(hydrated);
        setConsent(hydrated);
        startAnalytics(hydrated);
      } else {
        setBannerVisible(true);
      }
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [startAnalytics]);

  // Session lifecycle (start/end on unload) is handled by the Phase 3 Tracking
  // Engine, which owns all behavioural events — this provider no longer touches it.

  // ── Decision handlers ───────────────────────────────────────
  const applyDecision = useCallback(
    (status: ConsentState['status'], categories: ConsentCategory[]) => {
      const visitorId = visitorIdRef.current || getOrCreateVisitorId();
      visitorIdRef.current = visitorId;

      const state: ConsentState = {
        visitorId,
        status,
        categories,
        version: COOKIE_POLICY_VERSION,
        updatedAt: new Date().toISOString(),
      };

      writeStoredConsent(state);
      setConsent(state);
      setBannerVisible(false);
      setPreferencesOpen(false);

      // Persist the decision server-side (idempotent upsert — no duplicates).
      void recordConsent({ visitorId, status, acceptedCategories: categories });

      // Begin analytics only when allowed.
      startAnalytics(state);

      // Broadcast the decision so any platform/business subscriber (tracking,
      // AI, marketing pixels) can react — without this module importing them.
      platformEvents.emit('consent:updated', { status, categories, version: COOKIE_POLICY_VERSION });
      platformEvents.emit(
        canTrackAnalytics(state) ? 'consent:accepted' : 'consent:rejected',
        { categories },
      );
    },
    [startAnalytics],
  );

  const acceptAll = useCallback(
    () => applyDecision(CONSENT_STATUS.ACCEPTED, ALL_CATEGORIES),
    [applyDecision],
  );

  const rejectAll = useCallback(
    () => applyDecision(CONSENT_STATUS.REJECTED, ['NECESSARY']),
    [applyDecision],
  );

  const updatePreferences = useCallback(
    (prefs: CategoryPreferences) => {
      const categories: ConsentCategory[] = [
        'NECESSARY',
        ...OPTIONAL_CATEGORIES.filter((c) => prefs[c]),
      ];
      applyDecision(CONSENT_STATUS.CUSTOMIZED, categories);
    },
    [applyDecision],
  );

  const openPreferences = useCallback(() => setPreferencesOpen(true), []);
  const closePreferences = useCallback(() => setPreferencesOpen(false), []);

  const track = useCallback((event: TrackableEvent) => {
    if (!canTrackAnalytics(consentRef.current)) return;
    void sendEvent({
      ...event,
      visitorId: visitorIdRef.current,
      sessionId: getOrCreateSessionId(),
    });
  }, []);

  const hasConsentFn = useCallback(() => hasConsent(consentRef.current), []);
  const isAllowed = useCallback(
    (category: ConsentCategory) => isCategoryAllowed(consentRef.current, category),
    [],
  );

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      consent,
      loading,
      bannerVisible,
      preferencesOpen,
      acceptAll,
      rejectAll,
      updatePreferences,
      openPreferences,
      closePreferences,
      hasConsent: hasConsentFn,
      isAllowed,
      track,
    }),
    [
      consent,
      loading,
      bannerVisible,
      preferencesOpen,
      acceptAll,
      rejectAll,
      updatePreferences,
      openPreferences,
      closePreferences,
      hasConsentFn,
      isAllowed,
      track,
    ],
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
      {bannerVisible && !preferencesOpen && <CookieBanner />}
      {preferencesOpen && <CookiePreferencesModal />}
    </CookieConsentContext.Provider>
  );
}
