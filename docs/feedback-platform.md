# Universal Feedback Platform (Phase 6)

> ONE reusable feedback platform for **every** feature — website, page, product,
> AI, bug, feature request, support, order, delivery, review. Entity-based, so
> any business module attaches feedback with **no new table and no redesign**.

- **Module:** `src/modules/platform/feedback/`
- **Reuses:** Core Visitor/Session identity, Auth (userId), the Event Bus, Core UA
  parsing + rate limiting, and the Analytics Platform (widgets + data source).
- **One table:** `Feedback` (+ enums). No per-feature feedback tables.

---

## 1. Architecture

```
 Public components ─▶ useFeedback() ─▶ createFeedbackAction() ─▶ submitFeedback() ─▶ Prisma
  (Thumbs, Stars,      (client:          (server: rate-limit,      (service: UA parse,   Feedback
   Forms)               visitor/session   validate, auth userId)    sentiment, create,
                        + page context)                             emit FEEDBACK_CREATED)

 Admin (Analytics Dashboard):
   Feedback widgets ─▶ Widget Renderer ─▶ Feedback Data Source ─▶ feedback queries ─▶ Prisma
   (widgets never touch Prisma)
```

### Folder structure
```
platform/feedback/
├── types/        enums (string), CreateFeedbackInput, FeedbackDTO, FeedbackStats, FEEDBACK_EVENTS
├── validations/  zod: create / update / filter
├── config/       FEEDBACK_FEATURES flags + FEEDBACK_CONFIG (rate limit, pagination)
├── utils/        deriveSentiment, humanizeEnum
├── data/         queries + mutations + mappers  (server-only)
├── services/     submitFeedback / editFeedback / resolveFeedbackStatus / removeFeedback (+ events)
├── actions/      create (public) · get/list/update/changeStatus/delete (admin-guarded)
├── hooks/        useFeedback (client)
├── components/   StarRating, ThumbsFeedback, FeedbackForm (+ Simple/Detailed/Bug/Feature/Contact)
├── analytics.ts  FEEDBACK_ANALYTICS_MODULE + widgets (data the dashboard registers)
└── index.ts      client-safe barrel (server via subpaths)
```

Import boundaries: client → the barrel; server data → `…/feedback/data`; server
service → `…/feedback/services`; dashboard descriptor → `…/feedback/analytics`.

---

## 2. Database schema (single model)

`Feedback` — id, **visitorId / userId / sessionId** (soft refs, no FK → Core/Auth
stay frozen), **type · source · entityType · entityId**, pageUrl/pageTitle,
**rating · sentiment · title · message · metadata(JSON)**, **status · priority ·
assignedTo · response · respondedAt · resolvedAt**, deviceType/browser/language,
createdAt/updatedAt, **deletedAt (soft delete)**.

Enums: `FeedbackType` (GENERAL, PAGE, PRODUCT, CONTACT, AI, BUG, FEATURE, SUPPORT,
ORDER, DELIVERY, REVIEW) · `FeedbackSource` (WEBSITE, PAGE, FOOTER, HEADER,
CONTACT_FORM, AI_CHATBOT, PRODUCT_PAGE, COMMUNITY, MOBILE_APP, API) ·
`FeedbackEntityType` (PAGE, PRODUCT, BLOG, AI_CHAT, ORDER, CATEGORY, VIDEO, RECIPE,
GENERAL) · `FeedbackStatus` (OPEN, IN_PROGRESS, RESOLVED, CLOSED, SPAM) ·
`FeedbackSentiment` (POSITIVE, NEUTRAL, NEGATIVE) · `FeedbackPriority` (LOW, MEDIUM,
HIGH, URGENT). All additive.

Indexed: type, status, sentiment, visitorId, userId, (entityType, entityId),
createdAt, deletedAt.

## 3. Entity model

`entityType` + `entityId` let one platform serve every module:
`PRODUCT/<id>`, `BLOG/<id>`, `AI_CHAT/<id>`, `ORDER/<id>`, `VIDEO/<id>`, … — no
schema change to add a new surface.

---

## 4. Feedback lifecycle

```
submit (public)  → OPEN  → IN_PROGRESS → RESOLVED / CLOSED   (or SPAM)
                    │ FEEDBACK_CREATED        │ FEEDBACK_RESOLVED
   admin edit/status → FEEDBACK_UPDATED       delete → FEEDBACK_DELETED (soft)
```
Sentiment is derived from rating (≥4 positive · 3 neutral · ≤2 negative; BUG→neg,
FEATURE→neutral when unrated). `resolvedAt`/`respondedAt` are stamped on transition.

## 5. Visitor / identity integration (no duplication)
The client hook reuses `getOrCreateVisitorId` / `getOrCreateSessionId` (Cookie
Consent storage) and auto-fills pageUrl/pageTitle/language; the server resolves
`userId` from `auth()` and parses device/browser via Core `parseUserAgent`. No new
visitor/session logic.

## 6. Analytics integration (Event Bus + Dashboard)
- **Events:** `feedback:created` (client + server), `feedback:updated`,
  `feedback:resolved`, `feedback:deleted` on the platform Event Bus — reused, not
  a new analytics system.
- **Dashboard:** `FEEDBACK_ANALYTICS_MODULE` is registered into the **existing**
  Analytics Dashboard (dashboard → feedback, one-way). It appears as **Feedback**
  with pages **General · Page Feedback · Product Reviews · AI Feedback · Bug
  Reports · Feature Requests · Support · Resolved**. A `feedbackDataSource` (in
  admin/analytics, consuming feedback's query functions — never Prisma in widgets)
  powers the KPIs + breakdowns.
- **Widgets:** reuse the shared KPI/breakdown/facts widgets; feedback-specific
  ones (`feedback-by-type`, `feedback-sentiment`, `feedback-top-pages`,
  `feedback-recent`) render real data. Every widget supports loading / ready /
  empty / placeholder / error.

## 7. Feedback API (server actions)
`createFeedbackAction` (public, rate-limited) · `getFeedbackAction` ·
`listFeedbackAction` · `updateFeedbackAction` · `changeStatusAction` ·
`deleteFeedbackAction` (admin-guarded via `requireAdminGuard`). No duplicate
business logic — all go through the service layer.

## 8. Public components (all reuse the same backend)
`StarRating`, `ThumbsFeedback`, and one `FeedbackForm` engine + presets
`SimpleFeedbackForm` / `DetailedFeedbackForm` / `BugReportForm` /
`FeatureRequestForm` / `ContactFeedbackForm`. Success/empty/error states built in.

```tsx
import { ThumbsFeedback, BugReportForm } from '@/modules/platform/feedback';
<ThumbsFeedback entityType="BLOG" entityId={post.id} />
<BugReportForm source="FOOTER" />
```

## 9. Fallback
No feedback → widgets show friendly empty states (never blank / broken); each
metric fails soft (`Promise.allSettled` → 0). Admin actions return typed results.

## 10. Future compatibility (consume, don't redesign)
AI Chatbot (`entityType: AI_CHAT`), Products/Reviews (`PRODUCT`), Orders (`ORDER`),
Delivery, CRM, Support, Knowledge Base — all attach via `entityType/entityId` and
render in the same dashboard module. Flip a `FEEDBACK_FEATURES` flag to light up a
capability; no schema/route/widget redesign.

## 11. Verified (live DB)
Created BUG/NEGATIVE (rating 2) → stats `{ total: 1, negative: 1, avgRating: 2 }`,
byType `[BUG:1]` → cleaned up. Build / ESLint / TypeScript / Prisma all pass.
