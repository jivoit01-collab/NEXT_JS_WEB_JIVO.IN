// ==========================================================================
// TrackingEngine — the singleton that makes tracking "zero-code".
//
// It owns ALL global browser listeners (click delegation, scroll depth,
// visibility/time-on-page, online/offline, unload) plus page + session
// lifecycle, and pushes every derived event into the EventQueue. React only
// has to (a) enable it once consent is granted and (b) feed it SPA route
// changes (which the DOM cannot observe on its own).
//
// Reuses Phase 1 endpoints via the Phase 2 consent-api client — no new API.
// ==========================================================================

import {
  LIMITS,
  SCROLL_DEPTHS,
  SCROLL_THROTTLE_MS,
  TRACK_EVENT,
  type TrackEventType,
} from '../constants';
import { classifyClick, findTrackable } from '../middleware';
import { normalizeEvent } from '../validations';
import type { QueuedEvent, TrackEventInput, TrackingContext } from '../types';
import {
  endSession,
  getOrCreateSessionId,
  getOrCreateVisitorId,
  startSession,
} from '@/modules/core/cookie-consent/data';
import { platformEvents } from '@/modules/core/events';
import { EventQueue } from './queue';
import { getOrCaptureAttribution } from './attribution';

type Cleanup = () => void;
type NavType = 'load' | 'reload' | 'navigate' | 'back_forward' | 'hash';

function nowIso(): string {
  return new Date().toISOString();
}

function nowMs(): number {
  return Date.now();
}

/** Reason the first page view was reached (from the Navigation Timing API). */
function initialNavType(): NavType {
  if (typeof performance === 'undefined') return 'load';
  const entry = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined;
  if (entry?.type === 'reload') return 'reload';
  if (entry?.type === 'back_forward') return 'back_forward';
  return 'load';
}

class TrackingEngine {
  private queue = new EventQueue();
  private enabled = false;
  private ctx: TrackingContext = { visitorId: '', sessionId: '' };
  private cleanups: Cleanup[] = [];

  // Page state
  private currentPath = '';
  private previousPath: string | null = null;
  private navPath: string[] = [];
  private sessionStarted = false;

  // Scroll state (reset per page)
  private firedDepths = new Set<number>();
  private scrollThrottleTs = 0;

  // Time-on-page state
  private pageEnterMs = 0;
  private visibleSinceMs = 0;
  private accumulatedMs = 0;

  private pendingNavType: NavType | null = null;

  /** Turn the engine on once ANALYTICS consent is granted. Idempotent. */
  enable(): void {
    if (this.enabled || typeof window === 'undefined') return;
    this.enabled = true;

    this.ctx = {
      visitorId: getOrCreateVisitorId(),
      sessionId: getOrCreateSessionId(),
    };

    this.queue.start();
    // Capture first-touch attribution (referrer + UTM) for this session.
    getOrCaptureAttribution(nowIso());
    this.startSessionOnce();
    this.attachListeners();

    // Record the landing page view.
    this.beginPage(window.location.pathname + window.location.search, initialNavType());
  }

