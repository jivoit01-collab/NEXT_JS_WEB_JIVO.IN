# Analytics Platform — Foundation (Phase 1)

> Reusable, privacy-first analytics **infrastructure** for Jivo Wellness. This
> phase ships the data model, validation, data layer, ingestion APIs, and
> security only. No dashboard, chatbot, login, or feedback — those are later
> phases that **consume** this foundation.

- **Module root:** `src/modules/core/`
- **Prisma schema:** `prisma/schema/analytics.prisma`
- **APIs:** `src/app/api/analytics/*`

---

## 1. Architecture

Everything is modular and mirrors the project's existing feature-module pattern
(`types.ts` · `validations.ts` · `actions.ts` · `data/{queries,mutations,index}.ts` · `index.ts`).

```
Client (browser)                         Server                                   PostgreSQL
─────────────────                        ──────                                   ──────────
navigator.sendBeacon / fetch  ──POST──▶  /api/analytics/*  (route handler)
                                          │  1. rate limit  (localRateLimit.analytics, per IP)
                                          │  2. Zod validate (never trust body)
                                          │  3. build RequestContext (hash IP, UA, referrer)
                                          │  4. ingest*()  ───▶  data/mutations.ts  ──▶  prisma.*.upsert / createMany
                                          ▼
                                        JSON envelope { success, data | error }

Admin dashboard (future)      ──GET───▶  /api/analytics/*  (requireAdminGuard)  ──▶ data/queries.ts ──▶ prisma.*.findMany
                              or server actions (modules/core/*/actions.ts, admin-guarded)
```

**Design rules honoured**

- **One event table.** Every interaction (page view, click, download, video…) is a single `AnalyticsEvent` row — never a per-type table.
- **Never trust the client.** All input is Zod-validated. IP is hashed server-side; geo/device are derived server-side (client may only *hint*).
- **Never expose internal IDs.** Public identifiers are `visitorId` / `sessionId`; the DB primary key `id` (and `ipHash`) are never returned by any query/DTO.
- **Rate-limited writes.** Public ingestion is capped per IP (200/min).
- **Auth-ready.** Read endpoints/actions already gate on an admin session; ingestion is intentionally public + rate-limited.

---

## 2. Database ER Diagram (text)

```
                         ┌───────────────────────────┐
                         │          Visitor          │
                         │  id (PK, internal)        │
                         │  visitorId (UNIQUE) ◀─────┼──────────────┐
                         │  ipHash, userAgent        │              │ references
                         │  browser/os/device/type   │              │ visitorId
                         │  screen, geo, utm, referrer│             │ (not id)
                         │  firstVisit/lastVisit      │              │
                         │  visitCount, lastSeen      │              │
                         │  createdAt/updatedAt       │              │
                         │  deletedAt (soft delete)   │              │
                         └──────┬───────┬──────┬──────┘              │
                    1:N         │       │ 1:1  │ 1:1                 │
          ┌───────────────┐    │       │      │                     │
          ▼               ▼    ▼       ▼      ▼                     │
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  VisitorSession  │ │ AnalyticsEvent│ │ CookieConsent│ │  DeviceInfo  │
│ id (PK)          │ │ id (PK)      │ │ id (PK)      │ │ id (PK)      │
│ sessionId UNIQUE◀┼─┼ sessionId (FK│ │ visitorId U/FK│ │ visitorId U/FK│
│ visitorId (FK) ──┼─┘ setNull)     │ │ status(enum) │ │ deviceType   │
│ startedAt/endedAt│ │ visitorId(FK)│ │ acceptedCat[]│ │ browser/os   │
│ duration/isBounce│ │ eventType    │ │ version      │ │ platform     │
│ entryPage/exit   │ │ page/entity  │ │ acceptedAt   │ │ viewport w/h │
└──────────────────┘ │ metadata JSON│ └──────────────┘ │ isMobile/... │
        ▲            │ timestamp     │                  └──────────────┘
        └────────────┤ createdAt     │
   1:N events        └───────────────┘
```

