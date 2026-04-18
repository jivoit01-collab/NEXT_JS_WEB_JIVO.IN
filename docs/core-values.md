# Core Values — Page Documentation

## 1. 📌 Page Overview

| Field | Value |
|-------|-------|
| Page | Core Values |
| Public route | `/our-essence/core-values` |
| Admin route | `/admin/our-essence-core-values` |
| SEO page key | `our-essence-core-values` |
| Prisma model | `OurEssenceCoreValues` |
| Module | `src/modules/our-essence/core-values/` |

**Sections (stored as rows in `OurEssenceCoreValues`, keyed by `section`):**
- `hero` — Essence in Action
- `foundation` — Truth as Foundation (repeatable value blocks)
- `principles` — Sewa / Intelligence / Integrity (repeatable value blocks)

---

## 2. 🧠 UI Structure

### Hero Section (`hero`)
- Full-bleed background image (`min-h-screen` on lg)
- Content aligned **bottom-left** — sits over a `from-black/70 → transparent` left-to-right gradient for legibility
- **Heading** (big): `ESSENCE IN ACTION` — uppercase, `font-jost-bold`, responsive `3xl → 6xl`
- **Subtitle** (white/90): one-line statement about values transforming into action
- **Paragraph** (white/80): longer description — "These principles are not ideas…"
- No CTAs
- Image loaded with `priority` (LCP candidate)

### Foundation Section (`foundation`)
- Background image (or dark fallback gradient `from-[#2d1810]`)
- `bg-black/55` overlay
- Centered heading **TRUTH AS FOUNDATION** — `text-2xl sm:text-3xl md:text-4xl lg:text-5xl`, uppercase, `tracking-[0.12em]`
- 2-column grid (`md:grid-cols-2`, gap `16–24`)
- Each block: small uppercase label + paragraph body
- **Repeatable** — admin can add/remove blocks (min 2)

### Principles Section (`principles`)
- Background image (or sunset gradient fallback `from-[#f8a880] → [#8b4789]`)
- `bg-black/35` light overlay (keeps sky visible)
- 2-column grid with N value blocks (min 3)
- First 3 render as: Sewa top-left, Intelligence top-right, Integrity bottom-left (fourth cell empty by design)
- **Repeatable** — admin can add/remove blocks (min 3)

### Composition (`core-values-main.tsx`)
- Hero eager (SSR)
- Foundation + Principles loaded via `next/dynamic` with `<SectionSkeleton>` fallbacks

---

## 3. 🔌 API Documentation

### Public API

```
GET /api/our-essence/core-values
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hero": {
      "heading": "ESSENCE IN ACTION",
      "subtitle": "Where values transform into everyday actions that serve humanity.",
      "paragraph": "These principles are not ideas—they are lived, practiced, and expressed in every action we take.",
      "backgroundImage": "1713456789-hero.png"
    },
    "foundation": {
      "heading": "TRUTH AS FOUNDATION",
      "backgroundImage": "1713456789-hands.png",
      "blocks": [
        { "label": "TRUTH", "description": "Truth is the recognition of…" },
        { "label": "DEVOTION", "description": "Work is approached as an expression of Devotion…" }
      ]
    },
    "principles": {
      "backgroundImage": "1713456789-sky.png",
      "blocks": [
        { "label": "SEWA (SELFLESS SERVICE)", "description": "All work is an absolute offering…" },
        { "label": "INTELLIGENCE", "description": "Intelligence is Truth manifest…" },
        { "label": "INTEGRITY", "description": "Integrity is defined as an absolute…" }
      ]
    }
  }
}
```

### Admin API

Requires an authenticated ADMIN / SUPER_ADMIN session cookie.

#### `GET /api/admin/our-essence/core-values`
Returns all sections (active + inactive). Same shape as public GET.

Error responses:
- `401` `{ "success": false, "error": "Unauthorized" }`
- `500` `{ "success": false, "error": "Failed to load sections" }`

#### `POST /api/admin/our-essence/core-values`
Upserts a single section.

**Request body:**
```json
{
  "section": "hero",
  "content": {
    "heading": "ESSENCE IN ACTION",
    "subtitle": "...",
    "paragraph": "...",
    "backgroundImage": "1713456789-hero.png"
  }
}
```

