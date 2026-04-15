# SEO Module — API Documentation

> Per-page SEO, social-share metadata, and JSON-LD structured data for every public page on Jivo Wellness. Admin-editable from `/admin/seo` and from the SEO tab on each page editor (e.g. `/admin/home`). Read at request time by `generateMetadata()` via the `resolveSeo()` helper.

---

## Architecture

```
DB:          SeoMeta (one row per page, keyed by `page` slug)
                           ↑
                           | upsert
Server:      src/modules/seo/actions.ts (updateSeoMetaAction, ...)
                           ↑
                           | fetch
API:         /api/admin/seo/[page]   — GET / PUT / DELETE
             /api/admin/seo          — GET (list)
                           ↑
                           | fetch
UI:          <SeoTabPanel page="…" /> (admin-only)
             <SeoListTable />          (admin overview)

generateMetadata():
   resolveSeo(page, moduleDefault) → DB row → moduleDefault → siteDefaultSeo
```

### Fallback chain

When a request comes in for any public page, `resolveSeo("home", defaultSeo)` does:

1. **DB row** (`SeoMeta` for the page) — wins for any field it provides
2. **Module default** (e.g. `src/modules/home/data/defaults.ts`)
3. **Site default** (`src/modules/seo/data/defaults.ts → siteDefaultSeo`)

A field can never be empty: every page always has strong baseline SEO.

---

## Prisma Model

```prisma
// prisma/schema/seo.prisma
model SeoMeta {
  id              String   @id @default(cuid())
  page            String   @unique // "home", "about", "products", "blog", ...
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

---

## Folder structure

```
src/modules/seo/
├── types.ts                        # SeoData, SeoFormInput, SeoDefaults, ...
├── validations.ts                  # seoFormSchema, seoSchema (Zod)
├── actions.ts                      # Server actions (admin-protected)
├── utils.ts                        # resolveSeo(), getStructuredData()
├── data/
│   ├── queries.ts                  # getSeoByPage, getAllSeo
│   ├── mutations.ts                # upsertSeoMeta, deleteSeoMeta
│   └── defaults.ts                 # siteDefaultSeo, definePageSeo()
├── components/
│   ├── SeoTabPanel.tsx             # Reusable admin SEO form
│   ├── SeoListTable.tsx            # Admin SEO overview table + drawer
│   └── index.ts
└── index.ts                        # Barrel export

src/components/shared/
├── lazy-on-view.tsx                # IntersectionObserver wrapper
└── section-skeleton.tsx            # Skeleton used as dynamic loading fallback
```

---

## Public API (admin-only — auth required)

All routes return `{ success: boolean, data?: …, error?: string }`.

### `GET /api/admin/seo`

List every SEO entry.

**Auth:** ADMIN or SUPER_ADMIN
**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "ckxyz…",
      "page": "home",
      "metaTitle": "Jivo Wellness — India's Largest Cold Press Canola Oil Seller",
      "metaDescription": "Premium cold press canola oil…",
      "keywords": ["jivo wellness", "cold press canola oil", …],
      "ogTitle": "Jivo Wellness — Pure, Honest, Wellness-First Products",
      "ogDescription": "Cold press oils…",
      "ogImage": "/images/common/og-default.png",
      "twitterCard": "summary_large_image",
      "canonicalUrl": "https://jivo.in",
      "structuredData": { "@type": "WebSite", "name": "Jivo Wellness", … },
      "robots": "index,follow",
      "createdAt": "2026-04-15T…Z",
      "updatedAt": "2026-04-15T…Z"
    }
  ]
}
```

### `GET /api/admin/seo/[page]`

Fetch SEO for a single page. Returns `data: null` if no entry exists yet (admin can then create one via `PUT`).

**Path param:** `page` — slug like `home`, `about`, `products`, `blog`, `contact`, `careers`.

### `PUT /api/admin/seo/[page]`

Upsert SEO for a page.

**Body** (Zod `seoFormSchema`):

```json
{
  "metaTitle": "About Jivo Wellness | Cold Press Canola Oil Pioneers",
  "metaDescription": "Learn about Jivo Wellness — premium cold press oils & superfoods crafted with truth, devotion, and sewa.",
  "keywords": ["about jivo", "jivo wellness story"],
  "ogTitle": "About Jivo Wellness",
  "ogDescription": "Premium cold press oils & wellness products from India.",
  "ogImage": "/images/about/og.jpg",
  "twitterCard": "summary_large_image",
  "canonicalUrl": "https://jivo.in/about",
  "structuredData": {
    "@type": "Organization",
    "name": "Jivo Wellness",
    "url": "https://jivo.in"
  },
  "robots": "index,follow"
}
```