  /** Turn tracking off (consent revoked). Flushes + detaches everything. */
  disable(): void {
    if (!this.enabled) return;
    this.endPage();
    this.enabled = false;
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
    void this.queue.flush();
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  // ── Session ────────────────────────────────────────────────
  private startSessionOnce(): void {
    if (this.sessionStarted) return;
    this.sessionStarted = true;
    const entryPage = window.location.pathname;
    void startSession({
      sessionId: this.ctx.sessionId,
      visitorId: this.ctx.visitorId,
      entryPage,
    });
    platformEvents.emit('session:started', {
      sessionId: this.ctx.sessionId,
      visitorId: this.ctx.visitorId,
      entryPage,
    });
  }

  private endCurrentSession(): void {
    if (!this.sessionStarted) return;
    void endSession({
      sessionId: this.ctx.sessionId,
      visitorId: this.ctx.visitorId,
      exitPage: window.location.pathname,
    });
    platformEvents.emit('session:ended', {
      sessionId: this.ctx.sessionId,
      visitorId: this.ctx.visitorId,
    });
  }

  // ── Public tracking API (used by hooks) ────────────────────
  track(event: TrackEventInput): void {
    if (!this.enabled) return;
    const normalized = normalizeEvent(event);
    if (!normalized) return;
    const queued: QueuedEvent = {
      eventType: normalized.eventType,
      page: normalized.page ?? this.currentPath,
      entityType: normalized.entityType,
      entityId: normalized.entityId,
      metadata: normalized.metadata,
      visitorId: this.ctx.visitorId,
      sessionId: this.ctx.sessionId,
      timestamp: nowIso(),
    };
    this.queue.enqueue(queued);
  }

  flush(): void {
    void this.queue.flush();
  }

  /** The ordered list of paths visited this session (capped). */
  getNavigationPath(): string[] {
    return [...this.navPath];
  }

  // ── Page lifecycle ─────────────────────────────────────────
  /** Called by usePageTracking on every SPA route change. */
  handleRouteChange(path: string): void {
    if (!this.enabled) return;
    const full = path || window.location.pathname + window.location.search;
    if (full === this.currentPath) return;
    this.endPage();
    const navType: NavType = this.pendingNavType ?? 'navigate';
    this.pendingNavType = null;
    this.beginPage(full, navType);
  }

  private beginPage(path: string, navType: NavType): void {
    this.previousPath = this.currentPath || null;
    this.currentPath = path;

    // Navigation path (capped).
    this.navPath.push(path);
    if (this.navPath.length > LIMITS.maxNavPath) this.navPath.shift();

    // Reset per-page scroll + time state.
    this.firedDepths.clear();
    this.pageEnterMs = nowMs();
    this.accumulatedMs = 0;
    this.visibleSinceMs = document.visibilityState === 'hidden' ? 0 : nowMs();

    const attribution = getOrCaptureAttribution(nowIso());
    this.track({
      eventType: TRACK_EVENT.PAGE_VIEW,
      page: path,
      entityType: 'page',
      metadata: {
        navType,
        previousPath: this.previousPath ?? undefined,
        depthIndex: this.navPath.length,
        referrerSource: attribution.referrer.source,
        referrerMedium: attribution.referrer.medium,
        ...attribution.utm,
      },
    });

    // Broadcast for subscribers (AI context, business analytics) — decoupled.
    platformEvents.emit('page:viewed', {
      path,
      navType,
      previousPath: this.previousPath ?? undefined,
    });

    // A fresh page could already be scrolled (anchor links) — check once.
    this.evaluateScroll();
  }

  /** Emit the accumulated engagement time for the page being left. */
  private endPage(): void {
    if (!this.currentPath) return;
    const visibleMs = this.computeVisibleMs();
    if (visibleMs >= 1000) {
      this.track({
        eventType: TRACK_EVENT.CUSTOM,
        page: this.currentPath,
        entityType: 'engagement',
        entityId: 'time_on_page',
        metadata: { durationMs: Math.round(visibleMs), durationSec: Math.round(visibleMs / 1000) },
      });
    }
  }

  private computeVisibleMs(): number {
    const live = this.visibleSinceMs > 0 ? nowMs() - this.visibleSinceMs : 0;
    return this.accumulatedMs + live;
  }

  // ── Scroll depth ───────────────────────────────────────────
  private evaluateScroll(): void {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    const percent =
      scrollable <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / scrollable) * 100));

    for (const depth of SCROLL_DEPTHS) {
      if (percent >= depth && !this.firedDepths.has(depth)) {
        this.firedDepths.add(depth);
        this.track({
          eventType: TRACK_EVENT.SCROLL,
          page: this.currentPath,
          entityType: 'scroll-depth',
          entityId: `${depth}`,
          metadata: { depth, percent },
        });
      }
    }
  }

  // ── Global listeners ───────────────────────────────────────
  private attachListeners(): void {
    const onClick = (e: MouseEvent) => {
      const el = findTrackable(e.target);
      if (!el) return;
      const c = classifyClick(el);
      this.track({
        eventType: c.eventType,
        entityType: c.entityType,
        entityId: c.entityId,
        metadata: c.metadata,
      });
    };

    const onScroll = () => {
      const t = nowMs();
      if (t - this.scrollThrottleTs < SCROLL_THROTTLE_MS) return;
      this.scrollThrottleTs = t;
      this.evaluateScroll();
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        // Accumulate visible time + flush reliably.
        if (this.visibleSinceMs > 0) {
          this.accumulatedMs += nowMs() - this.visibleSinceMs;
          this.visibleSinceMs = 0;
        }
        this.queue.flushOnUnload();
      } else {
        this.visibleSinceMs = nowMs();
      }
    };

    const onPageHide = () => {
      this.endPage();
      this.endCurrentSession();
      this.queue.flushOnUnload();
    };

    const onOnline = () => {
      void this.queue.flush();
    };

    const onPopState = () => {
      this.pendingNavType = 'back_forward';
    };

    const onHashChange = () => {
      // Hash-only navigation is invisible to usePathname — handle it here.
      this.pendingNavType = 'hash';
      this.handleRouteChange(window.location.pathname + window.location.search);
    };

    document.addEventListener('click', onClick, { capture: true, passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('online', onOnline);
    window.addEventListener('popstate', onPopState);
    window.addEventListener('hashchange', onHashChange);

    this.cleanups.push(
      () => document.removeEventListener('click', onClick, { capture: true } as EventListenerOptions),
      () => window.removeEventListener('scroll', onScroll),
      () => document.removeEventListener('visibilitychange', onVisibility),
      () => window.removeEventListener('pagehide', onPageHide),
      () => window.removeEventListener('online', onOnline),
      () => window.removeEventListener('popstate', onPopState),
      () => window.removeEventListener('hashchange', onHashChange),
    );
  }
}

/** Process-wide singleton. */
let engine: TrackingEngine | null = null;

export function getTrackingEngine(): TrackingEngine {
  if (!engine) engine = new TrackingEngine();
  return engine;
}

export type { TrackEventType };
