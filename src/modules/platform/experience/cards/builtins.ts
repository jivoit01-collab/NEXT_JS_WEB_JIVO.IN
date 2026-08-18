// ==========================================================================
// Built-in card builders. Each is a pure, registry-driven CardBuilder whose
// `canRender` encodes the BUSINESS RULE for showing that card (never the LLM).
// Importing this file registers them all. A future module registers its own
// builders the same way and appears automatically.
// ==========================================================================

import {
  EXPERIENCE_CONFIG,
  EXPERIENCE_FEATURES,
  SUGGESTED_QUESTIONS,
  SUGGESTION_TOPICS,
} from '../config';
import { registerCard } from '../registry';
import { makeCard } from './helpers';
import type { CardBuilder, ExperienceCard, PlanContext } from '../types';
import type { ResponseCitation } from '@/modules/platform/response';

const SOURCE = 'core';

// ── Answer (always first) ────────────────────────────────────
const answerCard: CardBuilder = {
  kind: 'answer',
  source: SOURCE,
  priority: 100,
  canRender: (ctx) => ctx.response.validation.valid && !ctx.response.metadata.empty,
  build: (ctx) => [
    makeCard(
      'answer',
      SOURCE,
      { blocks: ctx.response.blocks, text: ctx.response.text, citations: ctx.response.citations },
      ctx,
      { confidence: ctx.response.validation.quality },
    ),
  ],
};

/**
 * CMS SEO metadata for a destination path (title/description/OG image).
 *
 * Supplied by the caller, so a link card can preview its destination without a
 * second database lookup and without any SEO copy being duplicated into a
 * conversation table.
 */
