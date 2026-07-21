import { TRACK_EVENT, LIMITS, type TrackEventType } from './constants';
import type { TrackEventInput } from './types';

const EVENT_TYPES = new Set<string>(Object.values(TRACK_EVENT));

/** Is this a known event type the server will accept? */
export function isValidEventType(value: string): value is TrackEventType {
  return EVENT_TYPES.has(value);
}

/**
 * Trim + collapse whitespace + strip control chars + hard-cap a
 * user/DOM-derived string. Built without a control-char regex literal
 * (codepoint filter) so it stays lint-clean and unambiguous.
 */
export function sanitizeString(value: unknown, max: number = LIMITS.maxStringLength): string | undefined {
  if (typeof value !== 'string') return undefined;
  let out = '';
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    // Drop C0 controls (0-31) and DEL (127); keep everything else.
    out += code < 32 || code === 127 ? ' ' : ch;
  }
  const cleaned = out.replace(/\s+/g, ' ').trim();
  if (!cleaned) return undefined;
  return cleaned.slice(0, max);
}

/**
 * Sanitize a metadata bag: keep only primitive/serializable values, drop the
 * whole thing if it serializes larger than the byte cap. Never trust the DOM.
 */
export function sanitizeMetadata(
  input: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!input || typeof input !== 'object') return undefined;

  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(input)) {
    if (raw == null) continue;
    const k = key.slice(0, 60);
    if (typeof raw === 'string') {
      const s = sanitizeString(raw);
      if (s !== undefined) out[k] = s;
    } else if (typeof raw === 'number' && Number.isFinite(raw)) {
      out[k] = raw;
    } else if (typeof raw === 'boolean') {
      out[k] = raw;
    }
    // objects/arrays/functions are intentionally dropped — keep payloads flat + safe.
  }

  if (Object.keys(out).length === 0) return undefined;
  try {
    if (JSON.stringify(out).length > LIMITS.maxMetadataBytes) return undefined;
  } catch {
    return undefined;
  }
  return out;
}

/**
 * Validate + normalize an event before it enters the queue.
 * Returns null for anything the server would reject (so we never queue garbage).
 */
export function normalizeEvent(event: TrackEventInput): TrackEventInput | null {
  if (!event || !isValidEventType(event.eventType)) return null;
  return {
    eventType: event.eventType,
    page: sanitizeString(event.page, 500),
    entityType: sanitizeString(event.entityType, 120),
    entityId: sanitizeString(event.entityId, 200),
    metadata: sanitizeMetadata(event.metadata),
  };
}