**Response (success):**
```json
{ "success": true, "data": { "id": "...", "section": "hero", "content": { ... }, "sortOrder": 0, "isActive": true, "createdAt": "...", "updatedAt": "..." } }
```

**Error responses:**
- `400` `{ "success": false, "error": "Missing section or content" }`
- `401` `{ "success": false, "error": "Unauthorized" }`
- `500` `{ "success": false, "error": "Failed to save section" }`

#### SEO endpoint (shared)
```
GET  /api/admin/seo/our-essence-core-values
POST /api/admin/seo/our-essence-core-values
```
Handles the `SeoMeta` row with `page = "our-essence-core-values"`. Owned by the shared `@/modules/seo` module.

---

## 4. 🔄 Workflow

```
Admin visits /admin/our-essence-core-values
  → Tab switcher: Hero | Foundation | Principles | SEO
  → Edits form fields (uploads images via ImageUpload / UploadThing)
  → Clicks "Save Changes"
      ↓
  Client calls upsertCoreValuesSectionAction(section, content)  [server action]
      ↓
  Action → requireAdmin() guard → Zod validation → prisma.ourEssenceCoreValues.upsert()
      ↓
  revalidatePath('/our-essence/core-values')
  revalidatePath('/admin/our-essence-core-values')
      ↓
  Next visitor of /our-essence/core-values sees the new content
```

For the SEO tab: `<SeoTabPanel page="our-essence-core-values" />` talks to `/api/admin/seo/[page]`. A separate row lives in `SeoMeta`.

---

## 5. 🧾 Data Structure

### Prisma model (`prisma/schema/our-essence-core-values.prisma`)
```prisma
model OurEssenceCoreValues {
  id        String   @id @default(cuid())
  section   String   @unique
  title     String?
  content   Json
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([sortOrder])
}
```

### TypeScript types (`src/modules/our-essence/core-values/types.ts`)

**Hero**
```ts
interface CoreValuesHeroContent {
  heading: string;
  subtitle: string;
  paragraph: string;
  backgroundImage: string;  // stored filename
}
```

**Foundation**
```ts
interface CoreValueBlock {
  label: string;
  description: string;
}

interface CoreValuesFoundationContent {
  heading: string;
  backgroundImage: string;
  blocks: CoreValueBlock[];  // min 2
}
```

**Principles**
```ts
interface CoreValuesPrinciplesContent {
  backgroundImage: string;
  blocks: CoreValueBlock[];  // min 3
}
```

### Zod validation
All three shapes are validated server-side in `upsertCoreValuesSectionAction` via `coreValuesSectionSchemas[section]`. Invalid payloads return `fieldErrors`.

---

## 6. 🖼 Image Handling

Follows the project-wide image rule:
- **Upload**: `<ImageUpload>` component (wraps UploadThing) writes the file to `/uploads/images/` with a unique `${Date.now()}-${originalName}` name
- **Database**: only the **filename** is stored in `content.backgroundImage` — never a full path
- **Serving**: `<SafeImage>` (public page) resolves the filename to `/api/uploads/{filename}` under the hood; falls back to a placeholder if the file is missing
- **Delete**: deleting the row / clearing the field also removes the file via the uploads API

Do NOT store images in `/public/images` or hardcode paths.

---

## 7. 🔍 SEO Documentation

### Storage
- Row in `SeoMeta` with `page = "our-essence-core-values"`
- Seeded by `prisma/seed.ts` from `defaultSeo` in `src/modules/our-essence/core-values/data/defaults.ts`

### Fallback chain (resolved at request time by `resolveSeo()`)
1. `SeoMeta` row (DB)
2. Module `defaultSeo` (in `data/defaults.ts`)
3. Site-wide `siteDefaultSeo` (in `src/modules/seo/data/defaults.ts`)

