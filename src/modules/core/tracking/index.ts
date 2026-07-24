// ==========================================================================
// Core / Universal Visitor Tracking Engine (Phase 3) — public barrel
//
// Zero-code usage:
//   Layout → import { TrackingProvider } from '@/modules/core/tracking'
//            wrap the app once (inside CookieProvider). Done — everything tracks.
//
// Opt-in usage (custom events):
//   const t = useTracking();  t.trackForm('submit', 'contact');
//
// Reuses Phase 1 endpoints + Phase 2 consent — introduces NO new API.
// Docs: docs/tracking-engine.md
// ==========================================================================

export {
  TrackingProvider,
  AutoPageTracker,
  VisibilityTracker,
  NavigationTracker,
} from './components';

export {
  useTracking,
  usePageTracking,
  useScrollTracking,
  useClickTracking,
} from './hooks';

export { getTrackingEngine } from './data';

export { listTrackedEventsAction } from './actions';

export { TRACK_EVENT, type TrackEventType } from './constants';

export type {
  TrackEventInput,
  TrackingApi,
  TrackingContext,
  ReferrerInfo,
  Attribution,
} from './types';
