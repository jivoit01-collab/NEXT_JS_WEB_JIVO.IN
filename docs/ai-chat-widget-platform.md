# AI Chat Widget Platform (Phase 7.6)

The reusable, drop-in **AI chat UI** — a floating launcher + responsive,
theme-aware panel that renders streaming-ready messages, **Experience Cards** and
suggested questions. It is **pure UI wiring**: every piece of business logic lives
in **one server action** that orchestrates the platforms already built. The widget
**duplicates no logic**.

> This is the final consumer of the AI stack:
> **Knowledge → Context → Conversation → Prompt → Provider → Response → Experience → Chat**.

Location: `src/modules/platform/chat/`

---

## Chat Widget Architecture

The critical rule (see `client-registry-barrel-react-dup`): a `'use client'` file
must never import a side-effect registry barrel (Experience/Response/Provider),
or React duplicates and the bundle crashes. So the split is strict:

```
CLIENT (renders only)                        SERVER (all logic, one action)
─────────────────────                        ──────────────────────────────
ChatWidget                                   sendMessageAction:
  └ useChat  ──────── calls ───────────────▶   continueConversation (store user)
       ▲                                        buildPromptForConversation
       │ returns { message, plan }              generate (AI Provider, key-gated)
       │                                        processResponse (Response)
  ChatPanel / MessageList / Cards ◀──────────   planExperience (Experience)
                                                continueConversation (store reply)
```

The client imports **only** its own components, hook, config, utils and the
`'use server'` action module. The action imports the server-only platform barrels
safely (server module graph).

## Component Structure

| Component | Role |
|-----------|------|
| `ChatWidget` | top-level; composes launcher + panel; **consent-gated**, feature-flagged |
| `ChatLauncher` | floating FAB (open / resume when minimized) |
| `ChatPanel` | responsive sheet: header (minimize/close) + list + questions + composer |
| `MessageList` | messages with **auto-scroll**, **message status**, Experience Cards |
| `Composer` | input row; **file-ready** (attach affordance behind a flag) |
| `SuggestedQuestions` | tappable intent chips (planner-chosen) |
| `TypingIndicator` | animated dots while the assistant responds |
| `ConversationList` | prop-fed history switcher (**restore previous conversation**) |
| `cards/card-renderer` | **client** card registry: `CardKind → component` |

State lives in `useChat` (optimistic UI, panel state, persistence, analytics).
No business logic in any component.

## Conversation Flow

1. **Open** → `useChat.open()` emits `ai:chat_opened`, ensures a conversation
   (`startChatAction`, or `restoreChatAction` for a saved id in `localStorage`).
2. **Send** → optimistic user bubble + a streaming placeholder, then
   `sendMessageAction({ conversationId, content })` runs the full pipeline server-side.
3. **Receive** → the placeholder is replaced with the stored assistant message and
   its `ExperiencePlan`; cards render; suggested questions refresh from the plan.
4. **Restore** → on mount, a saved `conversationId` reloads the recent messages via
   the Conversation Platform (state-first — never replays full history).
5. **Minimize / maximize / close** → panel state persisted to `localStorage`.

**Provider not configured?** `generate` is key-gated; the action catches it and
returns a friendly fallback message (still stored, still logged) — the UI never
shows a raw error.

## Card rendering (registry-driven, client)

The Experience Platform returns card **descriptors**; the widget maps each
`CardKind` to a small presentational component in a **client** registry
(`card-renderer.tsx`) — deliberately separate from the server card-builder
registry. New card kinds get a renderer here; unknown kinds are skipped safely.

Card kinds handled: product · buy_product · cms · read_more · cta · contact ·
social · feedback_cta. (`answer` and `suggested_questions` are rendered by the
message list / questions strip.)

## Reuse (no duplicate business logic)

- **Conversation Platform** — start/continue/restore, message storage, memory.
- **Prompt Builder** — `buildPromptForConversation` (memory + knowledge context).
- **AI Provider Platform** — `generate` (the only external-API caller).
- **Response Platform** — `processResponse` → StructuredResponse.
- **Experience Platform** — `planExperience` → cards.
- **Feedback Platform** — the Feedback CTA card carries an entity descriptor.
- **Cookie Consent** — the widget is gated on `PREFERENCES` consent.
- **Event Bus** — all analytics.

