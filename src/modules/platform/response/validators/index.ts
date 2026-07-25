// ==========================================================================
// Validators — the validation PIPELINE. A list of independent rules run over the
// normalized response; each returns issues. A single blocking `error` makes the
// result invalid. A heuristic `quality` (0..1) is derived from the warnings.
//
// Rules are pure and composable — add a rule by pushing to RULES; nothing else
// changes. This is provider-independent (runs on the normalized shape).
// ==========================================================================

import { RESPONSE_CONFIG } from '../config';
import { clamp01 } from '../utils';
import type { NormalizedResponse } from '../normalizers';
import type { ValidationIssue, ValidationResult } from '../types';

type Rule = (r: NormalizedResponse) => ValidationIssue[];

const empty: Rule = (r) =>
  r.empty ? [{ code: 'empty', message: 'Response text is empty.', severity: 'error' }] : [];

const tooShort: Rule = (r) =>
  !r.empty && r.text.length < RESPONSE_CONFIG.minLength
    ? [{ code: 'too_short', message: 'Response is suspiciously short.', severity: 'warning' }]
    : [];

const tooLong: Rule = (r) =>
  r.text.length > RESPONSE_CONFIG.maxLength
    ? [{ code: 'too_long', message: 'Response exceeds the maximum length.', severity: 'warning' }]
    : [];

const truncated: Rule = (r) =>
  r.truncated
    ? [{ code: 'truncated', message: 'Response was cut off by the token limit.', severity: 'warning' }]
    : [];

const badFinish: Rule = (r) =>
  r.finishReason === 'error' || r.finishReason === 'cancelled'
    ? [{ code: `finish_${r.finishReason}`, message: `Provider finished with "${r.finishReason}".`, severity: 'error' }]
    : [];

const leakedPrompt: Rule = (r) =>
  /\b(system prompt|business rules|output instructions)\b/i.test(r.text)
    ? [{ code: 'possible_prompt_leak', message: 'Response may echo internal prompt sections.', severity: 'warning' }]
    : [];

const RULES: Rule[] = [empty, tooShort, tooLong, truncated, badFinish, leakedPrompt];

/** Run the validation pipeline over a normalized response. */
export function validate(r: NormalizedResponse): ValidationResult {
  const issues = RULES.flatMap((rule) => rule(r));
  const hasError = issues.some((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning').length;
  // Quality starts at 1, each warning costs 0.15, a blocking error zeroes it.
  const quality = hasError ? 0 : clamp01(1 - warnings * 0.15);
  return { valid: !hasError, issues, quality };
}
