// ==========================================================================
// Base adapter helpers — shared by concrete adapters. NO network here; just the
// small pieces (env key lookup, timing, prompt→text flattening) so each adapter
// stays tiny and the resilience/health logic lives outside the adapter.
// ==========================================================================

import type { BuiltPrompt } from '@/modules/platform/prompt';

/** Read a provider API key from the environment (server-only usage). */
export function readKey(...envNames: string[]): string | undefined {
  for (const n of envNames) {
    const v = process.env[n];
    if (v && v.trim()) return v.trim();
  }
  return undefined;
}

/** Flatten a BuiltPrompt into { system, user } text for text-in/text-out APIs. */
export function promptToText(prompt: BuiltPrompt): { system: string; user: string } {
  return { system: prompt.system, user: prompt.user };
}

/** Elapsed-ms helper using a monotonic-ish clock available in the runtime. */
export function elapsed(startMs: number, endMs: number): number {
  return Math.max(0, endMs - startMs);
}