## Analytics Integration

Client + server emit on the Core Event Bus (`platformEvents`):

| Event | When |
|-------|------|
| `ai:chat_opened` / `_closed` / `_minimized` | panel state changes |
| `ai:chat_message_sent` / `_message_received` | a turn |
| `ai:chat_card_clicked` | an Experience Card control used |
| `ai:chat_suggested_clicked` | a suggested question tapped |
| `ai:chat_conversation_restored` | a saved conversation reloaded |
| `ai:chat_error` | provider/pipeline failure (fallback shown) |

## Usage

```tsx
// Client — drop it anywhere (e.g. a layout).
import { ChatWidget } from '@/modules/platform/chat';

export function SiteChat({ visitorId }: { visitorId?: string }) {
  return <ChatWidget visitorId={visitorId} />;
}
```

It renders nothing until the user has `PREFERENCES` consent (pass
`ignoreConsent` for an admin preview) and the `widget` flag is on.

## Responsiveness & theme

- **Mobile**: full-screen sheet (`inset-0`); **desktop**: floating 380×560 card.
- **Theme**: Tailwind `dark:` variants throughout — follows the app theme.

## Boundaries / guarantees

- **No business logic in the client** — one server action owns the pipeline.
- **Respects the client/registry rule** — no side-effect registry barrels in client files.
- **No Core changes**; consumes `core/events` + `core/cookie-consent` context only.
- **No Prisma model / migration** — reuses Conversation storage.
- **Additive & backward-compatible** — new module; nothing else changed.
- **Graceful without a provider key** — safe in builds and unconfigured envs.
- **File-ready & streaming-ready** — affordances/architecture present behind flags.

---

# Website Integration (Phase 7.8)

The widget is mounted into the **public site** via a thin glue component and talks
**only** to the AI Gateway.

## Mount

`src/components/shared/site-chat.tsx` (`SiteChat`) reads the anonymous
visitor/session ids from storage and renders `<ChatWidget channel="web" …/>`. It
is mounted once in the public layout (`src/app/(public)/layout.tsx`) **inside**
`CookieProvider` (so consent context is available) and **outside** the smooth-scroll
wrapper (so the `fixed` launcher/panel position correctly).

```tsx
// src/app/(public)/layout.tsx  (inside CookieProvider / TrackingProvider)
<SiteChat />
```

## Render gating (renders nothing unless all are true)

1. **Master AI flag** — `isAiEnabled()` (see Feature Flag).
2. **Supported channel** — `channel ∈ { web }` for the on-site widget.
3. **Consent** — Cookie Consent allows `PREFERENCES` (personalized AI).

All three live **inside** `ChatWidget`; `SiteChat` stays logic-free.

## Gateway-only communication

The widget → `sendMessageAction` → **`execute` (AI Gateway)**. It never calls
Conversation / Prompt / Provider / Response / Experience directly. The Gateway is
the single entry point and single place the pipeline runs.

## Restore

**Only the `conversationId` is stored in the browser** — never the messages. The
database stays the single source of truth.

```
first visit          → conversationId → localStorage
refresh / reopen     → localStorage id → restoreChatAction(id)
                     → Conversation Platform (state + latest page)
                     → messages rendered
```

`restoreChatAction` uses the **Conversation Platform** (`restoreConversation`,
state-first — never replays full history; one cursor-paginated page of the most
recent messages). `getMessages` returns newest-first, so the action **reverses**
the page into chronological order before returning it. Emits
`ai:chat_conversation_restored`.

The history is fetched **once per session**, guarded by a ref rather than
`messages.length`, so a genuinely empty restored conversation isn't re-fetched
on every open.

### Failure handling

If restore fails — deleted conversation, invalid id, expired visitor identity —
the widget **discards the dead id from `localStorage` and starts a new
conversation**, so it can never be stuck pointing at a conversation that no
longer exists. A new conversation is created *only* when necessary.

### One visitor = one conversation

`startChatAction` resumes the visitor's existing conversation via
`findLatestConversationByVisitor` instead of creating another. The **AI Gateway
pipeline applies the same rule**: when a request arrives with no
`conversationId` but an identifiable visitor, it resumes that visitor's
conversation rather than forking a duplicate. Refreshing, reopening the widget,
navigating between pages, and asking another question all continue the same
conversation.

