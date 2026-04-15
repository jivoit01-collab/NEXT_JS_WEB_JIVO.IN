# Implementation Plan — SEO System, Lazy Loading & Per-Page Folder Refactor

> **Status:** Plan only. No code will be written until you say "go".
> **Scope:** Add a full SEO system, wire lazy loading into every page, and refactor the home page into the per-page folder structure from `docs/EXPLAIN.md`. All rules already codified in `docs/prompt1.md` (§23 / §24 / §25 / §26).

---

## Why this change

1. **SEO is currently missing.** Pages don't have per-page metadata editable by the admin. Default metadata is weak / static.
2. **Every section renders on first paint.** `main.tsx` imports every section eagerly → heavy JS bundle, slow LCP. Need `next/dynamic` + intersection-observer lazy loading.
3. **Home is a one-off.** Every other page will live under `src/app/(public)/{page}/`, but home is a naked `page.tsx`. Refactoring home into `(public)/home/` gives it its own folder for SEO, loading state, and future per-page assets — symmetry with every other page.

---

## Phase 1 — Shared infrastructure (do first, reused by every page)

### 1.1 Prisma model — `SeoMeta`

The model already exists in `prisma/schema.prisma`. Update it to the richer shape defined in `prompt1.md §23`:

```prisma
model SeoMeta {
  id              String   @id @default(cuid())
  page            String   @unique   // "home", "about", "products", "blog", "product:{slug}", ...
  metaTitle       String
  metaDescription String?  @db.Text
  keywords        String[]
  ogTitle         String?
  ogDescription   String?  @db.Text
  ogImage         String?
  twitterCard     String   @default("summary_large_image")
  canonicalUrl    String?
  structuredData  Json?
  robots          String   @default("index,follow")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([page])
}
```

Run `npm run db:generate && npm run db:push`.

### 1.2 Shared SEO module — `src/modules/seo/`

Create the reusable module exactly as specified in `prompt1.md §23`:

```
src/modules/seo/
  ├── types.ts                 # SeoData, SeoFormData
  ├── validations.ts           # seoSchema (Zod) + seoFormSchema
  ├── actions.ts               # updateSeoMeta(page, data), getSeoMeta(page), listAllSeo()
  ├── utils.ts                 # resolveSeo(page, moduleDefault): Metadata
  ├── data/
  │   ├── queries.ts           # getSeoByPage, getAllSeo
  │   ├── mutations.ts         # upsertSeoMeta
  │   └── defaults.ts          # siteDefaultSeo (brand-level fallback)
  ├── components/
  │   ├── SeoTabPanel.tsx      # Reusable admin SEO tab — drop into any page editor
  │   ├── SeoListTable.tsx     # For /admin/dashboard/seo overview page
  │   └── index.ts
  └── index.ts                 # Barrel export
```

Key pieces:

- **`resolveSeo(page, moduleDefault)`** — merges: DB row → module default → site default → returns Next.js `Metadata`.
- **`<SeoTabPanel page="home" />`** — self-contained form (fetches, edits, saves SEO for one page). Drop into any admin editor as the final tab.
- **`siteDefaultSeo`** — brand-level fallback with Jivo Wellness tagline, logo, default OG image at `/og/default.jpg`.

### 1.3 Lazy-loading primitive — `<LazyOnView>`

Create `src/components/common/lazy-on-view.tsx` (see `prompt1.md §24`) — Intersection Observer wrapper that only renders children when scrolled into view. `rootMargin` configurable (default 200px — pre-loads slightly before entering viewport for smooth UX).

### 1.4 Section skeleton — `<SectionSkeleton>`

Create `src/components/common/section-skeleton.tsx` — generic skeleton shown as the `loading` prop in `dynamic()`. Responsive, matches public section height norms (~400px).

### 1.5 API — SEO CRUD route

- `src/app/api/admin/seo/[page]/route.ts` — GET (single) / PUT (upsert) — admin-only.
- `src/app/api/admin/seo/route.ts` — GET (list all) / POST (create) — admin-only.

### 1.6 Site-default OG image

Add `public/og/default.jpg` placeholder (1200x630). Admin can override per-page later via UploadThing.

---

## Phase 2 — Refactor Home into per-page folder structure

### 2.1 New folder layout

```
src/app/(public)/
  ├── page.tsx                 # 2-line re-export from ./home/page-content
  ├── loading.tsx              # existing
  ├── error.tsx                # existing
  ├── layout.tsx               # existing
  └── home/                    # NEW — home's own folder
      ├── page-content.tsx     # Moved logic from (public)/page.tsx
      └── loading.tsx          # Home-specific skeleton (hero placeholder + section stubs)
```

### 2.2 `page-content.tsx` template

```tsx
// src/app/(public)/home/page-content.tsx
import { getHomePageData } from "@/modules/home/data/queries";
import { HomePageContent } from "@/modules/home";
import { resolveSeo } from "@/modules/seo";
import { defaultSeo } from "@/modules/home/data/defaults";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return resolveSeo("home", defaultSeo);
}

export default async function HomePage() {
  const data = await getHomePageData();
  return <HomePageContent data={JSON.parse(JSON.stringify(data))} />;
}
```