function previewFor(ctx: PlanContext, url: string | null) {
  if (!url || !ctx.pagePreviews) return null;
  const path = url.split(/[?#]/)[0]?.replace(/\/$/, '') || '/';
  return ctx.pagePreviews[path] ?? null;
}

/**
 * Collapse citations that point at the SAME page.
 *
 * Knowledge documents are chunked, so one CMS page can be cited several times
 * (chunk 0, chunk 2, …) and each would otherwise become its own identical card —
 * three "Jivo Canola Oil → /products/canola-oils" rows for one product. Keep the
 * highest-scoring citation per destination and drop the rest.
 */
function dedupeCitations(citations: ResponseCitation[]): ResponseCitation[] {
  const best = new Map<string, ResponseCitation>();
  for (const c of citations) {
    const key = c.url ?? `${c.entityType}:${c.entityId ?? c.title}`;
    const seen = best.get(key);
    if (!seen || c.relevanceScore > seen.relevanceScore) best.set(key, c);
  }
  return [...best.values()].sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// ── Product cards (from product-typed citations) ─────────────
const productCard: CardBuilder = {
  kind: 'product',
  source: SOURCE,
  priority: 90,
  // Product INFORMATION pages only. On a purchase/all-products turn the shop card
  // is the single correct destination, so these are suppressed to avoid sending a
  // buyer to a description page instead of the store.
  // Product cards belong to PRODUCT turns only. Retrieved documents must not
  // become cards on their own: a company or conversation question can still
  // retrieve product text, and showing a Canola card under "who is the founder?"
  // is exactly the irrelevance we are removing.
  canRender: (ctx, intents) =>
    EXPERIENCE_FEATURES.productCards &&
    (ctx.turnIntent === 'product_page' || ctx.turnIntent === 'general') &&
    (intents.has('product_context') || intents.has('buying_intent')),
  build: (ctx) => {
    const products = dedupeCitations(
      ctx.response.citations.filter((c) => c.entityType.toLowerCase().includes('product')),
    );
    return products.slice(0, EXPERIENCE_CONFIG.maxProductCards).map((c, i) =>
      makeCard(
        'product',
        SOURCE,
        {
          title: previewFor(ctx, c.url)?.title ?? c.title,
          entityId: c.entityId,
          url: c.url,
          relevanceScore: c.relevanceScore,
          preview: previewFor(ctx, c.url),
        },
        ctx,
        { confidence: c.relevanceScore, orderBump: i, salt: String(c.marker) },
      ),
    );
  },
};

// ── CMS cards (non-product cited content) ────────────────────
const cmsCard: CardBuilder = {
  kind: 'cms',
  source: SOURCE,
  priority: 80,
  // Company/editorial pages. Suppressed on PURCHASE (the shop is the answer) and
  // on CONVERSATION (nothing on the website answers "how long have we chatted").
  canRender: (ctx) =>
    EXPERIENCE_FEATURES.cmsCards &&
    ctx.turnIntent !== 'purchase' &&
    ctx.turnIntent !== 'conversation' &&
    ctx.turnIntent !== 'contact' &&
    ctx.response.citations.some((c) => !c.entityType.toLowerCase().includes('product')),
  build: (ctx) => {
    const items = dedupeCitations(
      ctx.response.citations.filter(
        // A CMS card is a LINK to a page, so a document with no page URL (the
        // contact record) has nothing to offer — skip it rather than emitting a
        // card the UI must then discard.
        (c) => c.resolved && Boolean(c.url) && !c.entityType.toLowerCase().includes('product'),
      ),
    );
    return items.slice(0, EXPERIENCE_CONFIG.maxContentCards).map((c, i) =>
      makeCard(
        'cms',
        SOURCE,
        {
          title: previewFor(ctx, c.url)?.title ?? c.title,
          entityType: c.entityType,
          entityId: c.entityId,
          url: c.url,
          preview: previewFor(ctx, c.url),
        },
        ctx,
        { confidence: c.relevanceScore, orderBump: i, salt: String(c.marker) },
      ),
    );
  },
};

// ── Read More cards (external links worth following) ─────────
const readMoreCard: CardBuilder = {
  kind: 'read_more',
  source: SOURCE,
  priority: 70,
  canRender: (ctx) => EXPERIENCE_FEATURES.readMoreCards && ctx.response.links.length > 0,
  build: (ctx) => {
    const links = ctx.response.links.slice(0, EXPERIENCE_CONFIG.maxContentCards);
    return links.map((l, i) =>
      makeCard('read_more', SOURCE, { title: l.label, url: l.href, external: l.external }, ctx, {
        confidence: 0.5,
        orderBump: i,
        salt: l.href,
      }),
    );
  },
};

// ── CTA cards (from the response's suggested actions) ────────
const ctaCard: CardBuilder = {
  kind: 'cta',
  source: SOURCE,
  priority: 60,
  canRender: (ctx) => EXPERIENCE_FEATURES.ctaCards && ctx.response.actions.length > 0,
  build: (ctx) =>
    ctx.response.actions.map((a, i) =>
      makeCard('cta', SOURCE, { label: a.label, action: a.type, target: a.target }, ctx, {
        confidence: a.confidence,
        orderBump: i,
        salt: a.type,
      }),
    ),
};

// ── Suggested Questions (canned, by intent — never the LLM) ──
const suggestedQuestionsCard: CardBuilder = {
  kind: 'suggested_questions',
  source: SOURCE,
  priority: 50,
  canRender: () => EXPERIENCE_FEATURES.suggestedQuestions,
  build: (ctx, intents) => {
    // TOPIC first (what was actually asked about), intent second. This keeps the
    // follow-ups on-subject and stops us re-suggesting the question just asked.
    const q = (ctx.question ?? '').toLowerCase();
    const topic = SUGGESTION_TOPICS.find(([, keywords]) => keywords.some((k) => q.includes(k)))?.[0];
    const key =
      topic ??
      (['buying_intent', 'consultation_intent', 'contact_intent'] as const).find((k) => intents.has(k)) ??
      'default';

    const questions = (SUGGESTED_QUESTIONS[key] ?? SUGGESTED_QUESTIONS.default)
      // Never offer back the question the user just asked.
      .filter((s) => s.toLowerCase() !== q.trim())
      .slice(0, EXPERIENCE_CONFIG.maxSuggestedQuestions);

    return [makeCard('suggested_questions', SOURCE, { questions }, ctx, { confidence: 0.4 })];
  },
};

// ── Contact card (strong lead / contact intent) ──────────────
const contactCard: CardBuilder = {
  kind: 'contact',
  source: SOURCE,
  priority: 55,
  // ONLY on an explicit contact/support request in the user's question. A high
  // lead score alone is not enough — buying intent used to cross the threshold
  // and push contact details onto ordinary product questions.
  canRender: (ctx) => EXPERIENCE_FEATURES.contactCards && ctx.response.lead.wantsContact,
  build: (ctx) => [
    makeCard(
      'contact',
      SOURCE,
      {
        reasons: ctx.response.lead.reasons,
        // Prefer the caller's VERIFIED CMS contact details over anything parsed
        // out of the model's prose (which it is told not to write, and could
        // hallucinate). Falls back to the lead signal when none were supplied.
        prefill: {
          phone: ctx.siteContact?.phone ?? ctx.response.lead.contact.phone,
          email: ctx.siteContact?.email ?? ctx.response.lead.contact.email,
          address: ctx.siteContact?.address,
        },
      },
      ctx,
      { confidence: Math.max(0.5, ctx.response.lead.score) },
    ),
  ],
};

// ── Social card (shareable, non-lead informational answers) ──
const socialCard: CardBuilder = {
  kind: 'social',
  source: SOURCE,
  // Highest priority so it is the FIRST section on a social turn. Rendered only
  // when the visitor actually asked about social AND real links are configured —
  // an empty footer means no card, never a placeholder.
  priority: 95,
  canRender: (ctx) =>
    EXPERIENCE_FEATURES.socialCards &&
    ctx.turnIntent === 'social' &&
    (ctx.socialLinks?.length ?? 0) > 0,
  build: (ctx) => [
    makeCard(
      'social',
      SOURCE,
      { message: 'Follow Jivo', links: ctx.socialLinks ?? [] },
      ctx,
      { confidence: 0.95 },
    ),
  ],
};

// ── Feedback CTA (reuses the Feedback Platform, entity-based) ─
const feedbackCta: CardBuilder = {
  kind: 'feedback_cta',
  source: SOURCE,
  priority: 20,
  canRender: (ctx) =>
    EXPERIENCE_FEATURES.feedbackCta && ctx.response.validation.quality >= EXPERIENCE_CONFIG.feedbackMinQuality,
  build: (ctx) => {
    const entity = ctx.feedbackEntity ?? { entityType: 'ai_response', entityId: ctx.correlationId ?? null };
    return [
      makeCard(
        'feedback_cta',
        SOURCE,
        { entityType: entity.entityType, entityId: entity.entityId, prompt: 'Was this helpful?' },
        ctx,
        { confidence: 0.5 },
      ),
    ];
  },
};

// ── Buy Product (PREPARED — e-commerce phase) ────────────────
const buyProductCard: CardBuilder = {
  kind: 'buy_product',
  source: SOURCE,
  priority: 85,
  // Purchase and "all products" both resolve to ONE destination: the storefront.
  // Selling happens on shop.jivo.in, so a buying question must never be answered
  // with a product *information* page (or, worse, several of them).
  canRender: (ctx, intents) =>
    EXPERIENCE_FEATURES.buyProductCards &&
    (ctx.turnIntent === 'purchase' || ctx.turnIntent === 'all_products' || intents.has('buying_intent')),
  build: (ctx): ExperienceCard[] => {
    if (!ctx.shopUrl) return [];
    // Name the product when we know it, so the card reads "Buy Jivo Canola Oil →".
    const product = ctx.response.citations.find((c) => c.entityType.toLowerCase().includes('product'));
    const title =
      ctx.turnIntent === 'purchase' && product ? `Buy ${product.title}` : 'Shop Jivo Products';
    // The whole card is the storefront link, so it carries a full preview.
    const preview = ctx.shopPreview
      ? { ...ctx.shopPreview, title }
      : { url: ctx.shopUrl, title, description: null, image: null };
    return [
      makeCard(
        'buy_product',
        SOURCE,
        {
          title,
          entityId: null,
          available: true,
          url: ctx.shopUrl,
          preview,
          // Only marketplaces with a REAL configured URL — never invented.
          marketplaces: ctx.marketplaces ?? [],
        },
        ctx,
        { confidence: 0.95, salt: 'shop' },
      ),
    ];
  },
};

for (const b of [
  answerCard,
  productCard,
  buyProductCard,
  cmsCard,
  readMoreCard,
  ctaCard,
  contactCard,
  suggestedQuestionsCard,
  socialCard,
  feedbackCta,
]) {
  registerCard(b);
}

export const BUILTIN_CARD_KINDS = [
  'answer',
  'product',
  'buy_product',
  'cms',
  'read_more',
  'cta',
  'contact',
  'suggested_questions',
  'social',
  'feedback_cta',
] as const;
