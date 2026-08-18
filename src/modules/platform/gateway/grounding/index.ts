import 'server-only';

// ==========================================================================
// Grounding seam — WHERE an answer's facts are allowed to come from.
//
// IMPORTANT: a GEMINI_API_KEY does NOT grant live Google Search. The plain
// `generateContent` endpoint answers from the model's training data only, with
// no browsing. Any "web grounding" therefore needs a deliberate integration
// (Google Search grounding tool, or a search API) — this module is the single
// seam where that plugs in, so nothing else in the pipeline has to change.
//
// It is OFF by default (`WEB_GROUNDING_ENABLED`). Even when enabled, a web
// lookup runs only when Jivo Knowledge could not answer, never on every turn —
// external calls cost latency, money and privacy.
// ==========================================================================

/**
 * Where a fact came from, most authoritative first. Jivo's own data always
 * outranks the open web, so official product information can never be
 * overwritten by a random search result.
 */
export type SourceType = 'JIVO_KNOWLEDGE' | 'JIVO_PAGE' | 'SHOP' | 'WEB' | 'MODEL_KNOWLEDGE';

/** Lower number = higher authority. Used to rank/merge candidate sources. */
export const SOURCE_PRIORITY: Record<SourceType, number> = {
  JIVO_KNOWLEDGE: 0,
  JIVO_PAGE: 1,
  SHOP: 2,
  WEB: 3,
  MODEL_KNOWLEDGE: 4,
};

/** True when `a` is at least as authoritative as `b`. */
export function outranks(a: SourceType, b: SourceType): boolean {
  return SOURCE_PRIORITY[a] <= SOURCE_PRIORITY[b];
}

/** Master switch. Off unless explicitly enabled in the environment. */
export function isWebGroundingEnabled(): boolean {
  const raw = process.env.WEB_GROUNDING_ENABLED ?? '';
  return raw.toLowerCase() === 'true' || raw === '1';
}

/** Questions that are about Jivo itself — these must be answered from Jivo data. */
const JIVO_SCOPE = /\bjivo\b|\bcanola\b|\bolive\b|\bmustard\b|\bgroundnut\b|\bwheatgrass\b|\bghee\b/i;

export interface GroundingDecision {
  /** Should an external web lookup run for this turn? */
  useWeb: boolean;
  /** Why — recorded for observability and easy debugging. */
  reason: string;
}

/**
 * Decide whether this turn needs the open web.
 *
 * Knowledge comes first, always. The web is considered only when the question is
 * NOT about Jivo (a general wellness question such as "what are the benefits of
 * Omega-3?") *and* Jivo Knowledge returned nothing useful.
 */
export function decideGrounding(input: {
  question: string;
  retrievedDocs: number;
}): GroundingDecision {
  if (!isWebGroundingEnabled()) {
    return { useWeb: false, reason: 'web_grounding_disabled' };
  }
  if (JIVO_SCOPE.test(input.question)) {
    // Official Jivo data wins for Jivo facts — never supplement with the web.
    return { useWeb: false, reason: 'jivo_scoped_question' };
  }
  if (input.retrievedDocs > 0) {
    return { useWeb: false, reason: 'answered_by_knowledge' };
  }
  return { useWeb: true, reason: 'general_question_no_knowledge' };
}

/**
 * Perform the external lookup.
 *
 * Intentionally unimplemented: no search provider is configured for this project
 * yet, and silently returning invented "web results" would be worse than
 * returning none. When a provider is added, implement it HERE and every caller
 * keeps working unchanged.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function searchWeb(query: string): Promise<{ title: string; url: string; snippet: string }[]> {
  return [];
}
