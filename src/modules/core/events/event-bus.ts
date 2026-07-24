// ==========================================================================
// EventBus — a tiny, dependency-free, in-process pub/sub.
//
//  • Platform modules EMIT ("consent:accepted", "session:started", …).
//  • Business modules SUBSCRIBE (AI, dashboard, product analytics) without the
//    platform ever importing them — decoupling that enforces the one-way
//    dependency rule.
//  • Handlers are error-isolated: one throwing subscriber never breaks emit or
//    the other subscribers.
//  • Synchronous + best-effort: this is an app-lifetime signal bus, not a
//    durable queue. Durable analytics events go through the tracking queue.
// ==========================================================================

import type { CoreEventName, EventHandler, PlatformEventMap, Unsubscribe } from './types';

type AnyHandler = EventHandler<never>;

class EventBus {
  private handlers = new Map<string, Set<AnyHandler>>();

  /** Subscribe to a core event (typed) or any business event (string). */
  on<K extends CoreEventName>(event: K, handler: EventHandler<PlatformEventMap[K]>): Unsubscribe;
  on(event: string, handler: EventHandler<unknown>): Unsubscribe;
  on(event: string, handler: AnyHandler): Unsubscribe {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(handler);
    return () => this.off(event, handler);
  }

  /** Subscribe once; auto-unsubscribes after the first emit. */
  once<K extends CoreEventName>(event: K, handler: EventHandler<PlatformEventMap[K]>): Unsubscribe;
  once(event: string, handler: EventHandler<unknown>): Unsubscribe;
  once(event: string, handler: AnyHandler): Unsubscribe {
    const wrapper: AnyHandler = ((payload: never) => {
      this.off(event, wrapper);
      (handler as (p: never) => void)(payload);
    }) as AnyHandler;
    return this.on(event, wrapper as EventHandler<unknown>);
  }

  off(event: string, handler: AnyHandler): void {
    const set = this.handlers.get(event);
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) this.handlers.delete(event);
  }

  /** Emit a core event (typed payload) or any business event (string). */
  emit<K extends CoreEventName>(event: K, payload: PlatformEventMap[K]): void;
  emit(event: string, payload?: unknown): void;
  emit(event: string, payload?: unknown): void {
    const set = this.handlers.get(event);
    if (!set || set.size === 0) return;
    // Copy so handlers that unsubscribe during dispatch don't mutate the set mid-loop.
    for (const handler of [...set]) {
      try {
        (handler as (p: unknown) => void)(payload);
      } catch (err) {
        // Never let one subscriber break the emit.
        console.error(`[events] handler for "${event}" threw`, err);
      }
    }
  }

  /** Test/teardown helper — drop all subscribers. */
  clear(): void {
    this.handlers.clear();
  }
}

/**
 * Process-wide singleton. Stored on globalThis so Next's dev HMR / multiple
 * module instances still share ONE bus (otherwise emitters and subscribers
 * could end up on different copies).
 */
const globalRef = globalThis as typeof globalThis & { __jivoPlatformEvents?: EventBus };

export const platformEvents: EventBus = globalRef.__jivoPlatformEvents ?? new EventBus();
if (!globalRef.__jivoPlatformEvents) globalRef.__jivoPlatformEvents = platformEvents;
