# AI Conversation Platform (Phase 7.1)

The reusable conversation layer: **lifecycle, live state, message storage and
memory**. It implements **no LLM, no Gemini, no Prompt Builder, no Chat UI** —
those consume this platform, never the reverse. It may consume the **Knowledge
Retriever + Context Builder** and nothing else.

```
User → Conversation Manager → Conversation Platform
        ├── Conversation (metadata)
        ├── Conversation State (live, single source of truth)
        ├── Conversation Messages (millions, cursor-paginated)
        └── Conversation Memory (reusable, importance-scored)
   → Knowledge Platform → [future Prompt Builder] → [future LLM]
```

Location: `src/modules/platform/conversation/` (mirrors Knowledge/Feedback/Auth).

## Architecture

| Layer | Where | Responsibility |
|---|---|---|
| Manager | `manager/` | Lifecycle facade: start / continue / end / restore; publishes events. **No AI.** |
| State | `state/` | Read-first, patch-only live state — the single source of truth. |
| Memory | `memory/` | Store/update/expire/recall with importance scoring. |
| Data | `data/` | The only Prisma access (server-only); state-first + cursor pagination. |
| Services | `services/` | Orchestration + Knowledge/Context integration (no LLM). |
| Actions | `actions/` | Admin-guarded server actions (reuse Auth). |
| Analytics | `analytics.ts` | New **AI** dashboard module (Overview, Conversations, Messages, Memory, Performance, Settings). |

**Dependency rule:** `admin/analytics → conversation → knowledge`. Conversation
publishes to the Core Event Bus and never imports an LLM/Prompt Builder/Chat UI.

## Database (`prisma/schema/conversation.prisma`)

Four tables, **metadata / state / messages / memory kept separate**:

- **Conversation** — metadata only (visitor/user/session soft refs, title, language, status, counters). Small + hot; never scans messages.
- **ConversationState** — one row per conversation: intent, topic, summary, `lastMessageId`, `contextVersion`, `knowledgeVersion`, `estimatedTokens`, `streamingEnabled`, `modelProvider`, `temperature`. The live **single source of truth**.
- **ConversationMessage** — every message (`role`, `content`, `messageType`, `tokens`, `responseTime`, `confidence`, `feedbackId`, `metadata`). Indexed on `conversationId`, `role`, `createdAt`, and `(conversationId, createdAt)` for **cursor pagination** — designed for **millions** of rows.
- **ConversationMemory** — `type`, `key`, `value`, `importance`, `expiresAt`. Uniqued on `(conversationId, type, key)`; temporary memory auto-expires.

Memory types: `PREFERENCE · PROFILE · SHOPPING · HEALTH · BUSINESS · TEMPORARY · LONG_TERM` (additive).

## Conversation lifecycle

```ts
import * as manager from '@/modules/platform/conversation/manager';
const c = await manager.startConversation({ visitorId, userId });       // + one state row
await manager.continueConversation({ conversationId: c.id, role: 'USER', content });
const snap = await manager.restoreConversation(c.id);                    // state + newest page + memory
await manager.endConversation(c.id);
```

Events published: `CONVERSATION_CREATED/STARTED`, `MESSAGE_CREATED/UPDATED`,
`MEMORY_CREATED/UPDATED`, `STATE_UPDATED`, `CONVERSATION_ENDED`.

## Conversation State (state-first)

Never rebuild the whole conversation. `readState()` returns one small row;
`updateState(patch)` writes **only** the changed fields. `restoreConversation()`
reads state + the newest message page (cursor) + relevant memory — it does **not**
replay history. `contextVersion`/`knowledgeVersion` advance when a new context is
built (see `services/buildConversationContext`).

## Memory Engine

`rememberFact()` upserts by `(conversation, type, key)` and scores importance
(profile/long-term high, temporary low). `recallMemory()` returns non-expired
top-N by importance — a future `semanticMemory` flag re-ranks by embedding
similarity with no interface change. `forgetExpired()` evicts temporary memory.

## Knowledge integration

`services/buildConversationContext({ conversationId, question, strategy })` calls
`retrieveAndBuildContext` (Knowledge Retriever → Context Builder), advances the
state's versions/tokens, and returns the `KnowledgeContext` for a **future**
Prompt Builder/LLM. **No LLM is called.**

## Feedback integration

`ConversationMessage.feedbackId` is a soft reference to **one optional** Feedback
record (reusing the Feedback Platform) — no feedback duplication.
`linkMessageFeedback(messageId, feedbackId)` wires them.

## Performance strategy (10k+ conversations, millions of messages)

- Metadata/state/messages/memory separated → the hot state read never scans messages.
- **State-first**: patch only changed fields; no conversation rebuilds.
- **Cursor pagination** for messages (`(conversationId, createdAt)` index) — opaque base64 cursors, lazy loading.
- Minimal reads; append is one small transaction (message + counters + state patch).
- Prepared for **Redis session cache**, **streaming**, and **background persistence** (feature-flagged, off). No blocking operations.

## Feature flags (`CONVERSATION_FEATURES`)

`memory · conversationResume · temporaryMemory · longTermMemory` (on) ·
`streaming · multiAgent · redisSessionCache · semanticMemory` (prepared, off).

## Analytics + Admin

Reuses the Analytics Platform. A **new "AI" module** is registered with pages
Overview, Conversations, Messages, Memory, Performance, Settings — backed by
`admin/analytics/data-sources/conversation-source.ts` and shared widgets.
Performance widgets are **placeholders** (no real metrics yet). Widgets never
query Prisma directly.

## Future streaming / Prompt Builder / Gemini

- `streamingEnabled` on state + a `streaming` flag are ready; a future phase adds token streaming + background persistence.
- A future **Prompt Builder** consumes `buildConversationContext()`'s `KnowledgeContext` + recalled memory to assemble a prompt.
- A future **LLM provider** (Gemini/OpenAI/Claude) receives that prompt and streams back a message stored via `continueConversation({ role: 'ASSISTANT', … })`. The Conversation Platform never imports any of them — the dependency arrow only points **toward** them.