Relations all reference `Visitor.visitorId` (a `@unique` field), and `onDelete`:
- `VisitorSession`, `CookieConsent`, `DeviceInfo`, `AnalyticsEvent.visitor` → **Cascade** (delete visitor ⇒ delete their data).
- `AnalyticsEvent.session` → **SetNull** (deleting a session keeps its events).

---

## 3. Module Structure

```
src/modules/core/
├── index.ts                     # top-level barrel (CoreShared/Visitor/Session/Cookie/Analytics)
├── shared/                      # cross-module foundation
│   ├── constants.ts             # versions, limits, page sizes, thresholds
│   ├── security.ts              # hashIp(), hashedClientIp(), rateLimitKey()
│   ├── device.ts                # parseUserAgent(), normalizeDeviceType()
│   ├── http.ts                  # apiOk/apiError/apiValidationError, getRequestContext, enforceAnalyticsRateLimit
│   ├── auth.ts                  # requireAdminGuard()
│   ├── types.ts                 # AnalyticsApiResponse, Paginated, RequestContext
│   └── index.ts
├── visitor/                     # Visitor + DeviceInfo (1:1)
│   ├── types.ts  validations.ts  actions.ts  index.ts
│   └── data/{queries,mutations,index}.ts
├── session/                     # VisitorSession
│   ├── types.ts  validations.ts  actions.ts  index.ts
│   └── data/{queries,mutations,index}.ts
├── cookie/                      # CookieConsent
│   ├── types.ts  validations.ts  actions.ts  index.ts
│   └── data/{queries,mutations,index}.ts
└── analytics/                   # AnalyticsEvent (universal log)
    ├── types.ts  validations.ts  actions.ts  index.ts
    └── data/{queries,mutations,index}.ts
```

Layer responsibilities:
- **`data/mutations.ts`** — pure DB writes + ingest orchestrators (`ingestVisitor`, `ingestSession`, `ingestConsent`, `ingestEvents`).
- **`data/queries.ts`** — pure DB reads returning public-safe DTOs.
- **`actions.ts`** — `'use server'` admin-guarded reads for the future dashboard.

---

## 4. API Flow

| Method & Route | Auth | Purpose | Success |
|---|---|---|---|
| `POST /api/analytics/visitor` | public + rate-limit | identify/upsert visitor (+ device info) | `201` |
| `GET  /api/analytics/visitor?visitorId=` | admin | one visitor | `200` |
| `GET  /api/analytics/visitor?page=&pageSize=` | admin | list visitors | `200` |
| `POST /api/analytics/session` | public + rate-limit | start (`201`) / end (`200`, `{end:true}`) | `200/201` |
| `GET  /api/analytics/session?sessionId=` | admin | one session | `200` |
| `GET  /api/analytics/session?visitorId=&page=` | admin | list sessions | `200` |
| `POST /api/analytics/cookie` | public + rate-limit | set/update consent | `201` |
| `GET  /api/analytics/cookie?visitorId=` | **public (own id)** | read own consent | `200` |
| `GET  /api/analytics/cookie?page=` | admin | list consents | `200` |
| `POST /api/analytics/events` | public + rate-limit | one event or `{ events:[…] }` batch | `201` |
| `GET  /api/analytics/events?…filters` | admin | filter+paginate log | `200` |

**Status codes:** `200` OK · `201` Created · `400` validation/bad JSON · `401` unauthenticated · `403` not admin · `429` rate-limited (`Retry-After`) · `500` server error.

All responses use one envelope:
```jsonc
{ "success": true, "data": … }
{ "success": false, "error": "Validation failed", "fieldErrors": { "visitorId": ["Invalid visitorId"] } }
```

---

## 5. Security

