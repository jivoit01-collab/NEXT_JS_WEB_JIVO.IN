// ==========================================================================
// Suggested-action extractor — derive next-step actions the Experience Engine can
// render (buttons/chips), from the detected lead signal, links and citations.
// Provider-independent; bounded by RESPONSE_CONFIG.maxActions.
// ==========================================================================

import { RESPONSE_CONFIG } from '../config';
import type { LeadSignal, ResponseCitation, ResponseLink, SuggestedAction } from '../types';

export function suggestActions(
  lead: LeadSignal,
  links: ResponseLink[],
  citations: ResponseCitation[],
): SuggestedAction[] {
  const actions: SuggestedAction[] = [];

  if (lead.reasons.includes('consultation_intent')) {
    actions.push({ type: 'book_consultation', label: 'Book a consultation', confidence: lead.score });
  }
  if (lead.wantsContact || lead.reasons.includes('contact_intent')) {
    actions.push({ type: 'contact_support', label: 'Talk to our team', confidence: Math.max(0.5, lead.score) });
  }
  if (lead.reasons.includes('buying_intent')) {
    const product = citations.find((c) => c.entityType.toLowerCase().includes('product') && c.entityId);
    actions.push({
      type: 'view_product',
      label: 'View products',
      target: product?.entityId ?? undefined,
      confidence: lead.score,
    });
  }

  // First internal link → an "open link" affordance.
  const internal = links.find((l) => !l.external);
  if (internal) {
    actions.push({ type: 'open_link', label: internal.label.slice(0, 40), target: internal.href, confidence: 0.4 });
  }

  // De-dupe by type, keep the highest confidence, cap the count.
  const best = new Map<string, SuggestedAction>();
  for (const a of actions) {
    const prev = best.get(a.type);
    if (!prev || a.confidence > prev.confidence) best.set(a.type, a);
  }
  return [...best.values()]
    .sort((x, y) => y.confidence - x.confidence)
    .slice(0, RESPONSE_CONFIG.maxActions);
}
