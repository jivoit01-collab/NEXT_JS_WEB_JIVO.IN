// ==========================================================================
// Platform event vocabulary.
//
// Core defines ONLY its own events here. Business modules (products, orders,
// chat, …) emit their own string-named events WITHOUT adding them to this map —
// that keeps the dependency arrow one-way (Core never learns business types).
// The bus accepts any string event; this map just adds type-safety for the
// core events everyone shares.
// ==========================================================================

/** Strongly-typed payloads for the platform's OWN events. */
export interface PlatformEventMap {
  'consent:updated': { status: string; categories: string[]; version: string };
  'consent:accepted': { categories: string[] };
  'consent:rejected': { categories: string[] };
  'session:started': { sessionId: string; visitorId: string; entryPage: string };
  'session:ended': { sessionId: string; visitorId: string };
  'page:viewed': { path: string; navType: string; previousPath?: string };
  'auth:login': { userId: string };
  'auth:logout': { userId?: string };
}

export type CoreEventName = keyof PlatformEventMap;

/** A subscriber; returns nothing. Errors are isolated by the bus. */
export type EventHandler<P> = (payload: P) => void;

/** Unsubscribe function returned by `on`/`once`. */
export type Unsubscribe = () => void;
