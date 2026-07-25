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
} from '../config';
import { registerCard } from '../registry';
import { makeCard } from './helpers';
import type { CardBuilder, ExperienceCard } from '../types';

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

// ── Product cards (from product-typed citations) ─────────────
const productCard: CardBuilder = {
  kind: 'product',
  source: SOURCE,
  priority: 90,
  canRender: (_ctx, intents) =>
    EXPERIENCE_FEATURES.productCards && (intents.has('product_context') || intents.has('buying_intent')),
  build: (ctx) => {
    const products = ctx.response.citations.filter((c) => c.entityType.toLowerCase().includes('product'));
    return products.slice(0, EXPERIENCE_CONFIG.maxProductCards).map((c, i) =>
      makeCard(
        'product',
        SOURCE,
        { title: c.title, entityId: c.entityId, url: c.url, relevanceScore: c.relevanceScore },
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
  canRender: (ctx) => EXPERIENCE_FEATURES.cmsCards && ctx.response.citations.some((c) => !c.entityType.toLowerCase().includes('product')),
  build: (ctx) => {
    const items = ctx.response.citations.filter(
      (c) => c.resolved && !c.entityType.toLowerCase().includes('product'),
    );
    return items.slice(0, EXPERIENCE_CONFIG.maxContentCards).map((c, i) =>
      makeCard(
        'cms',
        SOURCE,
        { title: c.title, entityType: c.entityType, entityId: c.entityId, url: c.url },
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
    const key =
      (['buying_intent', 'consultation_intent', 'contact_intent'] as const).find((k) => intents.has(k)) ?? 'default';
    const questions = (SUGGESTED_QUESTIONS[key] ?? SUGGESTED_QUESTIONS.default).slice(
      0,
      EXPERIENCE_CONFIG.maxSuggestedQuestions,
    );
    return [makeCard('suggested_questions', SOURCE, { questions }, ctx, { confidence: 0.4 })];
  },
};

// ── Contact card (strong lead / contact intent) ──────────────
const contactCard: CardBuilder = {
  kind: 'contact',
  source: SOURCE,
  priority: 55,
  canRender: (ctx) =>
    EXPERIENCE_FEATURES.contactCards &&
    (ctx.response.lead.wantsContact || ctx.response.lead.score >= EXPERIENCE_CONFIG.contactLeadThreshold),
  build: (ctx) => [
    makeCard(
      'contact',
      SOURCE,
      { reasons: ctx.response.lead.reasons, prefill: ctx.response.lead.contact },
      ctx,
      { confidence: Math.max(0.5, ctx.response.lead.score) },
    ),
  ],
};

// ── Social card (shareable, non-lead informational answers) ──
const socialCard: CardBuilder = {
  kind: 'social',
  source: SOURCE,
  priority: 30,
  canRender: (ctx) => EXPERIENCE_FEATURES.socialCards && !ctx.response.lead.isLead && ctx.response.validation.quality >= 0.7,
  build: (ctx) => [
    makeCard('social', SOURCE, { message: 'Share this answer' }, ctx, { confidence: 0.3 }),
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
  canRender: (_ctx, intents) => EXPERIENCE_FEATURES.buyProductCards && intents.has('buying_intent'),
  build: (ctx) => {
    const products = ctx.response.citations.filter((c) => c.entityType.toLowerCase().includes('product'));
    return products.slice(0, EXPERIENCE_CONFIG.maxProductCards).map((c, i): ExperienceCard =>
      makeCard('buy_product', SOURCE, { title: c.title, entityId: c.entityId, available: false }, ctx, {
        confidence: c.relevanceScore,
        orderBump: i,
        salt: String(c.marker),
      }),
    );
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
