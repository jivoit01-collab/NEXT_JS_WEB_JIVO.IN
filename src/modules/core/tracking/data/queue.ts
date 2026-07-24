// ==========================================================================
// EventQueue — batches events and POSTs them to the EXISTING Phase 1 endpoint
// `/api/analytics/events` ({ events: [...] }). Handles:
//   • batching (never exceeds the server batch cap)
//   • periodic flush + immediate flush when the buffer is full
//   • retry with backoff (bounded — events are dropped after maxRetries)
//   • offline support (buffer persisted to localStorage, replayed when online)
//   • reliable unload flush via navigator.sendBeacon
// No new endpoint is introduced.
// ==========================================================================

import { QUEUE_CONFIG } from '../constants';
import type { QueuedEvent } from '../types';

const EVENTS_ENDPOINT = '/api/analytics/events';

/** Strip queue-only bookkeeping before sending to the API. */
function toPayload(events: QueuedEvent[]) {
  return events.map(({ _retries, ...rest }) => {
    void _retries;
    return rest;
  });
}

export class EventQueue {
  private buffer: QueuedEvent[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private flushing = false;
  private started = false;

  /** Start periodic flushing + restore any offline buffer. Idempotent. */
  start(): void {
    if (this.started || typeof window === 'undefined') return;
    this.started = true;
    this.restore();
    if (this.buffer.length > 0) this.scheduleFlush(0);
  }

  /** Add an event and schedule/trigger a flush. */
  enqueue(event: QueuedEvent): void {
    this.buffer.push(event);
    // Protect memory during long offline periods: drop the oldest.
    if (this.buffer.length > QUEUE_CONFIG.maxBufferSize) {
      this.buffer.splice(0, this.buffer.length - QUEUE_CONFIG.maxBufferSize);
    }
    this.persist();
    if (this.buffer.length >= QUEUE_CONFIG.batchSize) {
      void this.flush();
    } else {
      this.scheduleFlush(QUEUE_CONFIG.flushIntervalMs);
    }
  }

  private scheduleFlush(delay: number): void {
    if (this.timer) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flush();
    }, delay);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private isOnline(): boolean {
    return typeof navigator === 'undefined' || navigator.onLine !== false;
  }

  /** Send one batch. Re-queues (with backoff) on failure until maxRetries. */
  async flush(): Promise<void> {
    if (this.flushing || this.buffer.length === 0) return;
    if (!this.isOnline()) {
      // Stay buffered; the 'online' listener will retry.
      return;
    }
    this.flushing = true;
    this.clearTimer();

    const batch = this.buffer.splice(0, QUEUE_CONFIG.batchSize);
    let ok = false;
    try {
      const res = await fetch(EVENTS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: toPayload(batch) }),
        keepalive: true,
      });
      ok = res.ok;
    } catch {
      ok = false;
    }

    if (!ok) {
      // Requeue survivors at the front, incrementing their retry counter.
      const survivors = batch
        .map((e) => ({ ...e, _retries: (e._retries ?? 0) + 1 }))
        .filter((e) => (e._retries ?? 0) <= QUEUE_CONFIG.maxRetries);
      this.buffer.unshift(...survivors);
    }

    this.persist();
    this.flushing = false;

    if (this.buffer.length > 0) {
      const attempt = Math.max(1, this.buffer[0]?._retries ?? 0);
      this.scheduleFlush(ok ? 0 : QUEUE_CONFIG.retryBackoffMs * attempt);
    }
  }

  /**
   * Best-effort synchronous flush for page unload. Uses sendBeacon so the
   * request survives the tab closing (fetch/keepalive is unreliable here).
   */
  flushOnUnload(): void {
    if (this.buffer.length === 0 || typeof navigator === 'undefined') return;
    const batch = this.buffer.splice(0, QUEUE_CONFIG.batchSize);
    const body = JSON.stringify({ events: toPayload(batch) });
    let sent = false;
    if (typeof navigator.sendBeacon === 'function') {
      try {
        sent = navigator.sendBeacon(EVENTS_ENDPOINT, new Blob([body], { type: 'application/json' }));
      } catch {
        sent = false;
      }
    }
    if (!sent) {
      // Put it back so it can be persisted + replayed next load.
      this.buffer.unshift(...batch);
    }
    this.persist();
  }

  // ── Offline persistence ─────────────────────────────────────
  private persist(): void {
    if (typeof window === 'undefined') return;
    try {
      if (this.buffer.length === 0) {
        window.localStorage.removeItem(QUEUE_CONFIG.storageKey);
      } else {
        window.localStorage.setItem(QUEUE_CONFIG.storageKey, JSON.stringify(this.buffer));
      }
    } catch {
      /* storage full/blocked — degrade silently */
    }
  }

  private restore(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(QUEUE_CONFIG.storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        this.buffer = parsed
          .filter((e) => e && typeof e.eventType === 'string')
          .slice(0, QUEUE_CONFIG.maxBufferSize);
      }
    } catch {
      /* ignore corrupt buffer */
    }
  }

  get size(): number {
    return this.buffer.length;
  }
}