- **IP is never stored raw.** `hashIp()` = `SHA-256(ANALYTICS_IP_SALT + ip)` (`src/modules/core/shared/security.ts`). The salt falls back to `AUTH_SECRET`; set a dedicated `ANALYTICS_IP_SALT` in production and rotate it to anonymise history.
- **Raw IP** is used only as an in-memory rate-limit key — never persisted.
- **Validation everywhere.** Every route parses the body/query with Zod before touching the DB. No `any`.
- **Never trust client-declared identity.** `browser/os/device` are parsed from the UA server-side; `country/city` are server-derived (reserved for a future geo step). Client `deviceType` is treated as a *hint* only.
- **Internal IDs hidden.** DTO `select`s omit `id` and `ipHash` — the public surface is `visitorId`/`sessionId`.
- **Rate limiting.** `localRateLimit.analytics` = 200 writes/min/IP (in-memory, single-process — swap for Redis if horizontally scaled).
- **Body size** bounded by the batch cap (`MAX_EVENT_BATCH = 20`) and Next's request limits.
- **Auth-ready.** Admin reads use `requireAdminGuard()` (ADMIN/SUPER_ADMIN). Ingestion is deliberately public so it works pre-consent/anonymously.

---

## 6. Validation

Schemas live in each module's `validations.ts`:

| Schema | Endpoint |
|---|---|
| `visitorIngestSchema`, `visitorIdSchema`, `paginationSchema` | visitor |
| `sessionIngestSchema`, `sessionIdSchema` | session |
| `cookieConsentSchema` | cookie |
| `analyticsEventSchema`, `analyticsEventBatchSchema`, `eventFilterSchema` | events |

Identifiers must match `^[A-Za-z0-9_-]{8,64}$`. Enums (`AnalyticsEventType`, `CookieConsentStatus`, `CookieCategory`) are validated against the Prisma enums, so DB and API can never drift.

---

## 7. Database Schema (summary)

Enums: `CookieConsentStatus {UNKNOWN,ACCEPTED,REJECTED,CUSTOMIZED}`,
`CookieCategory {NECESSARY,ANALYTICS,MARKETING,PREFERENCES}`,
`AnalyticsEventType {PAGE_VIEW,BUTTON_CLICK,LINK_CLICK,SCROLL,SEARCH,DOWNLOAD,VIDEO_PLAY,FORM_OPEN,FORM_SUBMIT,CUSTOM}`,
`AnalyticsDeviceType {MOBILE,TABLET,DESKTOP,UNKNOWN}`.

Models (all `cuid` PKs, `createdAt/updatedAt`, indexed):
- **Visitor** — identity, geo, device, acquisition (utm/referrer), lifecycle counters, `lastSeen`, `deletedAt` (soft delete). Indexed on `ipHash, country, lastSeen, createdAt, deletedAt`.
- **VisitorSession** — `sessionId`, `visitorId`, timing, `entryPage/exitPage`, `duration`, `isBounce`, soft delete. Indexed on `visitorId, startedAt`.
- **CookieConsent** — 1:1 visitor, `status`, `acceptedCategories[]`, `version`, `acceptedAt`. Indexed on `status`.
- **AnalyticsEvent** — universal log: `eventType, page, entityType, entityId, metadata(JSON), timestamp, sessionId, visitorId`. Indexed on `eventType, page, timestamp, visitorId, sessionId, (entityType,entityId)`.
- **DeviceInfo** — 1:1 visitor snapshot: `deviceType, browser, os, platform, viewport, isMobile/isTablet/isDesktop`.

---

## 8. Folder Structure (created)

- `prisma/schema/analytics.prisma`
- `src/modules/core/**` (see §3)
- `src/app/api/analytics/{visitor,session,cookie,events}/route.ts`
- `docs/analytics-platform.md`

---

## 9. Event Flow (page view example)

```
1. First load → client generates visitorId + sessionId (localStorage), then:
2. POST /api/analytics/visitor  { visitorId, language, timezone, screen, viewport, utm… }
      → upsert Visitor + upsert DeviceInfo
3. POST /api/analytics/session  { sessionId, visitorId, entryPage }        → create session
4. POST /api/analytics/events   { eventType:"PAGE_VIEW", page, sessionId, visitorId }
5. …clicks/scrolls → more events (may be batched via { events:[…] })
6. On unload → navigator.sendBeacon("/api/analytics/session", { sessionId, visitorId, exitPage, end:true })
      → server sets endedAt, duration, isBounce (from PAGE_VIEW count)
```