**Validation rules:**

- `metaTitle` required, ≤ 70 chars
- `metaDescription` ≤ 180 chars
- `keywords` array, ≤ 20 items, each ≤ 60 chars
- `ogImage` must be an absolute URL or a path starting with `/`
- `canonicalUrl` must be a valid URL
- `twitterCard` ∈ `summary` / `summary_large_image`
- `robots` ∈ `index,follow` / `noindex,follow` / `index,nofollow` / `noindex,nofollow`

### `DELETE /api/admin/seo/[page]`

Remove the row. The page reverts to its module default, then site default, on next request.

---

## Using SEO in a public page

Every page's `page.tsx` (or its `page-content.tsx`) must:

```tsx
// src/app/(public)/about/page.tsx
import { resolveSeo, getStructuredData } from '@/modules/seo';
import { JsonLd } from '@/components/shared';
import { defaultSeo } from '@/modules/about/data/defaults';

export async function generateMetadata() {
  return resolveSeo('about', defaultSeo);
}

export default async function AboutPage() {
  const structured = await getStructuredData('about', defaultSeo);
  return (
    <>
      {structured && <JsonLd data={structured} />}
      {/* …rest of page… */}
    </>
  );
}
```

And every module ships a `data/defaults.ts`:

```ts
// src/modules/about/data/defaults.ts
import { definePageSeo } from '@/modules/seo';

export const defaultSeo = definePageSeo({
  metaTitle: 'About Jivo Wellness | Our Mission of Service',
  metaDescription: 'Learn about Jivo Wellness…',
  keywords: ['about jivo', 'jivo story'],
  ogImage: '/images/about/og.jpg',
  canonicalUrl: 'https://jivo.in/about',
  robots: 'index,follow',
  structuredData: { '@type': 'AboutPage', name: 'About Jivo Wellness' },
});
```

---

## Adding the SEO tab to a page editor

Every CMS page editor (e.g. `/admin/home`, `/admin/about`) ends with an SEO tab. Drop in `<SeoTabPanel />`:

```tsx
import { SeoTabPanel } from '@/modules/seo';
import { defaultSeo as homeDefaultSeo } from '@/modules/home';

<Tabs defaultValue="sections">
  <TabsList>
    <TabsTrigger value="sections">Sections</TabsTrigger>
    <TabsTrigger value="seo">SEO</TabsTrigger>
  </TabsList>

  <TabsContent value="sections">{/* existing editor */}</TabsContent>

  <TabsContent value="seo">
    <SeoTabPanel
      page="home"
      pageLabel="Home Page"
      moduleDefault={homeDefaultSeo}
    />
  </TabsContent>
</Tabs>
```

The panel handles its own fetch/save — no extra wiring needed.

---

## Pages excluded from SEO

Do **not** create SEO entries for:

- `navbar`, `footer` — shared chrome, not indexed pages
- `/admin/**` — private (set `robots: "noindex,nofollow"` in admin layout)
- `/api/**` — no UI
- `/login`, `/signup`, `/admin/login` — `noindex` by default
- `/cart`, `/checkout`, `/order-success/[id]`, `/orders` — user-only, `noindex`

For dynamic per-item SEO (Product detail, Blog post), keep the SEO fields **inline on the model itself** (`Product.metaTitle`, `BlogPost.metaTitle`) rather than `SeoMeta`. Use `SeoMeta` for static CMS pages only.

---

## Postman / curl examples

Set an `Cookie: next-auth.session-token=…` header from a logged-in admin browser session.

```bash
# List all
curl -s http://localhost:3000/api/admin/seo | jq

# Get one
curl -s http://localhost:3000/api/admin/seo/home | jq

# Upsert
curl -s -X PUT http://localhost:3000/api/admin/seo/home \
  -H 'Content-Type: application/json' \
  -d '{
    "metaTitle": "Jivo Wellness — Cold Press Canola Oil",
    "metaDescription": "Premium cold press canola oil.",
    "keywords": ["jivo", "canola oil"],
    "twitterCard": "summary_large_image",
    "robots": "index,follow"
  }'

# Delete (reverts to defaults)
curl -s -X DELETE http://localhost:3000/api/admin/seo/home
```

---

## Performance notes

The SEO read in `generateMetadata()` runs at request time (alongside the page's own data fetch). Both are server components so the round-trip is one DB query per page render. Pair with `getStructuredData()` if you also want the JSON-LD blob in the page body — that uses an internal query cache so calling both in the same request only hits the DB once.

For lazy-loading sections see `docs/prompt1.md §24`. For per-page folder structure see `docs/prompt1.md §25`.
