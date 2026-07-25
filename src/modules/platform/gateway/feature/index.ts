// ==========================================================================
// Master AI feature flag — the ONE switch that turns the whole AI stack on/off.
//
// Resolution order (first defined wins):
//   1. NEXT_PUBLIC_AI_ENABLED  (client + server; ops override, no code change)
//   2. AI_ENABLED              (server-only override)
//   3. PLATFORM_FEATURES.ai    (core config default)
//
// Client-safe. When this returns false: the widget hides and the Gateway refuses
// requests with a friendly disabled message — no AI work happens anywhere.
// ==========================================================================

import { isFeatureEnabled } from '@/modules/core/config';

function envFlag(value: string | undefined): boolean | null {
  if (value === undefined) return null;
  const v = value.trim().toLowerCase();
  if (['1', 'true', 'on', 'yes'].includes(v)) return true;
  if (['0', 'false', 'off', 'no'].includes(v)) return false;
  return null;
}

/** Is the AI platform enabled right now? (the master AI_ENABLED switch) */
export function isAiEnabled(): boolean {
  const pub = envFlag(process.env.NEXT_PUBLIC_AI_ENABLED);
  if (pub !== null) return pub;
  const srv = envFlag(process.env.AI_ENABLED);
  if (srv !== null) return srv;
  return isFeatureEnabled('ai');
}

/** Message shown/returned when the AI platform is disabled. */
export const AI_DISABLED_MESSAGE =
  'Our AI assistant is currently unavailable. Please reach out to our team and we’ll be happy to help.';
