# AI Provider Platform (Phase 7.3)

The reusable layer that talks to **external AI APIs** — and the **only** module
allowed to. It separates the provider **interface** from provider
**implementations**, wraps every call with **retries / timeout / cancellation /
circuit breaker / health tracking**, and is **streaming- and fallback-ready**.

> **Gemini** is the first real provider. **OpenAI / Claude / DeepSeek** are
> interface-complete **stubs** — add one later by filling in `generate` and
> flipping a flag, with no other file changes.

Location: `src/modules/platform/ai-provider/`

---

## Where it sits

```
Prompt Builder ─▶ BuiltPrompt ─▶  AI Provider Platform  ─▶ external AI API (Gemini, …)
                                     ├─ registry (interface ← adapters)
                                     ├─ resilience (retry · timeout · cancel · circuit)
                                     ├─ health store (latency · availability · usage)
                                     └─ analytics events (Core Event Bus)
```

**Dependency direction:** `ai-provider → prompt + core`. Nothing depends back on it
except a future Chat/LLM-orchestration layer. It builds no prompts, retrieves no
knowledge, renders no UI.

## Modules

| File | Responsibility |
|------|----------------|
| `types/` | `AIProvider` **interface**, `AIRequest`/`AIResponse`/`AIStreamChunk`, `ProviderHealth`, `PROVIDER_EVENTS`, `AIProviderError` |
| `config/` | `PROVIDER_FEATURES` flags + `PROVIDER_CONFIG` (timeout, retries, circuit, fallback order) |
| `utils/` | token estimate, backoff, EMA, abortable delay |
| `registry/` | provider registry + `resolveProviderChain` (default → fallbacks) |
| `health/` | in-memory health/metrics + **circuit breaker** state machine |
| `runtime/resilience.ts` | wraps one call: timeout + retries + cancellation + circuit + events |
| `adapters/gemini.ts` | **real** Gemini adapter (REST via fetch, key-gated, streaming-ready) |
| `adapters/stubs.ts` | OpenAI / Claude / DeepSeek prepared stubs (`implemented: false`) |
| `adapters/index.ts` | registers all adapters (**server-only**) |
| `services/` | `generate` / `stream` facade with fallback (**server-only** — the API seam) |
| `actions/` | admin-guarded read-only catalog + health |
| `analytics.ts` | **AI Providers** dashboard module descriptor |

## Provider Architecture — interface vs implementation

The registry only knows the `AIProvider` **interface**:

```ts
interface AIProvider {
  readonly info: ProviderInfo;      // name, models, streaming, implemented
  isConfigured(): boolean;          // API key present?
  generate(req: AIRequest): Promise<AIResponse>;
  stream?(req: AIRequest): AsyncIterable<AIStreamChunk>;   // optional
}
```

Adapters implement it. The **resilience + health envelope lives outside** the
adapter (`runtime/resilience.ts`), so every provider gets identical, correct
retry/timeout/circuit behavior for free and adapters stay tiny.

## Registry & Fallback

- `registerProvider(p)` — adapters self-register (via `adapters/`).
- `getProvider(name?)` — resolve one (default = `gemini`).
- `resolveProviderChain(preferred?)` — ordered, de-duped list of **registered +
  implemented + configured** providers: preferred first, then `PROVIDER_CONFIG.fallbackOrder`.

`generate({ provider, allowFallback })` tries the chain; on failure it advances to
the next configured provider (when the `fallback` flag is on) and emits
`ai:provider_fell_back`. Caller cancellation never rolls over.

## Adapter System — add a provider later

1. Copy `gemini.ts` → `openai.ts`, implement `generate` (map BuiltPrompt → request → `AIResponse`).
2. In `stubs.ts`, remove the stub / set `implemented: true`.
3. Flip `PROVIDER_FEATURES.openai = true`.

No registry, service, resilience, analytics or dashboard change. That separation
is the whole point.

## Gemini Integration

- Google Generative Language REST API (`v1beta/.../generateContent`) via `fetch` — **no SDK dependency**.
- **Key-gated**: inert unless `GEMINI_API_KEY` / `GOOGLE_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` is set — so builds and unconfigured envs never call out.
- Maps `BuiltPrompt.system` → `systemInstruction`, `BuiltPrompt.user` → a user `content`.
- Reports real token usage (`usageMetadata`) and measured `responseTimeMs`.
- Classifies errors: `429`/`5xx`/network → **retryable**; `4xx` → not. `stream()` exists behind the `streaming` flag.

## Resilience

| Concern | Behavior |
|---|---|
| **Timeout** | `PROVIDER_CONFIG.timeoutMs` (per-call override) via composed `AbortSignal` |
| **Retries** | up to `maxRetries` with jittered exponential backoff; only retryable errors |
| **Cancellation** | caller `AbortSignal` wired through to `fetch`; emits `ai:provider_cancelled`, no retry |
| **Circuit breaker** | `circuitErrorThreshold` consecutive errors → **open**; after `circuitResetMs` → **half-open** probe; success → **closed** |
| **Health** | per-provider availability, EMA latency, total/daily tokens, last error |

## Analytics Integration

New **AI Providers** dashboard module (`/jivo-dev/analytics/ai-providers`) with
pages **Providers · Health · Usage · Settings**, driven by the live health store.
The `provider-health` facts widget shows, per provider: **status · circuit
breaker · availability · avg response time · token usage (total + daily) · last
error** — exactly the ops fields for Gemini.

Placeholder events on the Core Event Bus (`platformEvents`):

| Event | When |
|---|---|
| `ai:provider_requested` | a call attempt starts |
| `ai:provider_succeeded` | success (latency, tokens) |
| `ai:provider_failed` | attempt failed |
| `ai:provider_retried` | retry scheduled |
| `ai:provider_timed_out` | timeout fired |
| `ai:provider_cancelled` | caller aborted |
| `ai:provider_fell_back` | fallback provider used |
| `ai:provider_circuit_opened` / `_closed` | breaker state change |

## Usage (server-only)

```ts
import { generate } from '@/modules/platform/ai-provider/services';
import { buildPrompt } from '@/modules/platform/prompt';

const prompt = buildPrompt({ question, context, memory });
const res = await generate({ prompt, provider: 'gemini', allowFallback: true, signal });
// res.text, res.usage, res.responseTimeMs, res.provider, res.fromFallback
```

## Boundaries / guarantees

- **Only** module that calls an external AI API — the single seam.
- **No Core changes**; consumes `core/events` + `core/shared` guard only.
- **No Prisma model / migration** — health is in-memory (flushable later).
- **No Chat UI**; consumes a `BuiltPrompt`, returns an `AIResponse`.
- **Additive & backward-compatible** — new module + 3 one-line registrations; no existing behavior changed.
- Key-gated adapters → **safe in builds/CI** (no network without a key).

---

## Expanded Provider Metrics (Phase 7.9)

`ProviderHealth` now also exposes **successRate**, **failureRate**,
**timeoutCount** and **fallbackCount** (recorded in the resilience runtime +
fallback path). The Provider dashboard shows average response time, token usage,
**estimated cost** (from the shared Observability cost estimator), success/failure
rate, timeout and fallback counts, and circuit-breaker status — reusing the
existing health store (in-memory) and the Observability per-provider rollups. No
new provider logic; metrics are additive.