FK safety: `ingestSession` / `ingestEvents` call `ensureVisitorExists()` (and ensure sessions) first, so events never fail regardless of call order.

---

## 10. Examples

**Ingest an event (single):**
```bash
curl -X POST https://abc.jivo.in/api/analytics/events \
  -H "Content-Type: application/json" \
  -d '{ "eventType":"BUTTON_CLICK","page":"/products","entityType":"product","entityId":"p123",
        "visitorId":"vX7d2Kd9a1","sessionId":"s0Pq8Lm3Za","metadata":{"label":"Add to cart"} }'
# → 201 { "success": true, "data": { "written": 1 } }
```

**Batch:**
```jsonc
POST /api/analytics/events
{ "events": [
  { "eventType":"PAGE_VIEW","page":"/","visitorId":"vX7d2Kd9a1","sessionId":"s0Pq8Lm3Za" },
  { "eventType":"SCROLL","page":"/","visitorId":"vX7d2Kd9a1","sessionId":"s0Pq8Lm3Za","metadata":{"depth":75} }
] }
```

**Admin query:**
```
GET /api/analytics/events?eventType=PAGE_VIEW&from=2026-07-01&page=1&pageSize=50   (admin session required)
```

**Server-side (future dashboard) via actions:**
```ts
import { listEventsAction } from '@/modules/core/analytics';
const res = await listEventsAction({ eventType: 'PAGE_VIEW', pageSize: 100 });
```

---

## 11. Testing Guide

- **Unit** — `parseUserAgent()` (browser/os/device buckets), `hashIp()` (stable + null for empty), `clampTimestamp()` (rejects skew), Zod schemas (accept/reject fixtures).
- **API** — hit each route with valid/invalid bodies; assert status codes (`400/401/403/429/201/200`) and that responses never contain `id`/`ipHash`.
- **DB** — verify FK-safety (post an event with an unknown visitor → visitor auto-created), soft delete (`deletedAt` hides rows from queries), cascade (delete visitor → sessions/events/consent/device removed).
- **Rate limit** — fire >200 writes/min from one IP → expect `429` + `Retry-After`.
- **Manual** — `npm run db:studio` to inspect rows.

---

## 12. Future Extension Points

- **Geo enrichment** — populate `Visitor.country/city` from a server IP-geolocation lookup (hook in `ingestVisitor`).
- **Bot filtering** — drop known crawler UAs in `parseUserAgent` / route guard.
- **New event types** — add to the `AnalyticsEventType` enum + `db push`; no schema/table changes elsewhere.
- **Redis rate limit / queue** — swap `localRateLimit` for a shared store when scaling horizontally; batch-write events via a queue.
- **Aggregations** — materialised daily rollups for fast dashboards.
- **Retention job** — cron to purge/anonymise events older than N months.

---

## 13. Admin Integration Plan (next phase)

- New dashboard page `src/app/jivo-dev/(dashboard)/analytics/page.tsx` reading via the admin `GET` endpoints / server actions (`listVisitorsAction`, `listSessionsAction`, `listEventsAction`, `listConsentsAction`).
- Add an "Analytics" entry to the dashboard sidebar (`layout.tsx`).
- Charts (visitors over time, top pages, device split, consent breakdown, bounce rate) computed from `countEvents()` / grouped queries — all data already captured here.

---

## 14. Future AI Integration

- **Insight generation** — feed aggregated event/session data to a Claude model to summarise trends, anomalies, and drop-off points ("why did bounce spike on /products?").
- **Chatbot context** — the chatbot phase can log its own turns as `AnalyticsEvent` (`eventType: CUSTOM`, `entityType: "chat"`), reusing this pipeline with zero schema changes.
- **Recommendations / segments** — cluster visitors by `DeviceInfo` + behaviour for personalised content, driven entirely off this foundation.

---

## 15. Environment

| Var | Purpose | Fallback |
|---|---|---|
| `ANALYTICS_IP_SALT` | salt for IP hashing (set + rotate in prod) | `AUTH_SECRET` → dev salt |

No new dependencies were added. Uses existing Prisma, Zod, `localRateLimit`, and NextAuth.
