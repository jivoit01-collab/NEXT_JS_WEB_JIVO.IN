# Knowledge Platform (Phase 7.0)

The reusable **knowledge layer** that powers every future AI feature — Chatbot,
Search, Recommendations, Voice, WhatsApp, Mobile, Employee AI — **without a
redesign**. It implements **no chatbot and knows nothing about any LLM**. An LLM
*consumes* this platform (via the Retriever / Search); the platform never calls
an LLM.

```
Knowledge Sources → Indexer → Knowledge Documents → (Embeddings) → Search
  → Retriever → Context Builder → [future Prompt Builder] → [future LLM]
```

The **Context Builder** (Phase 7.0.1) is the single source of truth for AI
context. Every future AI provider consumes it — **never the Retriever directly.**

Location: `src/modules/platform/knowledge/` (mirrors the Feedback/Auth platforms).

## Architecture

| Layer | Where | Responsibility |
|---|---|---|
| Sources | `indexing/sources.ts` | Adapters that yield a source's current content (`SourceAdapter`). CMS Pages is live; Products/Blogs/FAQs/Recipes/Media/Community/Policies are prepared plug-ins. |
| Indexing | `indexing/index.ts` | Fetch → chunk → hash → upsert `KnowledgeDocument`; prune; record a `KnowledgeSyncJob`; publish events. |
| Embeddings | `embeddings/index.ts` | Provider abstraction (`EmbeddingProvider`) + registry. Gemini/OpenAI/Voyage registered as **stubs** — generation not implemented. |
| Search | `search/index.ts` | `keyword` (works today), `semantic`, `hybrid` — all implement `SearchEngine`; semantic/hybrid fall back to keyword until vectors exist. |
| Retriever | `retriever/index.ts` | `question → top documents + prompt-ready context`. **No LLM.** The single seam every AI feature calls. |
| Data | `data/index.ts` | The only Prisma access (server-only). |
| Services | `services/index.ts` | Orchestration facade + event-driven auto-sync. |
| Actions | `actions/index.ts` | Admin-guarded server actions (reuse Auth). |
| Analytics | `analytics.ts` | Dashboard descriptor (module + widgets + pages). |

**Dependency rule:** `admin/analytics → platform/knowledge` only, and knowledge
publishes to the Core Event Bus — knowledge never imports the dashboard or an LLM.

## Database (`prisma/schema/knowledge.prisma`)

Five reusable tables. **Embeddings live in their own table, never on the
document** — keeping document rows small and allowing multiple provider/model
vectors per document.

- **KnowledgeSource** — a registered source (`key`, `type`, `enabled`, denormalized `documentCount`, `lastSyncedAt`).
- **KnowledgeCollection** — a searchable grouping (Our Essence, Products, …) for scoped search.
- **KnowledgeDocument** — one **chunk** of knowledge (`chunkIndex`), `content` (`@db.Text`), soft provenance (`entityType`/`entityId`/`externalKey`), `contentHash` (change detection), `status`, `embeddingStatus`. Uniqued on `(sourceId, externalKey, chunkIndex)`; indexed on source/collection/status/embeddingStatus/entity/hash for **100k+ docs**.
- **KnowledgeEmbedding** — `documentId`, `provider`, `model`, `dimensions`, `vector Float[]` (empty until generation; a future migration swaps in a `pgvector` column + ANN index). Uniqued on `(documentId, provider, model)`.
- **KnowledgeSyncJob** — audit + progress for background (re)indexing.

## Collections

Search can be scoped to one or more collection keys via `SearchFilters.collectionKeys`
(e.g. only "products" or only "our-essence"). The CMS adapter assigns items to
`our-essence` / `home`; new collections appear automatically as sources declare them.

## Retriever

```ts
import { retrieve } from '@/modules/platform/knowledge/retriever';
const { documents, context } = await retrieve({ question, topK: 6 });
// `context` is a ready-to-embed prompt block — the LLM layer (later) prepends it.
```

Returns ranked documents + a concatenated `context` string. Publishes
`knowledge:search` and `knowledge:document_used`.

## Search

- **Keyword** — term-coverage ranking with a title boost over `KnowledgeDocument` (works now).
- **Semantic / Hybrid / Vector** — interfaces + engines exist and **fall back to keyword** until `KNOWLEDGE_FEATURES.vectorSearch` is enabled and embeddings are generated. Flipping the flag upgrades every caller with no API change.
- Filters: collection, source, entity type, language, status. Ranking is 0..1.

## Synchronization (automatic, no manual work)

1. A CMS module emits `content:changed { entityType, entityId }` when content is saved (one-liner; the platform never imports the CMS).
2. `services/initKnowledgeAutoSync()` (subscribed on import) marks those documents `STALE`.
3. A sync (`syncSource` / `syncAllSources`) re-fetches, upserts changed chunks, and marks changed content's embeddings `STALE` for a future re-embed.
4. Every run is recorded as a `KnowledgeSyncJob` and emits `knowledge:sync_started/completed`.

## Analytics integration

Reuses the Analytics Platform. `analytics.ts` registers a **Knowledge** module
with pages (Overview, Documents, Collections, Sources, Search, Indexing, Sync
Jobs, Settings), backed by `admin/analytics/data-sources/knowledge-source.ts` and
shared widgets. Events published to the Core Event Bus:
`KNOWLEDGE_SEARCH`, `DOCUMENT_USED`, `DOCUMENT_UPDATED`, `DOCUMENT_INDEXED`,
`SYNC_STARTED`, `SYNC_COMPLETED`.

