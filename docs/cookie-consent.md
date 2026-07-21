# Cookie Consent Management System (Phase 2)

> A complete, production-ready consent manager built on the **Phase 1 Analytics
> Platform**. Not just a banner — it stores consent, respects it everywhere, and
> gates analytics so nothing is tracked without permission.

- **Module:** `src/modules/core/cookie-consent/`
- **Consumes (no new endpoints):** `POST/GET /api/analytics/cookie`, `POST /api/analytics/visitor`, `POST /api/analytics/session`, `POST /api/analytics/events`
- **DB:** Phase 1 `CookieConsent` model (one row per visitor, upserted)

---

## 1. Architecture

```
                       ┌───────────────────────────── CookieProvider (client) ─────────────────────────────┐
                       │  state: consent | loading | bannerVisible | preferencesOpen                        │
 <public> layout ──────┤  refs:  consentRef · visitorIdRef · analyticsStartedRef                            │
   wraps everything     │                                                                                    │
                       │   on mount ─▶ reconcile localStorage ↔ server (respect COOKIE_POLICY_VERSION)      │
                       │                 ├─ valid decision  → hydrate, (maybe) start analytics               │
                       │                 └─ none/expired    → show <CookieBanner/>                           │
                       │                                                                                    │
                       │   context (no prop drilling) ──▶ useCookieConsent() ──▶ CookieBanner /              │
                       │                                   CookiePreferencesModal (lazy) /                   │
                       │                                   CookieSettingsButton (footer)                     │
                       └────────────────────────────────────────────────────────────────────────────────────┘
                                                     │ decision
                                                     ▼
   writeStoredConsent(localStorage)     +     recordConsent() ─POST─▶ /api/analytics/cookie  (upsert, no dup)
                                                     │
                                        canTrackAnalytics(state) ? ──yes──▶ identify + session + PAGE_VIEW
                                                                   └─no───▶ essential only, NO analytics events
```

