# Universal Visitor Tracking Engine (Phase 3)

> Automatic, consent-respecting, zero-code behavioural tracking for the whole
> site. Mount one provider and **every** page, click, scroll, download, form and
> video is tracked — no per-page wiring.

- **Module:** `src/modules/core/tracking/`
- **Builds on:** Phase 1 (ingestion APIs + models) and Phase 2 (cookie consent).
- **New endpoints:** **none.** Everything is written through Phase 1's
  `POST /api/analytics/events` (batched), `/session`, `/visitor`.

---

## 1. Zero-code by design

The public layout wraps the app in `<TrackingProvider>` (inside `<CookieProvider>`).
That single mount does everything:

```tsx
// src/app/(public)/layout.tsx
<CookieProvider>
  <TrackingProvider>
    {/* navbar, pages, footer … */}
  </TrackingProvider>
</CookieProvider>
```

A future developer adds a new page and it is tracked automatically. To capture a
custom interaction, they either add a data attribute:

```html
<button data-track data-track-name="request-quote" data-track-cta>Get a quote</button>
```

or call the hook:

```tsx
const t = useTracking();
t.trackForm('submit', 'contact-form', { fields: 4 });
```

Both no-op automatically unless the visitor granted **ANALYTICS** consent.

---

## 2. Architecture

```
 ┌──────────────── <TrackingProvider> (client) ───────────────┐
 │ reads useCookieConsent() → canTrackVisitor(consent)         │
 │   consent granted → engine.enable()                         │
 │   consent revoked → engine.disable() (+ final flush)        │
 │                                                             │
 │ renders (null output):                                      │
 │   <AutoPageTracker/>    → SPA route-change page views       │
 │   <VisibilityTracker/>  → tab show/hide semantic events     │
 │   <NavigationTracker/>  → end-of-session journey summary    │
 └───────────────────────────┬─────────────────────────────────┘
                             │ enable()
                             ▼
          ┌──────────── TrackingEngine (singleton) ────────────┐
          │ owns ALL global listeners + page/session lifecycle │
          │  • click delegation (capture) → button/link/       │
          │       external/download classification             │
          │  • scroll depth (25/50/75/100, once each)          │
          │  • visibilitychange → time accounting + flush      │
          │  • pagehide → endPage + endSession + beacon flush  │
          │  • popstate/hashchange → nav-type + hash routes    │
          │  • first-touch attribution (referrer + UTM)        │
          │  track()/handleRouteChange() → EventQueue          │
          └───────────────────────────┬────────────────────────┘
                                      ▼
                       ┌──────── EventQueue ────────┐
                       │ batch (≤ MAX_EVENT_BATCH)  │
                       │ flush: 5s idle / full /    │
                       │        visibility / unload │
                       │ retry w/ backoff (≤3)      │
                       │ offline persist → replay   │
                       │ unload → navigator.beacon  │
                       └───────────┬────────────────┘
                                  ▼
                  POST /api/analytics/events  { events:[…] }   (Phase 1)
```

### Files

| File | Responsibility |
|---|---|
| `constants.ts` | Event vocabulary, queue tuning, scroll depths, download exts, referrer map, UTM keys, DOM attrs, limits |
| `types.ts` | `TrackEventInput`, `QueuedEvent`, `ReferrerInfo`, `Attribution`, `TrackingApi` |
| `validations.ts` | `normalizeEvent`, `sanitizeString`, `sanitizeMetadata` (size-cap, control-char strip) |
| `middleware.ts` | Pure DOM/URL helpers: `findTrackable`, `classifyClick`, `classifyReferrer`, `getDownloadExtension`, `isExternalLink`, `readUtmParams` |
| `data/queue.ts` | `EventQueue` — batching, retry/backoff, offline, beacon |
| `data/attribution.ts` | First-touch referrer + UTM, captured once per session |
| `data/engine.ts` | `TrackingEngine` singleton — listeners + page/session lifecycle |
| `hooks/` | `useTracking`, `usePageTracking`, `useScrollTracking`, `useClickTracking` |
| `components/` | `TrackingProvider`, `AutoPageTracker`, `VisibilityTracker`, `NavigationTracker` |
| `actions.ts` | Re-exports Phase 1's admin-guarded `listEventsAction` (for a future dashboard) |

