// ==========================================================================
// AI Experience configuration — flags, card priorities and business rules.
// The PLANNER reads these; the LLM never decides layout. Client-safe.
// ==========================================================================

import type { CardKind } from '../types';

export const EXPERIENCE_FEATURES = {
  planner: true,
  productCards: true,
  cmsCards: true,
  readMoreCards: true,
  ctaCards: true,
  suggestedQuestions: true,
  socialCards: true,
  contactCards: true,
  feedbackCta: true,

  // Prepared, off until the relevant phase.
  // The shop-link card ("Buy Jivo Canola Oil →" / "Shop Jivo Products →"). It is
  // just a link to the storefront, not in-chat checkout, so it is safe to enable:
  // purchase questions need a destination and shop.jivo.in is it.
  buyProductCards: true,
  personalization: false, // per-user card ordering
} as const;

export type ExperienceFeature = keyof typeof EXPERIENCE_FEATURES;

export function isExperienceFeatureEnabled(feature: ExperienceFeature): boolean {
  return EXPERIENCE_FEATURES[feature] === true;
}

/**
 * Default render-order band per card kind (lower renders first). The answer is
 * always first; supporting cards, then CTAs, then feedback last.
 */
export const CARD_ORDER: Record<CardKind, number> = {
  answer: 0,
  product: 10,
  buy_product: 15,
  cms: 20,
  read_more: 30,
  suggested_questions: 40,
  cta: 50,
  contact: 60,
  social: 70,
  feedback_cta: 90,
};

export const EXPERIENCE_CONFIG = {
  /** Hard cap on cards in one plan (answer excluded from the cap). */
  maxCards: 8,
  /** Max product cards. */
  maxProductCards: 3,
  /** Max CMS/read-more cards. */
  maxContentCards: 3,
  /** Max suggested questions. */
  maxSuggestedQuestions: 3,
  /** Lead score at/above which a Contact card is shown. */
  contactLeadThreshold: 0.5,
  /** Only attach a Feedback CTA when response quality is at least this. */
  feedbackMinQuality: 0.4,
} as const;

/**
 * Canned follow-up questions (planner picks, never the LLM).
 *
 * Keyed by TOPIC first (what the user just asked about) and intent second, so a
 * follow-up moves the conversation forward instead of repeating it — e.g. after
 * a contact answer we never suggest "How can I contact your team?" again.
 */
export const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  // Topic-specific follow-ups.
  canola: ['What are the benefits of Canola oil?', 'Where can I buy it?', 'Which other oils do you offer?'],
  olive: ['What are the benefits of Olive oil?', 'Where can I buy it?', 'Which other oils do you offer?'],
  mustard: ['What are the benefits of Mustard oil?', 'Where can I buy it?', 'Which other oils do you offer?'],
  groundnut: ['What are the benefits of Groundnut oil?', 'Where can I buy it?', 'Which other oils do you offer?'],
  company: ['What products do you offer?', 'Tell me about Canola Oil', 'Where can I buy Jivo products?'],
  products: ['Tell me about Canola Oil', 'Which oil is best for cooking?', 'Where can I buy Jivo products?'],
  certifications: ['What products do you offer?', 'Tell me about Jivo', 'Where can I buy Jivo products?'],

  // Intent fallbacks.
  buying_intent: ['Which product is best for me?', 'Tell me about Canola Oil', 'What certifications do you have?'],
  consultation_intent: ['Can I book a consultation?', 'What does a consultation cover?'],
  contact_intent: ['What products do you offer?', 'Where can I buy Jivo products?', 'Tell me about Jivo'],
  default: ['Tell me about Jivo', 'What products do you offer?', 'Where can I buy Jivo products?'],
};

/** Question keywords → SUGGESTED_QUESTIONS topic key. First match wins. */
export const SUGGESTION_TOPICS: readonly (readonly [string, readonly string[]])[] = [
  ['canola', ['canola']],
  ['olive', ['olive']],
  ['mustard', ['mustard']],
  ['groundnut', ['groundnut', 'peanut']],
  ['certifications', ['certification', 'certified', 'quality standard', 'fssc', 'fda']],
  ['products', ['product', 'oil', 'range', 'catalogue', 'catalog', 'buy', 'shop']],
  ['company', ['about jivo', 'who are you', 'about the company', 'your story', 'tell me about jivo']],
] as const;