Layers:
- **`constants.ts`** — `COOKIE_POLICY_VERSION`, category metadata, storage keys.
- **`types.ts`** — `ConsentState`, `CategoryPreferences`, context type.
- **`validations.ts`** — client preference + stored-shape Zod schemas (server contract stays Phase 1's).
- **`consent-guards.ts`** — reusable pure guards (`hasConsent`, `canTrackAnalytics`, `canUseMarketing`, `canUsePreferences`).
- **`data/storage.ts`** — SSR-safe localStorage + id generation.
- **`data/consent-api.ts`** — typed client for the Phase 1 endpoints (`keepalive` for unload beacons).
- **`hooks/use-cookie-consent.ts`** — the public hook.
- **`components/`** — provider, banner, modal (lazy), settings button.
- **`actions.ts`** — re-exports Phase 1's admin-guarded consent reads (dashboard comes later).

---

## 2. Flow

**First visit** → no local/server consent → banner shows → user chooses → consent stored (local + DB) → if ANALYTICS allowed, identify + track begins.

**Return visit** → local consent found (version matches) → no banner → analytics auto-starts iff ANALYTICS was allowed.

**Policy change** → bump `COOKIE_CONSENT_VERSION` (shared) → every stored decision's version mismatches → banner re-appears automatically.

---

## 3. Lifecycle

| Stage | What happens |
|---|---|
| Mount | `getOrCreateVisitorId()` (localStorage), read stored consent, drop if version ≠ policy |
| Reconcile | If no valid local decision → `GET /api/analytics/cookie?visitorId=` (covers cleared storage) |
| Decide | Accept/Reject/Customize → `writeStoredConsent` + `recordConsent` (upsert) |
| Enforce | `startAnalytics()` runs only if `canTrackAnalytics` |
| Unload | `pagehide` → `endSession()` (keepalive) when analytics active |
| Re-open | `CookieSettingsButton` → modal to change anytime |

Statuses map 1:1 to the Prisma enum: `ACCEPTED` (all), `REJECTED` (necessary only), `CUSTOMIZED` (chosen), `UNKNOWN` (undecided).

---

## 4. Component Tree

```
CookieProvider (context)
├─ {children}                     ← navbar, pages, footer (all get context)
│   └─ Footer → CookieSettingsButton   (re-open preferences)
├─ CookieBanner                   (fixed bottom; only when bannerVisible && !preferencesOpen)
└─ CookiePreferencesModal         (lazy via next/dynamic; only when preferencesOpen)
      └─ Radix Dialog → focus trap · ESC · scroll-lock · ARIA
```

---

## 5. API Usage (all Phase 1, no duplicates)

- `POST /api/analytics/cookie` `{ visitorId, status, acceptedCategories }` → upsert consent.
- `GET  /api/analytics/cookie?visitorId=` → read own consent (reconciliation).
- `POST /api/analytics/visitor` → identify (only after ANALYTICS consent).
- `POST /api/analytics/session` (`{end:true}` to close) → session lifecycle.
- `POST /api/analytics/events` `{ eventType:"PAGE_VIEW", … }` → tracking.

The IP is hashed and validated server-side (Phase 1). The consent record is an idempotent **upsert** keyed by `visitorId`, so there are **never duplicate rows**.

---

## 6. Hooks & Guards

```ts
const { consent, loading, bannerVisible, acceptAll, rejectAll,
        updatePreferences, openPreferences, hasConsent, isAllowed, track } = useCookieConsent();

// Gate any feature (client or server) with the pure guards:
import { canTrackAnalytics, canUseMarketing, canUsePreferences } from '@/modules/core/cookie-consent/consent-guards';
if (canTrackAnalytics(consent)) track({ eventType: 'BUTTON_CLICK', entityId: 'buy-now' });
```

---

## 7. Security

- **Never trust the frontend.** All server writes go through Phase 1's Zod-validated, rate-limited, IP-hashing endpoints.
- **No duplicate writes.** Consent is a DB **upsert** (one row per visitor). The client also short-circuits on an unchanged local decision.
- **Replay protection.** Consent is idempotent (replaying the same POST just re-writes the same row); rate limiting (200/min/IP) caps abuse; the stored shape is Zod-validated before trust.
- **No PII in the client payload.** Only anonymous hints (language, timezone, screen, UTM). Raw IP never leaves the server layer and is stored hashed.
- **Version pinning.** A policy bump invalidates old decisions, forcing fresh, explicit consent.

---

## 8. Accessibility

- **Modal** uses Radix Dialog → **focus trap**, **ESC closes**, scroll-lock, `aria-modal`, labelled `DialogTitle`/`DialogDescription`.
- **Toggles** are `role="switch"` with `aria-checked` + `aria-label`; Necessary shows a locked "Always on" pill.
- **Banner** is a labelled `role="region"` (`aria-label="Cookie consent"`); all controls are real `<button>`s with visible focus rings; Privacy Policy is a real link.
- **Keyboard**: everything is tabbable; buttons have `min-h-11` (44px) touch targets.

---

## 9. Performance

- **Banner is lightweight** — one small component, no heavy deps.
- **Modal is lazy-loaded** (`next/dynamic`, `ssr:false`) — its chunk is fetched only when "Customize" is first clicked.
- **No layout shift** — banner is `position: fixed`; nothing reflows. It renders only after client mount (never during SSR), so no hydration flash.
- Analytics network calls fire **after** consent, off the critical render path.

---

## 10. Analytics Flow (consent-respecting)

```
ANALYTICS accepted ──▶ POST /visitor (identify + DeviceInfo)
                    ──▶ POST /session (start)
                    ──▶ POST /events  (PAGE_VIEW, then track() calls)
                    ──▶ pagehide → POST /session {end:true}

ANALYTICS rejected ──▶ only the consent record is written (essential)
                    ──▶ NO identify, NO session, NO events   (track() is a no-op)
```

> Note: writing the consent record itself creates a minimal anchor `Visitor` row (Phase 1 FK) with a **hashed** IP only — the minimum needed to store proof of the (reject) decision. No behavioural analytics are collected.

---

## 11. Future Integration

- **Google Login flow** — after OAuth, associate the authenticated user with the existing `visitorId` (attribution) only if consent allows; otherwise keep them anonymous.
- **AI flow** — with ANALYTICS consent, event/session data feeds AI insight generation and the chatbot's context (`eventType: CUSTOM`), reusing this pipeline with zero schema change.
- **Marketing pixels / preference storage** — gate strictly with `canUseMarketing()` / `canUsePreferences()` before loading any third-party script or persisting UI preferences.
- **Admin dashboard** — `getConsentAction` / `listConsentsAction` already exist (re-exported here) for a consent report.

---

## 12. Testing Checklist

| Scenario | Expected |
|---|---|
| **First visit** | Banner appears at bottom; nothing tracked yet |
| **Accept All** | Banner closes; consent `ACCEPTED` (4 cats) in localStorage + DB; identify + PAGE_VIEW fire |
| **Reject Non-Essential** | Banner closes; `REJECTED` (NECESSARY only); **no** analytics events; only consent row written |
| **Customize → toggles → Save** | `CUSTOMIZED` with chosen cats; analytics fires only if ANALYTICS on |
| **Version update** (bump `COOKIE_CONSENT_VERSION`) | Banner re-appears for everyone; new decision required |
| **Refresh** | No banner (decision remembered); analytics resumes iff allowed; one new PAGE_VIEW |
| **Incognito** | Fresh visitorId; banner shows; storage failures degrade gracefully |
| **Multiple tabs** | Each tab has its own `sessionId`; shared `visitorId`/consent via localStorage |
| **Expired/cleared localStorage** | Server reconciliation restores the decision (no re-prompt if DB still has it) |
| **Keyboard/AT** | Tab through banner; open modal → focus trapped, ESC closes, toggles announce state |
| **DB** | Exactly one `CookieConsent` row per visitor (upsert), `version`/`status`/`acceptedCategories`/`acceptedAt` correct |

**How to reset while testing:** clear site data / localStorage keys `jivo.cookie.consent`, `jivo.visitor.id`, `jivo.session.id`, then reload.

---

## 13. Deliverables

See the task response for the full Files Created / Modified / Components / Hooks / Provider / Actions / APIs Used tables.
