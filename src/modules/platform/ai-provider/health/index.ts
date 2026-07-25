// ==========================================================================
// Provider health + metrics store (in-memory, globalThis singleton).
//
// Tracks per-provider latency, availability, token usage, circuit-breaker state
// and the last error. A dashboard reads snapshots; a future persistence layer can
// flush these to Prisma without changing callers. No Prisma model this phase.
// ==========================================================================

import { PROVIDER_CONFIG } from '../config';
import { ema } from '../utils';
import type { CircuitState, ProviderHealth, TokenUsage } from '../types';

interface HealthRecord {
  provider: string;
  circuit: CircuitState;
  consecutiveErrors: number;
  openedAt: number | null;
  totalCalls: number;
  totalErrors: number;
  totalTokens: number;
  dailyTokens: number;
  dailyBucket: string | null; // YYYY-MM-DD (from a passed timestamp)
  avgResponseTimeMs: number | null;
  lastLatencyMs: number | null;
  lastError: string | null;
  lastCallAtMs: number | null;
  timeoutCount: number;
  fallbackCount: number;
}

type Store = Map<string, HealthRecord>;
const KEY = '__jivo_ai_provider_health__';
function store(): Store {
  const g = globalThis as Record<string, unknown>;
  if (!g[KEY]) g[KEY] = new Map<string, HealthRecord>();
  return g[KEY] as Store;
}

function record(provider: string): HealthRecord {
  const s = store();
  let r = s.get(provider);
  if (!r) {
    r = {
      provider,
      circuit: 'closed',
      consecutiveErrors: 0,
      openedAt: null,
      totalCalls: 0,
      totalErrors: 0,
      totalTokens: 0,
      dailyTokens: 0,
      dailyBucket: null,
      avgResponseTimeMs: null,
      lastLatencyMs: null,
      lastError: null,
      lastCallAtMs: null,
      timeoutCount: 0,
      fallbackCount: 0,
    };
    s.set(provider, r);
  }
  return r;
}

/** Circuit breaker: can we call this provider now? (nowMs from the caller). */
export function canCall(provider: string, nowMs: number): boolean {
  const r = record(provider);
  if (r.circuit === 'open') {
    if (r.openedAt !== null && nowMs - r.openedAt >= PROVIDER_CONFIG.circuitResetMs) {
      r.circuit = 'half-open'; // allow a probe
      return true;
    }
    return false;
  }
  return true;
}

function rollDaily(r: HealthRecord, nowMs: number): void {
  const bucket = new Date(nowMs).toISOString().slice(0, 10);
  if (r.dailyBucket !== bucket) {
    r.dailyBucket = bucket;
    r.dailyTokens = 0;
  }
}

/** Record a successful call. Returns whether the circuit just closed. */
export function recordSuccess(
  provider: string,
  latencyMs: number,
  usage: TokenUsage,
  nowMs: number,
): { circuitClosed: boolean } {
  const r = record(provider);
  const wasHalfOpen = r.circuit === 'half-open';
  rollDaily(r, nowMs);
  r.totalCalls += 1;
  r.totalTokens += usage.totalTokens;
  r.dailyTokens += usage.totalTokens;
  r.lastLatencyMs = latencyMs;
  r.avgResponseTimeMs = ema(r.avgResponseTimeMs, latencyMs);
  r.lastCallAtMs = nowMs;
  r.consecutiveErrors = 0;
  r.circuit = 'closed';
  r.openedAt = null;
  return { circuitClosed: wasHalfOpen };
}

/** Record a failed call. Returns whether the circuit just opened. */
export function recordFailure(provider: string, error: string, nowMs: number): { circuitOpened: boolean } {
  const r = record(provider);
  rollDaily(r, nowMs);
  r.totalCalls += 1;
  r.totalErrors += 1;
  r.consecutiveErrors += 1;
  r.lastError = error;
  r.lastCallAtMs = nowMs;
  let opened = false;
  if (r.consecutiveErrors >= PROVIDER_CONFIG.circuitErrorThreshold && r.circuit !== 'open') {
    r.circuit = 'open';
    r.openedAt = nowMs;
    opened = true;
  } else if (r.circuit === 'half-open') {
    r.circuit = 'open'; // probe failed → re-open
    r.openedAt = nowMs;
  }
  return { circuitOpened: opened };
}

function statusOf(r: HealthRecord, configured: boolean): ProviderHealth['status'] {
  if (!configured) return 'unknown';
  if (r.circuit === 'open') return 'down';
  if (r.totalCalls === 0) return 'unknown';
  const availability = (r.totalCalls - r.totalErrors) / r.totalCalls;
  if (availability < 0.9 || r.circuit === 'half-open') return 'degraded';
  return 'healthy';
}

/** Record a provider timeout (subset of failures; kept as its own metric). */
export function recordTimeout(provider: string): void {
  record(provider).timeoutCount += 1;
}

/** Record that a fallback provider was used in place of this one. */
export function recordFallback(provider: string): void {
  record(provider).fallbackCount += 1;
}

/** A public snapshot for the dashboard. */
export function getHealth(provider: string, configured: boolean): ProviderHealth {
  const r = record(provider);
  const availability = r.totalCalls ? (r.totalCalls - r.totalErrors) / r.totalCalls : 0;
  const successRate = r.totalCalls ? (r.totalCalls - r.totalErrors) / r.totalCalls : 0;
  return {
    provider,
    status: statusOf(r, configured),
    circuit: r.circuit,
    availability: Math.round(availability * 100) / 100,
    avgResponseTimeMs: r.avgResponseTimeMs ?? 0,
    lastLatencyMs: r.lastLatencyMs,
    totalCalls: r.totalCalls,
    totalErrors: r.totalErrors,
    totalTokens: r.totalTokens,
    dailyTokens: r.dailyTokens,
    timeoutCount: r.timeoutCount,
    fallbackCount: r.fallbackCount,
    successRate: Math.round(successRate * 100) / 100,
    failureRate: Math.round((1 - successRate) * 100) / 100,
    lastError: r.lastError,
    lastCallAt: r.lastCallAtMs !== null ? new Date(r.lastCallAtMs).toISOString() : null,
    configured,
  };
}