## Error handling (friendly, leak-proof)

The Gateway returns typed, friendly messages; the widget never shows internals.

| Situation | Gateway result | Widget UX |
|---|---|---|
| AI disabled | `unavailable` | assistant bubble with the disabled message |
| Provider unavailable | pipeline fallback (`ok`, `fromCacheOrFallbackMessage`) | normal friendly reply |
| Timeout | provider inner timeout → fallback / `error` | friendly reply / soft error |
| Rate limited | `rate_limited` (+`retryAfterMs`) | assistant bubble: "slow down" |
| Network/other | `error` | soft error, message marked `error` |

## Streaming

`CHAT_FEATURES.streaming` off today → standard single response (typing indicator
shows while awaiting). When provider streaming lands, `executeStream` feeds deltas
and the same typing indicator covers the gap — no UI change needed.

## Deployment

- **Enable/disable per environment** with the master flag (no code change):
  - `NEXT_PUBLIC_AI_ENABLED=true|false` (client + server; controls the widget too), or
  - `AI_ENABLED=true|false` (server only), else the `PLATFORM_FEATURES.ai` default (**on**).
- **Provider key**: set `GEMINI_API_KEY` (or `GOOGLE_API_KEY`) in the environment
  to get real answers; without it the pipeline returns the friendly fallback.
- **No migration** — reuses existing Conversation tables (`db:push` already covers them).

## Feature Flag

One **master** switch resolved by `@/modules/platform/gateway/feature` →
`isAiEnabled()`:

```
NEXT_PUBLIC_AI_ENABLED  →  AI_ENABLED  →  PLATFORM_FEATURES.ai (core default: true)
```

When **off**: the widget renders nothing, and `execute` short-circuits with the
disabled message — **no conversation created, no provider call, no AI work.**
Turning it on later needs no code change.

## End-to-End Flow

```
Chat Widget (SiteChat → ChatWidget → useChat → sendMessageAction)
   ↓  execute()
AI Gateway (authenticate → validate → rate-limit → cancel check)
   ↓  runPipeline()
Conversation (store user msg)
   ↓
Knowledge → Context Builder → Prompt Builder
   ↓
AI Provider (Gemini; key-gated, fallback)
   ↓
Response Platform (StructuredResponse)
   ↓
Experience Platform (ExperiencePlan → cards)
   ↓  store assistant msg
Chat Widget (renders answer + Experience Cards + Suggested Questions)
```

**Verified end-to-end:** conversation + messages stored via the Conversation
Platform; Experience Cards and Suggested Questions rendered from the plan;
analytics events emitted (opened/closed, sent/received, card-clicked,
suggested-clicked, restored, feedback-created); Feedback CTA submits through the
**Feedback Platform** (`AI_CHAT` entity) and emits `feedback:created`.

## Analytics events

`ai:chat_opened` · `ai:chat_closed` · `ai:chat_minimized` · `ai:chat_message_sent`
· `ai:chat_message_received` · `ai:chat_card_clicked` · `ai:chat_suggested_clicked`
· `ai:chat_conversation_restored` · `ai:chat_error`, plus `feedback:created`
(Feedback CTA) and the full `ai:gateway_*` set from the Gateway.

---

## Observability (Phase 7.9)

Every message the widget sends is recorded as one AI **execution** row (metadata
only) by the Gateway pipeline — template/version, context strategy, provider/model,
latency, tokens, estimated cost, experience-card count and outcome — visible in the
admin **AI Observability** dashboard. The widget itself is unchanged; observability
is captured centrally at the Gateway. See docs/ai-observability-platform.md.

---

# AI Chat Experience (Phase 8) — Frontend UI/UX

A modern chat experience (ChatGPT / Gemini / Copilot style) built **frontend-only**.
No Gateway/Conversation/Knowledge/Prompt/Provider/Response/Experience/Core change —
the widget still talks **only** to `sendMessageAction → execute`. Everything below
is UI/UX inside `platform/chat/components` (+ the `useChat` hook + config).

## UI Architecture