### 2.3 Root `(public)/page.tsx` shrinks to a re-export

```tsx
// src/app/(public)/page.tsx
export { default } from "./home/page-content";
export { generateMetadata } from "./home/page-content";
```

### 2.4 Add `src/modules/home/data/defaults.ts`

Export strong `defaultSeo` for home (brand-level title + description + keywords covering "cold press oil", "canola oil", "jivo wellness", "healthy oils india", etc.) + `defaultHomeContent` that seeds fresh installs.

### 2.5 Convert `src/modules/home/components/home-main.tsx` to lazy pattern

- Keep `hero-section.tsx` eager import (ATF).
- Wrap every other section (`vision-mission`, `products-foundation`, `why-jivo`, `categories`, etc.) in `dynamic()` + `<LazyOnView>`.
- Provide `<SectionSkeleton />` as the dynamic loading fallback.

---

## Phase 3 — Admin SEO integration

### 3.1 Home admin page — add SEO tab

`src/app/admin/(dashboard)/home/page.tsx`:

- Append `"SEO"` as the last tab in the tabs list.
- Render `<SeoTabPanel page="home" />` when SEO tab is active.
- SEO tab uses its own Save button (the page's main Save button stays wired to content tabs).

### 3.2 Global SEO Manager — `/admin/dashboard/seo/page.tsx`

Table view of every page in `SeoMeta`:
- Columns: Page, Meta Title (truncated), Robots, Last Updated, Actions
- Row click → opens `<SeoTabPanel page={row.page} />` in a side drawer or inline expander
- "Seed defaults" button: runs `upsertSeoMeta` with `siteDefaultSeo` for any missing page in the known-page list

### 3.3 Sidebar

Confirm `SEO` menu item already exists (`prompt1.md` sidebar list line 202). No change needed.

---

## Phase 4 — Apply to every existing / future page

For every public page in the `All Pages to Build` table (`prompt1.md` §716–740):

1. Add row to `SeoMeta` seed data with strong defaults
2. Page file calls `resolveSeo("{page}", defaultSeo)` in `generateMetadata`
3. Module's `data/defaults.ts` exports `defaultSeo`
4. Admin editor appends `<SeoTabPanel />` as final tab
5. `main.tsx` uses `next/dynamic` + `<LazyOnView>` for below-the-fold sections

**Excluded** (no SEO entry, per `prompt1.md` §23 exclusion list):
- `navbar`, `footer` — shared chrome
- `/admin/**` — `noindex,nofollow` via admin layout
- `/api/**` — no UI
- `/login`, `/signup`, `/admin/login`, `/cart`, `/checkout`, `/orders`, `/order-success/*` — all `noindex`

---

## Phase 5 — Docs

Create / update:

- `docs/seo.md` — SEO module API documentation, JSON shapes, Postman examples, how to add SEO for a new page
- `docs/home.md` — update API section to include SEO endpoints
- `docs/prompt1.md` — **already updated** with §23/§24/§25/§26

---

## Delivery order (when you say "go")

| # | Task | Files touched |
|---|------|---------------|
| 1 | Prisma — update `SeoMeta` + push | `prisma/schema.prisma` |
| 2 | Shared SEO module | `src/modules/seo/**` |
| 3 | Lazy primitives | `src/components/common/lazy-on-view.tsx`, `section-skeleton.tsx` |
| 4 | SEO API routes | `src/app/api/admin/seo/**` |
| 5 | Home folder refactor | `src/app/(public)/home/**`, `src/app/(public)/page.tsx` |
| 6 | Home defaults + lazy main | `src/modules/home/data/defaults.ts`, `src/modules/home/components/home-main.tsx` |
| 7 | Home admin SEO tab | `src/app/admin/(dashboard)/home/page.tsx` |
| 8 | Global SEO Manager page | `src/app/admin/(dashboard)/seo/page.tsx` |
| 9 | Seed defaults for every listed page | `prisma/seed.ts` |
| 10 | Docs | `docs/seo.md`, `docs/home.md` |

---

## Open questions / assumptions

**Assumed (proceeding unless you say otherwise):**

1. `SeoMeta` can be extended non-destructively (no production DB to worry about) — `prisma db push` is fine.
2. UploadThing is already configured for OG image uploads.
3. Brand-level fallback OG image will be placed at `public/og/default.jpg` (1200x630) — placeholder until you provide a real one.
4. Per-product / per-blog SEO stays inline on their existing models (`Product.metaTitle`, `BlogPost.metaTitle`) — `SeoMeta` is for "static" CMS pages only. This matches what's already in the schema.
5. `robots.ts` and `sitemap.ts` (already present) will read from `SeoMeta` to exclude `noindex` pages from the sitemap.

---

**Ready.** Say **"go"** (or "go phase 1", etc.) to start building.
