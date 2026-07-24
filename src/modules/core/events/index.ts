// ==========================================================================
// Core / Events — platform event bus (platform emits, business subscribes).
//
//   import { platformEvents } from '@/modules/core/events';
//   const off = platformEvents.on('consent:accepted', ({ categories }) => { … });
//   // business modules add their own events without touching core:
//   platformEvents.emit('product:viewed', { productId });
//
// See docs/tracking-engine.md → "Architecture Changes".
// ==========================================================================

export { platformEvents } from './event-bus';
export type {
  PlatformEventMap,
  CoreEventName,
  EventHandler,
  Unsubscribe,
} from './types';
