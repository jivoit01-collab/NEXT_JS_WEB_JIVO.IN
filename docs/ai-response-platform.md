# AI Response Platform (Phase 7.4)

Turns a raw provider `AIResponse` into **one validated, normalized, structured
response object** the Experience Engine can render — safely and
**provider-independently**. It is a **pure transformation layer**: no LLM, no
external API, no Chat UI, no Prisma.

Location: `src/modules/platform/response/`

---

## Where it sits

```
AI Provider Platform ─▶ AIResponse ─▶  AI Response Platform  ─▶ StructuredResponse ─▶ (future) Experience Engine
Context Builder citations ─▲                 │
                                             ├─ validate  → normalize → safe-parse markdown
                                             ├─ extract   → citations · entities · links · actions
                                             ├─ detect    → lead opportunity · contact request
                                             └─ analytics → Core Event Bus
```

**Dependency direction:** `response → ai-provider + knowledge + core`. Nothing
depends back on it except a future Experience/Chat layer.

## Modules (as required)

| Dir | Responsibility |
|-----|----------------|
| `types/` | `ProcessResponseRequest`, `StructuredResponse`, extracted-piece types, `RESPONSE_EVENTS` |
| `config/` | `RESPONSE_FEATURES` flags, thresholds, `INTENT_KEYWORDS` |
| `utils/` | clean/strip-markdown (safe), keyword hits, clamp, stable id (no RNG/clock) |
| `normalizers/` | collapse any provider's response into one common shape |
| `validators/` | the **validation pipeline** (composable rules + quality score) |
| `parsers/` | **safe** markdown → bounded plain-text blocks (never emits HTML) |
| `extractors/` | citations · entities · links · leads · suggested actions |
| `analytics/` | placeholder Core Event Bus events |
| `services/` | `processResponse` facade — runs the whole pipeline |
| `actions/` | admin-guarded preview action (stamps `createdAt`) |
| `index.ts` | client-safe barrel |

## Validation Pipeline

A list of pure, composable rules runs over the **normalized** response; each emits
`error`/`warning` issues. One blocking `error` → `valid: false`. A heuristic
`quality` (0..1) is derived from the warnings.

Built-in rules: `empty` (error), `too_short`, `too_long`, `truncated`,
`finish_error`/`finish_cancelled` (error), `possible_prompt_leak`. Add a rule by
pushing to `RULES` — nothing else changes.

## Parser Architecture — safe markdown

A small, **dependency-free** block tokenizer. It splits text into a bounded list
(`maxBlocks`) of `ContentBlock`s: `heading · paragraph · list · ordered-list ·
quote · code`. Fenced code is preserved **verbatim as text**; everything else has
inline markdown **and any raw HTML tags stripped** (`stripInlineMarkdown`). No
markup ever reaches a consumer — eliminating the XSS/injection surface without a
third-party markdown/sanitizer dependency.

## Extraction (provider-independent)

- **Citations** — resolve inline `[n]` markers against Context Builder
  `KnowledgeCitation`s (provenance: title, url, entity, score); unresolved markers
  are kept but flagged.
- **Entities** — emails, phones, URLs, money (₹/Rs/INR/$/USD), ISO dates —
  de-duplicated and normalized.
- **Links** — markdown `[label](href)` + bare URLs, labelled and classified
  internal/external (via `RESPONSE_CONFIG.internalHosts`).
- **Lead detection** — heuristic score over the **user's question** (weighted ×2)
  and the response, across buying/contact/consultation intents, plus any
  volunteered contact detail. `isLead` when `score ≥ leadThreshold`; also flags
  `wantsContact` and captures `{ email, phone }`.
- **Suggested actions** — derived from the lead signal, links and citations:
  `book_consultation · contact_support · view_product · open_link` — de-duped by
  type, ranked by confidence, capped at `maxActions`.

## Structured Response Model

`processResponse(request)` returns a `StructuredResponse`:

```ts
{
  id, provider, model, fromFallback,
  text,                       // normalized, safe plain text
  blocks: ContentBlock[],     // safe markdown blocks
  citations, entities, links, actions,
  lead: { isLead, score, reasons, wantsContact, contact },
  usage, responseTimeMs, finishReason,
  validation: { valid, issues, quality },
  metadata: { correlationId, truncated, empty, language, createdAt }
}
```

It is **provider-neutral** — Gemini, OpenAI, Claude or DeepSeek all yield the same
shape, because parsing runs on the normalized core, not on any provider's raw JSON.

## Analytics Integration

Placeholder events on the Core Event Bus (`platformEvents`):

| Event | When |
|-------|------|
| `ai:response_processed` | a response was structured (provider, quality, tokens, latency) |
| `ai:response_validation_failed` | blocking validation error(s) |
| `ai:response_citations_extracted` | citations found (with resolved count) |
| `ai:response_actions_suggested` | suggested actions produced |
| `ai:response_lead_detected` | a lead opportunity was flagged |
| `ai:response_contact_requested` | the user wants contact / shared details |

## Usage

Pure (anywhere):

```ts
import { processResponse } from '@/modules/platform/response';

const structured = processResponse({
  raw,                 // AIResponse from the AI Provider Platform
  citations,           // from the Context Builder (optional)
  question,            // the user's question (improves lead detection)
  correlationId,       // conversationId/messageId
});
// → hand structured to the (future) Experience Engine
```

## Boundaries / guarantees

- **No LLM, no external API** — consumes an already-produced `AIResponse`.
- **No Chat UI** — produces data, not components.
- **Provider-independent** — parsing runs on the normalized shape.
- **Safe by construction** — parser never emits HTML; inline markup is stripped.
- **No Core changes**; consumes `core/events` + `core/shared` guard only.
- **No Prisma model / migration** — pure transformation.
- **Additive & backward-compatible** — new module, no existing file changed.
- Clock-free pure core (`createdAt` stamped only in the server action) → stable, testable, replay-safe.

## Citation markers never reach the user (Phase 8.3)

The model is still instructed to emit `[n]` markers — they are the ONLY mechanism
that maps a claim back to a real Knowledge document (title + CMS url). But raw
`[1]` in a chat bubble is noise, so `processResponse` runs in this order:

```
normalize → validate → extract(citations ← [n] markers, entities, links, lead)
          → stripCitationMarkers()  → parseMarkdown() → StructuredResponse
```

`extractCitations` resolves the markers FIRST; `stripCitationMarkers` (in
`utils/`) then removes them from `text` and `blocks` — everything the user sees.
Provenance survives untouched on `StructuredResponse.citations`, where the
Experience Platform turns it into CMS cards and internal links.

The stripper handles `[1]`, grouped `[3, 5]`, adjacent `[2][4]` and spaced
`[ 2 ]`, and repairs the spacing/punctuation removal leaves behind.

## Contact intent keywords

`INTENT_KEYWORDS.contact` matches how people ASK FOR details ("what is your phone
number", "your email", "where are you located"), not only requests to be
contacted. Without those the Contact card never rendered for the most direct
contact questions.
