// ==========================================================================
// AI Observability utils — pure, client-safe. Cost estimation lives here so both
// the recorder and the Provider dashboard share ONE formula (no duplication).
// ==========================================================================

import { COST_PER_1K_TOKENS } from '../config';

/** Estimate USD cost for a completion, given the model + token split. */
export function estimateCost(model: string | null | undefined, promptTokens: number, completionTokens: number): number {
  const rate = (model && COST_PER_1K_TOKENS[model]) || COST_PER_1K_TOKENS.default;
  const cost = (promptTokens / 1000) * rate.input + (completionTokens / 1000) * rate.output;
  return Math.round(cost * 1_000_000) / 1_000_000; // 6dp
}

/** Round a 0..1 ratio to 2 decimals. */
export function ratio(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100) / 100;
}
