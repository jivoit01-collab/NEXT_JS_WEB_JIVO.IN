# AI Gateway API (Phase 7.7)

The **single server entry point** for every AI request, from any client — web,
mobile, admin, WhatsApp, or a raw API call. It authenticates, validates,
rate-limits, runs the **full pipeline once**, and returns **one structured
response**. It **owns** the pipeline; every other AI surface delegates to it, so
business logic is never duplicated.

Location: `src/modules/platform/gateway/`

---

## Why it exists

Before this phase the pipeline lived inside the chat action. Mobile/WhatsApp/admin
clients would each have re-implemented it. The Gateway makes the pipeline a
**single reusable function** behind one guarded entry point — the chat widget now
delegates to it too.

## Architecture

```
any client ─▶  execute(request)  ─▶  guards            ─▶  runPipeline (the ONE pipeline)
  web action        │                ├─ validate            Conversation → Prompt
  mobile route      │                ├─ authenticate         (Knowledge + Context)
  whatsapp route    │                ├─ rate-limit          → Provider → Response
  admin tool        │                └─ cancellation        → Experience → persist
                    ▼                                              │
             AIGatewayResult  ◀───────────────────────────────────┘
             (one structured response)
```

**Dependency direction:** `gateway → conversation + prompt + ai-provider +
response + experience + auth + core`. The chat action now depends on the gateway
(not the platforms directly).

## Modules

| Dir | Responsibility |
|-----|----------------|
| `types/` | `AIGatewayRequest`, `AIGatewayResponse`, `AIGatewayError`, `AIGatewayStreamEvent`, `GATEWAY_EVENTS` |
| `config/` | flags, per-channel `RATE_LIMITS`, timeouts, fallback message |
| `utils/` | error envelope, correlation id, success narrowing (client-safe) |
| `validations/` | zod for the serializable request |
| `auth/` | **server-only** identity resolver (NextAuth session → user, else visitor) |
| `rate-limit/` | in-memory **sliding-window** limiter per (channel, identity) |
| `pipeline/` | **server-only** — the ONE pipeline (`runPipeline`) |
| `services/` | **server-only** — `execute` + `executeStream` (the entry points) |
| `analytics/` | Core Event Bus events |
| `actions/` | `aiGatewayAction` (web/admin server-action entry; forwards headers) |
| `index.ts` | client-safe barrel |

## The entry point

```ts
import { execute } from '@/modules/platform/gateway/services'; // server-only

const result = await execute({
  question,
  conversationId,        // omit to start a new conversation
  channel: 'web',        // 'web' | 'mobile' | 'admin' | 'whatsapp' | 'api'
  visitorId,             // anonymous identity (consented)
  headers,               // for IP rate-limiting when there's no session
  signal,                // cancellation
});

if (result.ok) {
  result.conversationId; result.message; result.structured; result.experience; result.meta;
} else {
  result.code; // 'unauthorized' | 'invalid_input' | 'rate_limited' | 'cancelled' | 'unavailable' | 'error'
}
```

### Guards (in order)

1. **Validate** — zod over the request (`invalid_input`).
2. **Authenticate** — `resolveIdentity`: NextAuth session → `userId`, else the
   client `visitorId`. Produces a rate key (`u:` / `v:` / hashed-`ip:`).
3. **Rate-limit** — sliding window per channel (`rate_limited`, with `retryAfterMs`).
4. **Cancellation** — checked before and after the pipeline (`cancelled`).
5. **Run** the pipeline; map any failure to a safe `error` (internals never leak).

## The pipeline (single source of truth)

`runPipeline` ensures a conversation, stores the user message, then:
**Prompt** (`buildPromptForConversation` — Conversation memory + Knowledge
Context) → **Provider** (`generate`, with fallback + cancellation) → **Response**
(`processResponse`) → **Experience** (`planExperience`) → stores the assistant
message. The provider is **key-gated**: if unavailable, the pipeline returns a
friendly fallback message (still stored, `meta.fromCacheOrFallbackMessage=true`) —
never a raw error.

## One structured response

```ts
AIGatewayResponse {
  ok: true,
  conversationId,
  message: { id, role: 'assistant', content, createdAt },
  structured,            // StructuredResponse (citations, entities, lead, validation, …)
  experience,            // ExperiencePlan | null (cards)
  meta: { channel, provider, fromFallback, responseTimeMs, fromCacheOrFallbackMessage, correlationId }
}
```

Every client gets the same shape — a web widget renders `experience`, a WhatsApp
bot uses `message.content`, an admin tool inspects `structured`.

## Streaming

`executeStream(request)` yields `AIGatewayStreamEvent`s (`delta` → `done`). The
architecture is streaming-ready; until provider streaming is enabled it emits one
delta then the terminal `done` carrying the full response. A Route Handler can
pipe these to SSE for mobile/WhatsApp.

## Rate limiting

In-memory sliding window per `(channel, identity)` — defaults: web 20/min,
mobile 30/min, admin 120/min, whatsapp 15/min, api 60/min (`RATE_LIMITS`). The
store is a `globalThis` singleton; a future Redis limiter can replace it behind
the same `checkRateLimit` signature with no caller changes.

## Cancellation

`AIGatewayRequest.signal` is checked at the guards and wired through to the
provider's `fetch`, so an aborted client request stops the outbound AI call and
returns `cancelled` without penalizing provider availability.

## Future clients (mobile / admin / WhatsApp)

- **Web/admin**: call `aiGatewayAction` (server action; forwards headers).
- **Mobile/WhatsApp/API**: add a Route Handler that reads the body + headers and
  calls `execute({ ...body, channel, headers: req.headers })`. No new pipeline —
  just a transport adapter. (Route handlers are transport; not added this phase.)

## Analytics Integration

Core Event Bus events (`platformEvents`): `ai:gateway_request`,
`ai:gateway_authenticated`, `ai:gateway_rate_limited`, `ai:gateway_completed`,
`ai:gateway_cancelled`, `ai:gateway_failed`, `ai:gateway_stream_started`.

## Boundaries / guarantees

- **Single entry point** — one guarded function runs the pipeline for all clients.
- **No duplicate business logic** — the chat action now delegates here; the
  pipeline exists once (`pipeline/`).
- **No Core changes**; reuses `core/events`, `core/shared/security`, Auth Platform.
- **No Prisma model / migration** — reuses Conversation storage; rate limit is in-memory.
- **Additive** — new module; the only modified file is the chat action (now thinner).
- **Safe without a provider key** — graceful fallback; safe in builds/CI.
