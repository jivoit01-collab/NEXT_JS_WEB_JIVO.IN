# AI Observability Platform (Phase 7.9)

Stores **execution metadata** — one row per AI Gateway request — for **debugging
and optimization**. It reuses every AI platform and stores **no conversation
content** (that lives in the Conversation Platform); it references it by soft id.

Location: `src/modules/platform/observability/`

---

## Architecture

```
AI Gateway pipeline (the single seam)
   │  runs Conversation → Prompt(+Knowledge/Context) → Provider → Response → Experience
   ▼
recordExecution(metadata)   ── best-effort, never blocks the answer ──▶  AIExecution (Prisma)
                                                                             │
Analytics Dashboard  ◀── executionStats / recentExecutions / executionsByProvider ◀┘
```

**Dependency direction:** `observability ← gateway` (the pipeline calls it);
`admin/analytics → observability` (dashboard reads aggregates). Observability
imports nothing from the AI platforms — it only receives already-computed values.

| File | Responsibility |
|------|----------------|
| `types/` | `AIExecutionRecord`, `AIExecutionDTO`, `ObservabilityStats`, events |
| `config/` | flags + the **cost table** (USD per 1K tokens, model-agnostic) |
| `utils/` | `estimateCost` (shared with the Provider dashboard), `ratio` |
| `data/` | **server-only** — the only Prisma access (`AIExecution`) |
| `services/` | `recordExecution` (best-effort recorder) + aggregate reads |
| `analytics.ts` | **AI Observability** dashboard module descriptor |

## Data Flow

The Gateway pipeline records once per request, on both the success and fallback
paths, from values it already has (no extra queries):

- **Provenance**: correlationId, conversationId, messageId, visitorId, userId, channel.
- **Prompt**: template id + **version** (from `BuiltPrompt.template`).
- **Knowledge/Context**: context **strategy** + retrieved-doc count (from the same
  single retrieval — `buildPromptForConversationDetailed`), knowledge version slot.
- **Provider/model**: name, model, fromFallback.
- **Metrics**: responseTimeMs, prompt/completion/total tokens, **estimated cost**.
- **Experience**: cards returned.
- **Outcome**: success/failure, errorType, quality; feedbackId (future).

## Tracked fields (per request)

`correlationId · conversationId · messageId · visitorId · userId · promptTemplate
· promptVersion · knowledgeVersion · contextStrategy · retrievedDocs · provider ·
model · responseTimeMs · promptTokens · completionTokens · totalTokens ·
estimatedCost · experienceCards · success · errorType · feedbackId (future) ·
createdAt`

## Versioning

- **Knowledge** — `KnowledgeDocument.version` (bumped on re-index) plus
  `updatedAt` / `indexedAt`, exposed on the document DTO. The execution row keeps a
  `knowledgeVersion` slot to remember which knowledge answered a user.
- **Prompt** — templates are versioned in the Prompt registry (`name`, `version`);
  `promptVersion` is stored on every execution for A/B analysis.

## Monitoring (dashboard)

New **AI Observability** module (`/jivo-dev/analytics/ai-observability`) — pages
**Executions**, **Cost & Usage**, **Prompt Templates** — with widgets:

- Overview metrics: requests, success rate, avg response time, est. cost / tokens.
- Requests by provider, cost by provider.
- Recent executions (provider/model, latency, tokens, cost, cards, error).
- Prompt Templates (name + version + rules), reusing the Prompt registry.

Provider metrics were expanded too (see the Provider doc): success/failure rate,
timeout count, fallback count, estimated cost.

## Debugging

Each request carries a stable `correlationId` (also on `ai:gateway_*` and prompt/
response events). Find a request's full trace by that id: the execution row shows
which template/version, context strategy, provider/model, token split, cost,
card count and outcome produced the answer — without touching conversation data.

## Performance

- **No duplicate queries** — the recorder reuses values already computed by the
  pipeline; the context provenance comes from the **same** retrieval as the prompt.
- **Best-effort, non-blocking** — a monitoring write never throws into the request
  path (failures emit `ai:execution_record_failed` and are swallowed).
- **Lazy dashboard** — aggregates load through the existing widget data-source
  layer (per-widget, on demand), not eagerly.
- **Indexed** — `AIExecution` is indexed on correlationId, conversationId,
  provider, success, createdAt for fast rollups.

## Future Improvements

- Sampling at high volume (`OBSERVABILITY_FEATURES.sampling`).
- Export executions to an external sink / warehouse (`export`).
- Distributed tracing spans (`tracing`).
- Populate `feedbackId` when a user rates an answer (link to the Feedback Platform).
- Persist provider health / knowledge version snapshots for historical trends.

## Boundaries / guarantees

- **Metadata only** — no conversation content is duplicated.
- **Single caller** — only the Gateway pipeline records; one write per request.
- **No Core changes**; reuses `core/events` + `@/lib/db`.
- **Additive** — new module + new `AIExecution` model + one nullable
  `KnowledgeDocument.version` column; all public APIs unchanged.

## Admin navigation: AI Providers hidden (single-provider simplification)

Gemini is the only configured provider, so the **AI Providers** analytics module
is no longer registered in the admin dashboard — a provider-comparison UI with
one provider to compare is noise.

- Hidden by removing a single `registerAnalyticsModule(PROVIDER_ANALYTICS_MODULE)`
  call in `admin/analytics/services/register-platform-modules.ts`.
- The `PROVIDER_ANALYTICS_MODULE` descriptor, its widgets and its data source are
  **all retained** in the codebase; re-adding that one line restores the UI.
- The underlying `platform/ai-provider` package — registry, Gemini adapter,
  fallback chain, health checks — is **untouched and still runs every request**.

AI observability itself is unchanged and remains the place to read request
counts, response time, token usage, estimated cost and failures.
