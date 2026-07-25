// ==========================================================================
// Gateway analytics — placeholder events on the Core Event Bus. A future
// analytics module (or the AI dashboard) can subscribe. No direct tracking.
// ==========================================================================

import { platformEvents } from '@/modules/core/events';
import { GATEWAY_EVENTS } from '../types';
import type { AIGatewayResponse, GatewayChannel, GatewayIdentity } from '../types';

export function emitRequest(channel: GatewayChannel, correlationId: string): void {
  platformEvents.emit(GATEWAY_EVENTS.REQUEST, { channel, correlationId });
}

export function emitAuthenticated(identity: GatewayIdentity, channel: GatewayChannel): void {
  platformEvents.emit(GATEWAY_EVENTS.AUTHENTICATED, {
    channel,
    authenticated: identity.isAuthenticated,
    hasVisitor: Boolean(identity.visitorId),
  });
}

export function emitRateLimited(channel: GatewayChannel, retryAfterMs: number): void {
  platformEvents.emit(GATEWAY_EVENTS.RATE_LIMITED, { channel, retryAfterMs });
}

export function emitCompleted(res: AIGatewayResponse): void {
  platformEvents.emit(GATEWAY_EVENTS.COMPLETED, {
    channel: res.meta.channel,
    provider: res.meta.provider,
    conversationId: res.conversationId,
    responseTimeMs: res.meta.responseTimeMs,
    fromFallback: res.meta.fromFallback,
    fallbackMessage: res.meta.fromCacheOrFallbackMessage,
    correlationId: res.meta.correlationId,
  });
}

export function emitCancelled(channel: GatewayChannel, correlationId: string): void {
  platformEvents.emit(GATEWAY_EVENTS.CANCELLED, { channel, correlationId });
}

export function emitFailed(channel: GatewayChannel, error: string, correlationId: string): void {
  platformEvents.emit(GATEWAY_EVENTS.FAILED, { channel, error, correlationId });
}

export function emitStreamStarted(channel: GatewayChannel, correlationId: string): void {
  platformEvents.emit(GATEWAY_EVENTS.STREAM_STARTED, { channel, correlationId });
}
