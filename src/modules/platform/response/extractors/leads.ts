// ==========================================================================
// Lead + contact detector — heuristic scoring over BOTH the user's question and
// the AI response. Flags sales/contact opportunities and captures any contact
// details the user volunteered, for a future CRM / lead-capture flow.
// ==========================================================================

import { INTENT_KEYWORDS, RESPONSE_CONFIG } from '../config';
import { clamp01, countHits } from '../utils';
import type { LeadSignal, ResponseEntity } from '../types';

/**
 * Score a lead from the conversation turn. The user's intent weighs more than the
 * assistant's text (the user is the buyer). Volunteered email/phone is a strong
 * contact signal.
 */
export function detectLead(question: string | undefined, responseText: string, entities: ResponseEntity[]): LeadSignal {
  const q = (question ?? '').toLowerCase();
  const a = responseText.toLowerCase();
  const reasons: string[] = [];

  const buying = countHits(q, INTENT_KEYWORDS.buying) * 2 + countHits(a, INTENT_KEYWORDS.buying);
  const contact = countHits(q, INTENT_KEYWORDS.contact) * 2 + countHits(a, INTENT_KEYWORDS.contact);
  const consult = countHits(q, INTENT_KEYWORDS.consultation) * 2 + countHits(a, INTENT_KEYWORDS.consultation);

  if (buying) reasons.push('buying_intent');
  if (contact) reasons.push('contact_intent');
  if (consult) reasons.push('consultation_intent');

  const email = entities.find((e) => e.kind === 'email');
  const phone = entities.find((e) => e.kind === 'phone');
  const hasContactDetail = Boolean(email || phone);
  if (hasContactDetail) reasons.push('contact_detail_shared');

  // Weighted score, saturating.
  const raw = buying * 0.18 + contact * 0.25 + consult * 0.2 + (hasContactDetail ? 0.4 : 0);
  const score = clamp01(raw);

  const wantsContact = contact > 0 || consult > 0 || hasContactDetail;

  return {
    isLead: score >= RESPONSE_CONFIG.leadThreshold,
    score,
    reasons,
    wantsContact,
    contact: { email: email?.normalized, phone: phone?.normalized },
  };
}
