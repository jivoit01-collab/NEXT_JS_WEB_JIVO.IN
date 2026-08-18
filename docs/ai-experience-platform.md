# AI Experience Platform (Phase 7.5)

Turns a `StructuredResponse` into an ordered **ExperiencePlan** — a list of card
**descriptors** a future Chat UI renders. An **Experience Planner** decides *what
to show* from **intent + business rules — never the LLM**. Cards are
**registry-driven**, so new card kinds and future modules plug in automatically.

> **No Chat UI here.** This platform outputs data (card descriptors), not JSX.

Location: `src/modules/platform/experience/`

---

## Where it sits

```
Response Platform ─▶ StructuredResponse ─▶  AI Experience Platform  ─▶ ExperiencePlan ─▶ (future) Chat UI
                                               ├─ planner  → intent + business rules (NOT the LLM)
                                               ├─ registry → registry-driven card builders
                                               ├─ engine   → order + limit + assemble
                                               └─ analytics → Core Event Bus
```

**Dependency direction:** `experience → response + core` (and reuses Feedback via
an entity descriptor). Nothing depends back on it except a future Chat/UI layer.

## Modules (as required)

| Dir | Responsibility |
|-----|----------------|
| `types/` | `ExperienceCard`, `CardBuilder`, `PlanContext`, `ExperiencePlan`, per-card payloads, `EXPERIENCE_EVENTS` |
| `config/` | flags, `CARD_ORDER`, business thresholds, canned `SUGGESTED_QUESTIONS` |
| `utils/` | intent derivation, stable id, clamp (no RNG/clock) |
| `registry/` | **card registry** — builders self-register; planner iterates it |
| `cards/` | built-in `CardBuilder`s (answer, product, cms, read_more, cta, suggested_questions, contact, social, feedback_cta, buy_product) |
| `planner/` | derive intents → collect eligible cards from the registry |
| `engine/` | order + enforce max-card limit → assemble the plan |
| `analytics/` | placeholder Core Event Bus events |
| `services/` | `planExperience` facade (registers cards, runs planner+engine, emits) |
| `actions/` | admin-guarded preview action |
| `index.ts` | client-safe barrel |

## Experience Architecture

Three layers keep concerns separate:

1. **Registry** — the *catalog* of card kinds. Each `CardBuilder` owns its
   business rule (`canRender`) and its construction (`build`).
2. **Planner** — the *decision*. Derives intents from the response's lead signal,
   citations and question, then asks every registered builder whether it applies.
   **The LLM is never consulted.**
3. **Engine** — the *layout*. Orders candidates by `CARD_ORDER` band then
   confidence, always keeps the answer, and caps the rest at `maxCards`.

## Planner

Intents come from the `StructuredResponse` (deterministic):
`buying_intent · contact_intent · consultation_intent · contact_detail_shared`
(from the lead signal) plus `product_context`, `has_sources`, `question_intent`.

Each builder's `canRender(ctx, intents)` is a **business rule** — e.g. product
cards need `product_context` or `buying_intent`; a contact card needs a strong
lead or explicit contact intent; the answer card needs a valid, non-empty
response. Feature flags gate every card kind.

## Card Registry

```ts
import { registerCard } from '@/modules/platform/experience';

registerCard({
  kind: 'recipe',            // a new CardKind
  source: 'recipes-module',  // future-module attribution
  priority: 75,
  canRender: (ctx, intents) => intents.has('recipe_intent'),
  build: (ctx) => [ /* ExperienceCard[] */ ],
});
// Appears in every plan automatically — no planner/engine change.
```

Built-in kinds: **answer · product · cms · read_more · cta · suggested_questions ·
contact · social · feedback_cta · buy_product** *(buy_product prepared, behind the
`buyProductCards` flag for the e-commerce phase)*.

The **Feedback CTA** card reuses the Feedback Platform's entity model: it carries
`{ entityType, entityId, prompt }` so a UI can open the existing feedback dialog —
no new feedback surface.

## Experience Engine

- **Order**: `CARD_ORDER` band (answer 0 → feedback 90), then higher confidence first.
- **Limit**: answer always kept and exempt; remaining cards capped at `maxCards`
  (`truncated` flagged when cards are dropped — never silently).
- **Metadata**: correlationId, surface, cardCount, truncated, createdAt (stamped
  at the action boundary; the pure core is clock-free).

## Structured plan model

```ts
ExperiencePlan {
  id, intents,
  cards: ExperienceCard[]        // { id, kind, order, confidence, source, data }
  metadata: { correlationId, surface, cardCount, truncated, createdAt }
}
```

Each `ExperienceCard.data` is a typed payload per kind (e.g. `ProductCardData`,
`ContactCardData`) — UI-agnostic and serialization-safe.

## Analytics Integration

Placeholder events on the Core Event Bus (`platformEvents`):

| Event | When |
|-------|------|
| `ai:experience_planned` | a plan was produced (intents, card kinds, count) |
| `ai:experience_card_added` | per card (kind, source, confidence) |
| `ai:experience_empty` | planner produced no cards |
| `ai:experience_truncated` | cards dropped by the max-card limit |

## Usage

Pure (anywhere):

```ts
import { planExperience } from '@/modules/platform/experience';

const plan = planExperience({
  response,                 // StructuredResponse from the Response Platform
  question,                 // sharpens intent
  surface: 'chat',
  correlationId,            // conversationId/messageId
  feedbackEntity: { entityType: 'conversation_message', entityId: messageId },
});
// → hand plan.cards to the (future) Chat UI to render
```

## Boundaries / guarantees

- **Planner decides layout, never the LLM** — deterministic, rule-driven.
- **No Chat UI** — produces card descriptors (data), not components.
- **Registry-driven & future-proof** — new card kinds / modules auto-participate.
- **Reuses** Response (input), Feedback (entity CTA), Event Bus (analytics).
- **No Core changes**; consumes `core/events` + `core/shared` guard only.
- **No Prisma model / migration** — pure planning.
- **Additive & backward-compatible** — new module, no existing file changed.
- Clock-/RNG-free pure core → stable, testable, replay-safe.

## Verified contact details (`PlanContext.siteContact`)

The assistant is instructed NOT to write phone numbers, emails or addresses — the
Contact card shows them, and anything the model writes could be invented. So the
card cannot source them from the response text.

`PlanContext.siteContact` carries **CMS-verified** values, supplied by the Gateway
pipeline from the same `FooterSetting` row the site footer renders (see
`gateway/pipeline/site-contact.ts`, cached for an hour — a chat turn adds no
per-request database work). The contact card prefers these and falls back to the
lead signal when absent.

This keeps the dependency arrow one-way: the Gateway (composition root) reads CMS
and passes plain data in; the Experience Platform imports no business module.

## Card de-duplication

Knowledge documents are chunked, so one CMS page is often cited several times
(chunk 0, chunk 2, …). `dedupeCitations` collapses citations by destination URL —
keeping the highest-scoring one — so a product yields ONE card instead of three
identical rows. Applied to both product and CMS cards.

## Suggested questions are topic-first

`SUGGESTION_TOPICS` maps question keywords (canola, olive, certifications, …) to a
`SUGGESTED_QUESTIONS` key, checked BEFORE intent. Follow-ups therefore advance the
conversation ("What are the benefits of Canola oil?") instead of repeating it, and
the question just asked is filtered out of its own suggestions.