---

## 3. What is tracked automatically

| Signal | Event type | How |
|---|---|---|
| Page view (load, SPA nav, reload, back/forward, hash) | `PAGE_VIEW` | engine + `usePathname` + Navigation Timing / popstate / hashchange; `metadata.navType` |
| Scroll depth 25/50/75/100 | `SCROLL` | throttled window scroll, once per depth per page |
| Button / link clicks | `BUTTON_CLICK` / `LINK_CLICK` | delegated capture-phase click, classified by element |
| External links | `LINK_CLICK` (`metadata.external`) | same-origin check |
| File downloads | `DOWNLOAD` | link extension match (pdf, doc, zip, images, video, …) |
| Time on page | `CUSTOM` (`entityId: time_on_page`) | visibility-aware active-time accounting on page leave |
| Tab show / hide | `CUSTOM` (`visibility`) | `VisibilityTracker` |
| Navigation journey | `CUSTOM` (`navigation-path`) | `NavigationTracker` on unload |
| UTM + referrer | on the landing `PAGE_VIEW` metadata | first-touch attribution |
| Session start / end | `/api/analytics/session` | engine on enable / pagehide |

Opt **out** any element with `data-no-track` (applies to descendants).

## 4. What is tracked on demand (`useTracking`)

```ts
const t = useTracking();
t.trackSearch('turmeric', 12);
t.trackDownload('/files/brochure.pdf');
t.trackVideo('play' | 'pause' | 'complete' | 'progress', 'hero-video', { percent: 50 });
t.trackForm('open' | 'start' | 'submit' | 'success' | 'error', 'contact-form');
t.trackClick('newsletter-signup', { placement: 'footer' });
t.trackEvent('custom_thing', { any: 'metadata' });
```

Event types map to the Prisma `AnalyticsEventType` enum, which was extended
(additively) with `VIDEO_PAUSE`, `VIDEO_COMPLETE`, `FORM_START`, `FORM_SUCCESS`,
`FORM_ERROR` for this phase.

---

## 5. Event queue guarantees

- **Batched** — up to `MAX_EVENT_BATCH` (20) events per request (server cap).
- **Flushed** on: 5s idle timer · buffer full · tab hidden · `pagehide` · back online.
- **Reliable on unload** — `navigator.sendBeacon` (survives the tab closing).
- **Retried** with linear backoff, dropped after 3 failures (no infinite loop).
- **Offline-safe** — buffer persisted to `localStorage` (`jivo.track.queue`) and
  replayed on next load / when `online` fires. Capped at 100 events to bound memory.

---

## 6. Consent & privacy

- Nothing is enqueued unless `canTrackVisitor(consent)` (ANALYTICS) is true — the
  engine is only `enable()`d by `TrackingProvider` after consent, and every
  `track()` re-checks `enabled`.
- Revoking consent calls `engine.disable()` — listeners detached, queue flushed, silent thereafter.
- **No PII, no raw IP** on the client. The server (Phase 1) hashes the IP and
  never exposes internal ids. Metadata is **sanitized** (control chars stripped,
  strings capped at 300 chars, bag capped at 2 KB, non-primitives dropped).
- Only known event types reach the queue (`normalizeEvent` rejects the rest), so
  the server never sees garbage.

---

## 7. Performance

- **One** delegated click listener + **one** throttled (250ms) scroll listener for
  the whole app — not per element.
- Page views use `usePathname` only (no `useSearchParams`) → **no Suspense
  boundary required**, no extra client bundle cost.
- The engine + queue are a lazy singleton; components render `null`.
- Network is batched and off the critical path; unload uses beacons (no blocking).

---

## 8. Integration with earlier phases

