# Prompt Builder Platform (Phase 7.2)

A reusable, **provider-independent** platform that assembles the **final prompt**
from three existing platforms — Conversation memory, Knowledge Context, and the
User Question — using reusable, **versioned** templates.

> It calls **no LLM**. Gemini / OpenAI / Claude are *consumers* of a `BuiltPrompt`,
> never dependencies of it. This keeps the builder swappable and future-proof.

Location: `src/modules/platform/prompt/`

---

## Why it exists

Every AI answer needs a prompt built the same way: brand system prompt + business
rules + what we remember about the user + grounded knowledge context + the user's
question + output instructions — all within a token budget. Doing that ad-hoc per
feature drifts and duplicates. This platform does it once, reusably.

## Architecture

```
Conversation memory ─┐
Knowledge Context   ─┼─▶  Prompt Builder  ─▶  BuiltPrompt  ─▶ (future) Provider Formatter ─▶ LLM
User question       ─┘         │
                               ├─ versioned templates (System / Business Rules / Output)
                               ├─ token estimation + budget trimming
                               └─ placeholder analytics events (Core Event Bus)
```

Dependency direction (respects platform rules): **Prompt → Knowledge + Conversation + Core**.
Nothing depends back on Prompt except a future LLM/Chat layer.

### Modules

| File | Responsibility |
|------|----------------|
| `types/` | `PromptTemplate`, `PromptRequest`, `BuiltPrompt`, `ProviderFormatter`, `PROMPT_EVENTS` |
| `config/` | Feature flags (`PROMPT_FEATURES`) + defaults (`PROMPT_CONFIG`) |
| `utils/` | Token estimate, `{{var}}` interpolation, section join, budget trim |
| `templates/` | Versioned template **registry** + built-ins (assistant/faq/product/support) |
| `providers/` | Provider formatter **registry** — `generic` (real) + gemini/openai/claude stubs |
| `builders/` | Pure assembly **pipeline** (see below) |
| `services/` | `buildPrompt` (pure) + `buildPromptForProvider` — emits analytics events |
| `services/for-conversation.ts` | **server-only** orchestration: recall memory + retrieve context → build |
| `actions/` | Admin-guarded **preview** actions (prompt studio) |
| `validations/` | zod for request options |

## Prompt Pipeline

`buildPrompt(request)` → `assemble()` runs pure steps:

1. **resolveTemplate** — pick the versioned template (`templateId` or default).
2. **collectVariables** — merge template defaults + `{ question, language }` + request variables.
3. **renderSystem** — System Prompt **+ Business Rules** (the "system" half).
4. **renderUser** — Memory → Knowledge Context → Question → Output Instructions (the "user" half).
5. **estimate** — token estimate (model-agnostic char ratio).
6. **enforceBudget** — trim the *expendable* user half to fit `maxTokens - system - answerReserve`; the **question is never dropped**. Sets `truncated`.
7. **toMessages** — provider-neutral `[{system}, {user}]`.

The result `BuiltPrompt` carries `system`, `user`, `messages`, `template {id,version}`,
`estimatedTokens`, `truncated`, and `metadata` (provider, sections, language, hasContext, memoryCount).

## Template System

Templates are **code, versioned in git** (no Prisma model — Prisma stays unchanged).
Each separates the four concerns:

```ts
{ id, name, version, description,
  system,             // System Prompt (supports {{vars}})
  businessRules[],    // Business Rules (brand/domain guardrails)
  outputInstructions, // Output Instructions
  defaults }          // default {{vars}}
```

Register or override at runtime:

```ts
import { registerPromptTemplate } from '@/modules/platform/prompt';
registerPromptTemplate({ id: 'recipe', name: 'Recipe Assistant', version: 1, /* … */ });
```

Bump `version` for a new revision — the version used is recorded in every
`prompt:built` / `prompt:version_used` event for A/B analysis.

Built-ins: `assistant` (default), `faq`, `product` (e-commerce ready), `support`.

## Provider independence

`ProviderFormatter` maps a `BuiltPrompt` to a provider's request shape. Only
`generic` is implemented; `gemini`/`openai`/`claude` are registered **stubs** that
delegate to `generic`. Adding a real provider later = swap one formatter's
`format` — **no redesign, no changes elsewhere.**

```ts
import { buildPromptForProvider } from '@/modules/platform/prompt';
const { built, formatted } = buildPromptForProvider({ question, context, memory, provider: 'openai' });
// `formatted` = { system, messages } ready to hand to a provider SDK — later.
```

## Analytics Integration

Placeholder events on the Core Event Bus (`platformEvents`) — no dashboard widgets
required this phase; a future analytics module can subscribe:

| Event | When |
|-------|------|
| `prompt:template_used` | a template is selected |
| `prompt:version_used` | records template `version` (A/B) |
| `prompt:built` | prompt assembled (tokens, sections, hasContext, memoryCount) |
| `prompt:truncated` | budget forced a trim |
| `prompt:formatted` | formatted for a provider |

## Usage

Pure (anywhere):

```ts
import { buildPrompt } from '@/modules/platform/prompt';
const prompt = buildPrompt({ question, context, memory, templateId: 'faq' });
// prompt.messages → hand to a future LLM step
```

Grounded, for a live conversation turn (server-only — wires all three platforms):

```ts
import { buildPromptForConversation } from '@/modules/platform/prompt/services/for-conversation';
const prompt = await buildPromptForConversation({ conversationId, question });
```

## Boundaries / guarantees

- **No LLM, no provider SDK, no network** — stops at a `BuiltPrompt`.
- **No Core changes**; consumes `core/events` + `core/shared` guard only.
- **No Prisma model / migration** — templates are versioned code.
- **Additive & backward-compatible** — new module, no existing file behavior changed.
- Respects consent/analytics by reusing the platform Event Bus (no direct tracking).

---

## Prompt Versioning & Management (Phase 7.9)

Templates already carry `name` + `version`. Every AI request now **stores the
prompt template id and version used** (via the Observability module), enabling
A/B analysis. The Observability dashboard's **Prompt Templates** page lists all
registered templates (name, version, rule count) by reusing `listPromptTemplates()`
— no new store, no migration. Prompt preview / active template / comparison reuse
the existing preview action + registry. `buildPromptForConversationDetailed`
returns the prompt AND the knowledge context it used (same single retrieval) so
provenance is captured without duplicate work.
