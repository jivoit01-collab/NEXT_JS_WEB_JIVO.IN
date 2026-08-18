// ==========================================================================
// AI Experience Platform — types (the contract).
//
// Turns a StructuredResponse into an ordered EXPERIENCE PLAN: a list of card
// DESCRIPTORS (data, not JSX) that a future Chat UI renders. The PLANNER decides
// what to show from intent + business rules — never the LLM. Cards are
// registry-driven so new card kinds and future modules plug in automatically.
// ==========================================================================

import type { StructuredResponse } from '@/modules/platform/response';

/** Every supported card kind. `buy_product` is prepared for future e-commerce. */
export type CardKind =
  | 'answer'
  | 'product'
  | 'cms'
  | 'read_more'
  | 'cta'
  | 'suggested_questions'
  | 'social'
  | 'contact'
  | 'feedback_cta'
  | 'buy_product';

// ── Card payloads ────────────────────────────────────────────
export interface AnswerCardData {
  blocks: StructuredResponse['blocks'];
  text: string;
  citations: StructuredResponse['citations'];
}
/** CMS SEO metadata used to preview a link's destination (never duplicated into any table). */
export interface CardPreview {
  /** Absolute destination URL. */
  url: string;
  title: string;
  description: string | null;
  /** ABSOLUTE image URL — a relative value renders as a broken image. */
  image: string | null;
  siteName?: string;
  domain?: string;
}

export interface ProductCardData {
  title: string;
  entityId: string | null;
  url: string | null;
  relevanceScore: number;
  preview?: CardPreview | null;
}
export interface CmsCardData {
  title: string;
  entityType: string;
  entityId: string | null;
  url: string | null;
  preview?: CardPreview | null;
}
export interface ReadMoreCardData {
  title: string;
  url: string;
  external: boolean;
}
export interface CtaCardData {
  label: string;
  action: string; // ActionType from the response platform
  target?: string;
}
export interface SuggestedQuestionsData {
  questions: string[];
}
export interface SocialCardData {
  message: string;
  /** Visible footer social links (platform + url). Never invented. */
  links?: { platform: string; url: string }[];
}

/** A marketplace option for a purchase turn — configuration-driven, may be empty. */
export interface MarketplaceLink {
  key: string;
  label: string;
  url: string;
}
export interface ContactCardData {
  reasons: string[];
  /** Verified business contact details (CMS-sourced) shown on the card. */
  prefill: { email?: string; phone?: string; address?: string };
}
export interface FeedbackCtaData {
  entityType: string;
  entityId: string | null;
  prompt: string;
}
export interface BuyProductCardData {
  title: string;
  entityId: string | null;
  /** Prepared — pricing/checkout arrive with the e-commerce phase. */
  available: boolean;
  /** Configured marketplaces shown beside the official shop link. */
  marketplaces?: MarketplaceLink[];
  /** Storefront URL (shop.jivo.in), supplied by the caller from shared config. */
  url?: string | null;
}

export type CardData =
  | AnswerCardData
  | ProductCardData
  | CmsCardData
  | ReadMoreCardData
  | CtaCardData
  | SuggestedQuestionsData
  | SocialCardData
  | ContactCardData
  | FeedbackCtaData
  | BuyProductCardData;

/** A planned card — provider/UI-agnostic descriptor. */
export interface ExperienceCard<D extends CardData = CardData> {
  id: string; // stable within a plan
  kind: CardKind;
  /** Lower renders first. */
  order: number;
  /** 0..1 confidence this card belongs. */
  confidence: number;
  /** Which module produced it (for future-module attribution). */
  source: string;
  data: D;
}

// ── Planner input / output ───────────────────────────────────
/** Business context the planner reasons over (NOT the LLM). */
export interface PlanContext {
  response: StructuredResponse;
  /** The user's question — sharpens intent. */
  question?: string;
  /** Surface hint (e.g. 'chat', 'search', 'widget') for future rules. */
  surface?: string;
  /** Correlation for analytics (conversationId/messageId). */
  correlationId?: string;
  /** Feedback entity to attach a Feedback CTA to. */
  feedbackEntity?: { entityType: string; entityId: string | null };
  /**
   * VERIFIED business contact details, supplied by the caller from CMS/Knowledge.
   *
   * The Contact card renders these rather than details scraped out of the model's
   * own prose — the assistant is instructed not to write contact details (the card
   * shows them), and anything it did write could be hallucinated. Optional: when
   * absent the card falls back to whatever the lead signal captured.
   */
  siteContact?: { phone?: string; email?: string; address?: string };
  /**
   * The turn's classified intent, decided by the Gateway BEFORE retrieval.
   *
   * It distinguishes PRODUCT_PAGE ("tell me about Canola Oil" → the product page)
   * from PURCHASE ("where can I buy it?" → the shop), which citations alone
   * cannot: both retrieve the same product documents.
   */
  turnIntent?:
    | 'security'
    | 'purchase'
    | 'contact'
    | 'product_page'
    | 'all_products'
    | 'company'
    | 'conversation'
    | 'social'
    | 'general';
  /** Absolute storefront URL, supplied by the caller from shared config. */
  shopUrl?: string;
  /**
   * Path → CMS SEO metadata, supplied by the caller. Lets a link card render the
   * destination page's real title/description/OG image without a second lookup
   * and without copying SEO data into any conversation table.
   */
  pagePreviews?: Record<string, CardPreview>;
  /** Preview for the storefront (no CMS SeoMeta row exists for shop.jivo.in). */
  shopPreview?: CardPreview;
  /** Visible footer social links, supplied by the caller. */
  socialLinks?: { platform: string; url: string }[];
  /** Configured marketplaces (Amazon, Flipkart…). Empty when none are set. */
  marketplaces?: MarketplaceLink[];
}

export interface ExperiencePlan {
  id: string;
  cards: ExperienceCard[];
  /** Intents the planner derived (drives which cards appear). */
  intents: string[];
  metadata: {
    correlationId: string | null;
    surface: string | null;
    cardCount: number;
    truncated: boolean; // cards dropped by the max-card limit
    createdAt: string | null; // stamped at the action boundary
  };
}

/**
 * A registry-driven card builder. `canRender` gates eligibility (business rules);
 * `build` returns zero or more cards. Builders are pure and provider-neutral.
 */
export interface CardBuilder {
  kind: CardKind;
  source: string;
  /** Higher = considered earlier; also the default order band. */
  priority: number;
  canRender: (ctx: PlanContext, intents: Set<string>) => boolean;
  build: (ctx: PlanContext, intents: Set<string>) => ExperienceCard[];
}

// ── Events (Core Event Bus — experience analytics) ───────────
export const EXPERIENCE_EVENTS = {
  PLANNED: 'ai:experience_planned',
  CARD_ADDED: 'ai:experience_card_added',
  EMPTY: 'ai:experience_empty',
  TRUNCATED: 'ai:experience_truncated',
} as const;

export type ExperienceEventName = (typeof EXPERIENCE_EVENTS)[keyof typeof EXPERIENCE_EVENTS];