### Fields
| Field | Default |
|-------|---------|
| metaTitle | `Core Values \| Our Essence \| Jivo Wellness` |
| metaDescription | `Truth, Devotion, Sewa, Intelligence, Integrity — the five principles that shape every action at Jivo Wellness.` |
| keywords | `['jivo core values','jivo essence','truth devotion sewa','sewa selfless service','intelligence integrity','jivo wellness values','essence in action','truth as foundation', …]` |
| ogTitle | `Our Core Values — Essence in Action` |
| ogDescription | `Truth, Devotion, Sewa, Intelligence, Integrity — the principles behind every action at Jivo.` |
| ogImage | `og-default.png` |
| twitterCard | `summary_large_image` |
| canonicalUrl | `${SITE_URL}/our-essence/core-values` |
| robots | `index,follow` |
| structuredData | JSON-LD `AboutPage` — name + url + description |

### Usage in `page.tsx`
```tsx
export async function generateMetadata() {
  return resolveSeo('our-essence-core-values', defaultSeo);
}

const [sections, structuredData] = await Promise.all([
  getCoreValuesSections(),
  getStructuredData('our-essence-core-values', defaultSeo),
]);
// <JsonLd data={structuredData} /> rendered above <CoreValuesMain />
```

---

## 8. 🧪 Postman Testing

### 1. Public GET
```
GET http://localhost:3000/api/our-essence/core-values
```
Expect: `{ success: true, data: { hero, foundation, principles } }`

### 2. Login as admin
```
POST http://localhost:3000/api/auth/callback/credentials
Body (x-www-form-urlencoded):
  email=admin@jivo.in
  password=<ADMIN_PASSWORD>
```
Copy the `next-auth.session-token` cookie from the response.

### 3. Admin GET
```
GET http://localhost:3000/api/admin/our-essence/core-values
Cookie: next-auth.session-token=...
```

### 4. Update hero
```
POST http://localhost:3000/api/admin/our-essence/core-values
Cookie: next-auth.session-token=...
Content-Type: application/json

{
  "section": "hero",
  "content": {
    "heading": "ESSENCE IN ACTION",
    "subtitle": "Where values transform into everyday actions that serve humanity.",
    "paragraph": "These principles are not ideas—they are lived, practiced, and expressed in every action we take.",
    "backgroundImage": "1713456789-hero.png"
  }
}
```

### 5. Update foundation
```
POST http://localhost:3000/api/admin/our-essence/core-values
Body:
{
  "section": "foundation",
  "content": {
    "heading": "TRUTH AS FOUNDATION",
    "backgroundImage": "1713456789-hands.png",
    "blocks": [
      { "label": "TRUTH", "description": "..." },
      { "label": "DEVOTION", "description": "..." }
    ]
  }
}
```

### 6. Update principles
```
POST http://localhost:3000/api/admin/our-essence/core-values
Body:
{
  "section": "principles",
  "content": {
    "backgroundImage": "1713456789-sky.png",
    "blocks": [
      { "label": "SEWA (SELFLESS SERVICE)", "description": "..." },
      { "label": "INTELLIGENCE", "description": "..." },
      { "label": "INTEGRITY", "description": "..." }
    ]
  }
}
```

### 7. Update SEO
```
POST http://localhost:3000/api/admin/seo/our-essence-core-values
Cookie: next-auth.session-token=...
Content-Type: application/json

{
  "metaTitle": "Core Values | Our Essence | Jivo Wellness",
  "metaDescription": "...",
  "keywords": ["jivo core values", "essence in action"],
  "ogTitle": "...",
  "ogDescription": "...",
  "ogImage": "1713456789-og.png",
  "twitterCard": "summary_large_image",
  "canonicalUrl": "https://jivo.in/our-essence/core-values",
  "robots": "index,follow",
  "structuredData": { "@type": "AboutPage" }
}
```

---

## 9. 🔄 Update Log

### 2026-04-18
- Initial build — page, admin editor, API routes, SEO, sitemap entry, seed rows
- Prisma model `OurEssenceCoreValues` created and pushed
- Sections: `hero`, `foundation`, `principles`
- Sidebar entry added under "Our Essence" (+ SEO Manager children)
- Hub card added at `/admin/our-essence`
- Sitemap entry `/our-essence/core-values` added
- `definePageSeo` default registered — seed upserts `SeoMeta` row
