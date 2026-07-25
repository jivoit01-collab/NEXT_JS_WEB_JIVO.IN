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
  buyProductCards: false, // e-commerce checkout
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

/** Canned follow-up questions by intent (planner picks, never the LLM). */
export const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  buying_intent: ['What are the prices?', 'Which product is best for me?', 'Is it in stock?'],
  consultation_intent: ['Can I book a consultation?', 'What does a consultation cover?'],
  contact_intent: ['How can I contact your team?', 'What are your support hours?'],
  default: ['Tell me more', 'What else can you help with?', 'Show related products'],
};