## Performance strategy (100k+ docs, millions of searches)

- Chunked documents + rich indexes; denormalized `documentCount` for O(1) dashboard reads.
- Embeddings isolated in their own table (ready for a `pgvector` ANN index).
- Pagination everywhere (`KNOWLEDGE_CONFIG.pageSize/maxPageSize`).
- Sync is job-based and event-driven — designed to move to a **background worker** and **Redis cache** (both feature-flagged, off today). No blocking work on the request path.

## Context Builder (Phase 7.0.1)

Location: `src/modules/platform/knowledge/context/`
(`config/ · types/ · utils/ · strategies/ · builders/ · services/ · validations/ · index.ts`).

Sits between the Retriever and any future LLM and turns retrieved documents into
a clean, deduped, token-efficient **KnowledgeContext** with full attribution. It
**never calls an LLM** and is independent of Gemini/OpenAI/Claude, any Prompt
Builder, and any Chatbot.

```ts
import { buildContext } from '@/modules/platform/knowledge/context';
const ctx = buildContext({ question, documents: retrieval.documents, strategy: 'balanced' });
// or, server-only, in one call:
import { retrieveAndBuildContext } from '@/modules/platform/knowledge/context/services/from-retriever';
const ctx = await retrieveAndBuildContext({ question, strategy: 'citation', topK: 6 });
```

### Pipeline (modular, pure)

```
Retriever Results → Filter → Rank → Deduplicate → Merge → Compress
  → Estimate Tokens → Attach Sources → Generate Final Context
```

Each step is a small pure function in `builders/` operating on `ContextBlock[]`,
so a future step (e.g. semantic compression) drops in without touching the rest.

### Context Object (`KnowledgeContext`)

`context` (prompt-ready text) · `sources` (structured citations) · `citations`
(human lines) · `metadata` (strategy, mode, model, tokenBudget, cached) ·
`statistics` (documentsIn/Used, duplicatesRemoved, paragraphsRemoved, chars,
`compressionRatio`, trimmed) · `estimatedTokens` · `language` · `confidence`
(0..1 mean relevance) · `collection` (dominant topic). A future **Sources** UI
renders `sources` with **no extra query**.

### Source attribution

Every `KnowledgeCitation` carries Document ID, Entity Type, Entity ID,
Collection, Title, URL, Relevance Score and Chunk Number.

### Strategies (registry-driven, pluggable)

`compact · balanced · detailed · citation · product · faq · recipe` — each is a
`StrategyConfig` (maxDocuments, maxCharsPerDoc, includeCitations, deduplicate,
compress, budgetRatio, preferCollections). `registerContextStrategy()` adds new
ones with no pipeline change.

### Token optimization

`estimateTokens()` (chars→tokens, model-agnostic ratio); `resolveTokenBudget(model, override)`
reads a **registerable** per-model budget map (empty by default — **no Gemini/LLM
limit hardcoded**); low-relevance chunks are dropped first to fit the budget.

### Feature flags (`CONTEXT_FEATURES`)

`compression · deduplication · citationMode · tokenOptimization` (on) ·
`semanticCompression · caching` (prepared, off). A **Redis cache hook**
(`ContextCache` interface + `registerContextCache()` + `buildContextCached()`)
is ready — no Redis implemented yet.

### Analytics

Publishes to the Core Event Bus: `CONTEXT_BUILT`, `CONTEXT_COMPRESSED`,
`CONTEXT_TRIMMED`, `CONTEXT_CACHE_HIT`, `CONTEXT_CACHE_MISS`. The Knowledge
analytics module gained **placeholder** widgets (Average Context Size, Average
Tokens, Compression Ratio, Cache Hit Rate, Top Collections Used) on the Indexing
page — no new pages, no real metrics yet.

### Future Prompt Builder / LLM integration

A future Prompt Builder consumes `KnowledgeContext.context` + `sources`; the LLM
provider receives that prompt. Neither the Retriever nor the Context Builder ever
imports the Prompt Builder or an LLM — the dependency arrow only points **toward**
them.

## Future AI integration (no redesign)

- Implement an `EmbeddingProvider` (Gemini/OpenAI/Claude/Voyage/…) and `registerEmbeddingProvider()` — search/retriever/indexing are untouched.
- Turn on `KNOWLEDGE_FEATURES.embeddings` + `vectorSearch`; semantic/hybrid light up.
- The LLM feature calls `retrieve()` and drops `context` into its prompt. **The LLM consumes Knowledge; Knowledge never consumes the LLM.**

---

## Knowledge Versioning (Phase 7.9)

Every `KnowledgeDocument` now exposes provenance for observability:

- **`version`** (`Int`, default 1) — bumped on each re-index; on the document DTO.
- **`updatedAt`** — last change (`@updatedAt`).
- **`indexedAt`** — when it was last indexed.

The AI execution recorder keeps a `knowledgeVersion` slot so a request remembers
which knowledge answered the user. Management affordances (re-index, mark stale,
sync status, search preview, collection statistics) remain reusable placeholders
in the Knowledge admin module — no background workers (architecture only).
See docs/ai-observability-platform.md.
