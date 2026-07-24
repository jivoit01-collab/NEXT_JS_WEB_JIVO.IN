'use client';

import { useCallback, useMemo } from 'react';
import { useCookieConsent } from '@/modules/core/cookie-consent/hooks/use-cookie-consent';
import { canTrackVisitor } from '@/modules/core/cookie-consent/analytics-permission';
import { getTrackingEngine } from '../data';
import { TRACK_EVENT, type TrackEventType } from '../constants';
import { getDownloadExtension } from '../middleware';
import type { TrackEventInput, TrackingApi } from '../types';

const VIDEO_ACTION_TO_EVENT: Record<string, TrackEventType> = {
  play: TRACK_EVENT.VIDEO_PLAY,
  pause: TRACK_EVENT.VIDEO_PAUSE,
  complete: TRACK_EVENT.VIDEO_COMPLETE,
  progress: TRACK_EVENT.VIDEO_PLAY,
};

const FORM_ACTION_TO_EVENT: Record<string, TrackEventType> = {
  open: TRACK_EVENT.FORM_OPEN,
  start: TRACK_EVENT.FORM_START,
  submit: TRACK_EVENT.FORM_SUBMIT,
  success: TRACK_EVENT.FORM_SUCCESS,
  error: TRACK_EVENT.FORM_ERROR,
};

/**
 * The primary developer API. Every method is a no-op unless the visitor has
 * granted analytics consent — so callers never have to check consent themselves.
 *
 *   const t = useTracking();
 *   t.trackClick('hero-cta');
 *   t.trackForm('submit', 'contact-form', { fields: 4 });
 */
export function useTracking(): TrackingApi {
  const { consent } = useCookieConsent();
  const enabled = canTrackVisitor(consent);

  const track = useCallback((event: TrackEventInput) => {
    getTrackingEngine().track(event);
  }, []);

  const trackEvent = useCallback(
    (name: string, metadata?: Record<string, unknown>) => {
      track({ eventType: TRACK_EVENT.CUSTOM, entityType: 'custom', entityId: name, metadata });
    },
    [track],
  );

  const trackClick = useCallback(
    (name: string, metadata?: Record<string, unknown>) => {
      track({ eventType: TRACK_EVENT.BUTTON_CLICK, entityType: 'button', entityId: name, metadata });
    },
    [track],
  );

  const trackSearch = useCallback(
    (query: string, resultsCount?: number) => {
      track({
        eventType: TRACK_EVENT.SEARCH,
        entityType: 'search',
        entityId: query,
        metadata: { query, ...(resultsCount != null ? { resultsCount } : {}) },
      });
    },
    [track],
  );

  const trackDownload = useCallback(
    (fileUrl: string, metadata?: Record<string, unknown>) => {
      track({
        eventType: TRACK_EVENT.DOWNLOAD,
        entityType: 'download',
        entityId: fileUrl,
        metadata: { href: fileUrl, fileType: getDownloadExtension(fileUrl) ?? undefined, ...metadata },
      });
    },
    [track],
  );

  const trackVideo = useCallback(
    (
      action: 'play' | 'pause' | 'complete' | 'progress',
      videoId: string,
      metadata?: Record<string, unknown>,
    ) => {
      track({
        eventType: VIDEO_ACTION_TO_EVENT[action] ?? TRACK_EVENT.VIDEO_PLAY,
        entityType: 'video',
        entityId: videoId,
        metadata: { action, ...metadata },
      });
    },
    [track],
  );

  const trackForm = useCallback(
    (
      action: 'open' | 'start' | 'submit' | 'success' | 'error',
      formId: string,
      metadata?: Record<string, unknown>,
    ) => {
      track({
        eventType: FORM_ACTION_TO_EVENT[action] ?? TRACK_EVENT.FORM_OPEN,
        entityType: 'form',
        entityId: formId,
        metadata: { action, ...metadata },
      });
    },
    [track],
  );

  const flush = useCallback(() => getTrackingEngine().flush(), []);

  return useMemo<TrackingApi>(
    () => ({
      enabled,
      track,
      trackEvent,
      trackClick,
      trackSearch,
      trackDownload,
      trackVideo,
      trackForm,
      flush,
    }),
    [enabled, track, trackEvent, trackClick, trackSearch, trackDownload, trackVideo, trackForm, flush],
  );
}
