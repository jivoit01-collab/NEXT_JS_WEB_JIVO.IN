// ==========================================================================
// Platform / Experience (Phase 7.5) — public barrel.
//
// The reusable AI Experience Platform: an Experience PLANNER that turns a
// StructuredResponse into an ordered ExperiencePlan of card DESCRIPTORS (Product,
// CMS, Read More, CTA, Suggested Questions, Social, Contact, Feedback CTA, and
// future Buy Product). The PLANNER decides what to show from intent + business
// rules — NEVER the LLM. Cards are registry-driven, so new kinds and future
// modules plug in automatically.
//
// It consumes a StructuredResponse from the Response Platform. It calls NO LLM,
// no external API, and renders NO Chat UI — it produces data a future UI renders.
// Pure & isomorphic.
//
// Import boundaries:
//   • Client/runtime → this barrel (planner, engine, registry, config, types)
//   • Server actions  → '@/modules/platform/experience/actions' (admin-guarded)
//
// Docs: docs/ai-experience-platform.md
// ==========================================================================

// Facade + stages.
export { planExperience, listCardBuilders, registeredCardKinds } from './services';
export { plan, type PlanDraft } from './planner';
export { assemble } from './engine';
export { emitExperienceEvents } from './analytics';

// Card registry (register new/ future-module cards here).
export { registerCard, getCard, getCard as getCardBuilder } from './registry';
export { makeCard, BUILTIN_CARD_KINDS } from './cards';

// Admin-guarded actions.
export { planExperienceAction, listCardKindsAction } from './actions';

// Config + flags (client-safe).
export {
  EXPERIENCE_FEATURES,
  EXPERIENCE_CONFIG,
  CARD_ORDER,
  SUGGESTED_QUESTIONS,
  isExperienceFeatureEnabled,
  type ExperienceFeature,
} from './config';

// Utils (client-safe).
export { deriveIntents, stableId, clamp01 } from './utils';

// Events + types.
export { EXPERIENCE_EVENTS } from './types';
export type {
  CardKind,
  CardData,
  ExperienceCard,
  CardBuilder,
  PlanContext,
  ExperiencePlan,
  ExperienceEventName,
  AnswerCardData,
  ProductCardData,
  CmsCardData,
  ReadMoreCardData,
  CtaCardData,
  SuggestedQuestionsData,
  SocialCardData,
  ContactCardData,
  FeedbackCtaData,
  BuyProductCardData,
} from './types';