- **Launcher** — circular brand-gradient FAB, bottom-right, animated pulse,
  notification badge, mobile responsive.
- **Panel** — desktop floating card (400×600), mobile full-screen sheet; entry
  animation; theme-aware (`dark:` throughout). Header: AI avatar + title + Online
  status + New Chat + History + Minimize + Close.
- **Welcome screen** (empty conversation, no empty chat) — welcome message,
  description, search box, **6 suggested questions**, popular topics.
- **Transcript** — user right / assistant left, AI avatar, **markdown rendering**
  (safe, dependency-free), Experience Cards, timestamps, message status, entry
  animation, auto-scroll.
- **Message actions** — Copy · Like · Dislike · Regenerate · Feedback · Share
  (future-ready) per assistant message.
- **History sidebar** — in-panel overlay grouping conversations into Today /
  Yesterday / Last 7 Days / Older, with search and restore.
- **Composer** — auto-growing textarea, Enter-to-send, attachment + voice
  placeholders (UI only, behind flags).

## Component Tree

```
ChatWidget                       (gating, reaction state, local history, feedback dialog)
├─ ChatLauncher                  (FAB · pulse · badge)
├─ ChatPanel                     (focus trap · ESC · ARIA dialog)
│  ├─ header (AiAvatar · New · History · Minimize · Close)
│  ├─ WelcomeScreen  |  MessageList
│  │                    ├─ MessageRow (memoized)
│  │                    │  ├─ AiAvatar
│  │                    │  ├─ Markdown | plain text | TypingIndicator
│  │                    │  ├─ ExperienceCards (client card registry)
│  │                    │  └─ MessageActions (copy/like/dislike/regen/feedback/share)
│  │                    └─ windowing (recent N) + auto-scroll
│  ├─ ChatHistory (overlay: grouped + search + restore)
│  ├─ SuggestedQuestions
│  └─ Composer (attachments/voice placeholders)
└─ FeedbackDialog                (REUSED from the Feedback Platform — no duplicate form)
```

Experience Cards render via the existing **client card registry**
(`cards/card-renderer.tsx`) — Product · CMS · Read More · Contact · Social ·
Feedback · CTA; Suggested-Questions and Answer render in the list. Never hardcoded.

## Responsive Design

- **Mobile**: full-screen sheet (`inset-0`), large tap targets.
- **Tablet/Desktop**: floating 400×600 card, `max-h-[85vh]`.
- Animations are `motion-safe`; no layout shift (fixed header/footer, scroll only
  in the transcript; placeholders reserve space so enabling a feature never shifts).

## Accessibility

- `role="dialog"` + `aria-label`; **ESC closes**; **focus trap** (Tab cycles
  within the panel); focus moves into the panel on open.
- All controls are real `<button>`s with `aria-label`; transcript is
  `aria-live="polite"`. Suggested chips and actions are keyboard reachable.
- Icons are `aria-hidden`; the notification badge is labelled.

## Performance

- **Lazy loaded** — `SiteChat` dynamic-imports `ChatWidget` (`ssr:false`), so its
  chunk loads on the client after interactive; it never blocks first paint.
- **No AI until first message** — the provider is only reached through the server
  action on send (key-gated); nothing AI runs on mount.
- **Virtualized transcript** — only the most recent N messages mount
  (`virtualizeMessages`), older ones are summarised as "hidden".
- **Memoization** — `MessageRow` is `memo`; card context and handlers are
  `useCallback`/`useMemo` to avoid unnecessary re-renders.

## Future Expansion (placeholders, no later layout change)

Behind feature flags in `CHAT_FEATURES`, with UI space already reserved:
Voice Chat (`voiceInput`), File Upload (`fileUpload` — Image/PDF/Document menu),
Screen Sharing (`screenShare`), Shopping Assistant (`shoppingAssistant`), Order
Tracking (`orderTracking`), Customer Account (`customerAccount`), Share
(`navigator.share`). Flip a flag to reveal — the layout is unchanged.

## Feedback

Disliking (or the Feedback action) opens the **reused** `FeedbackDialog`
(Feedback Platform, `AI_CHAT` entity) — Radix handles focus trap / ESC / ARIA.
Like/dislike also record through `useFeedback()`. No duplicate feedback form.