- **Phase 1** owns the DB + ingestion + admin reads. This engine only *calls* it.
- **Phase 2** owns the consent decision and the one-time visitor **identify**
  (enrichment). Session lifecycle + all behavioural events moved here so there is
  a **single source of truth** and **no duplicate `PAGE_VIEW` / session rows**.

---

## 9. Extending it

- New download types → add to `DOWNLOAD_EXTENSIONS`.
- New referrer sources → add to `REFERRER_SOURCES`.
- New event category → add to the Prisma enum + `TRACK_EVENT`, then a helper on
  `useTracking`.
- Feature gating (AI, chat, recommendations) → use
  `canTrackVisitor` / `canInitializeAI` / … from `@/modules/core/cookie-consent`.

---

## 10. Architecture Changes (review pass)

Two additive, non-breaking platform improvements landed alongside this phase:

### Core Config module — `src/modules/core/config/`
One canonical, client-safe read surface for platform configuration + feature
flags. Definitions stay in their existing homes (`shared/constants`,
`tracking/constants`, `cookie-consent/constants`) — config **aggregates**, it
does not redefine, so there is no duplication and nothing broke.

```ts
import { ANALYTICS_CONFIG, TRACKING_CONFIG, COOKIE_CONFIG,
         PLATFORM_FEATURES, isFeatureEnabled } from '@/modules/core/config';
if (isFeatureEnabled('ai')) { /* … */ }
```

Future modules should read config/flags from here.

### Platform Event Bus — `src/modules/core/events/`
A tiny, dependency-free, error-isolated in-process pub/sub. **Platform emits,
business subscribes** — so business modules react to platform signals without
the platform ever importing them (enforces the one-way dependency rule).

```ts
import { platformEvents } from '@/modules/core/events';
const off = platformEvents.on('consent:accepted', ({ categories }) => { /* … */ });
platformEvents.emit('product:viewed', { productId });   // business events are open strings
```

Core events already emitted: `consent:updated`, `consent:accepted`,
`consent:rejected` (Cookie Provider), `session:started`, `session:ended`,
`page:viewed` (Tracking Engine). Core events are typed via `PlatformEventMap`;
business modules add their own string events without touching Core.

> The bus is a synchronous app-lifetime signal bus, **not** a durable queue —
> durable analytics still flow through the batched `EventQueue` → Phase 1 API.

## 11. Future Improvements (deferred — need a breaking change or a later phase)

- **Migrate existing modules to read from `core/config`.** Today config is a
  parallel canonical surface; the old direct imports still work. Fully switching
  every call site (and making `shared/constants` re-export *from* config) is a
  churny refactor better done as its own pass — deferred to avoid breakage.
- **Persisted / cross-tab event bus.** Current bus is in-memory per tab. A
  `BroadcastChannel` layer for cross-tab platform events is additive but not yet
  needed.
- **Server-side event bus bridge.** Emits are client-side; a server bridge
  (e.g. for auth `login`/`logout` from server actions) can be added when Auth
  events are wired.
- **Product / funnel / conversion event types** for the shop.jivo.in → jivo.in
  migration — additive enum values + new `platformEvents` strings; no rewrite.

## 12. Testing checklist

| Scenario | Expected |
|---|---|
| No consent | No events, no session, queue empty |
| Accept analytics | Session starts; landing `PAGE_VIEW` fires once (no duplicate from Phase 2) |
| Navigate between pages | One `PAGE_VIEW` per route change; `previousPath` set |
| Scroll a long page | `SCROLL` at 25/50/75/100 once each |
| Click a button / link | `BUTTON_CLICK` / `LINK_CLICK` with label |
| Click a `.pdf` link | `DOWNLOAD` with `fileType: pdf` |
| `data-no-track` element | Ignored |
| Switch tab away & back | `visibility` events; time-on-page counts only visible time |
| Close tab | `pagehide` → time-on-page + session end + beacon flush |
| Go offline, act, come back | Events buffered in `localStorage`, replayed on `online` |
| Revoke consent | `engine.disable()`; nothing tracked afterwards |
