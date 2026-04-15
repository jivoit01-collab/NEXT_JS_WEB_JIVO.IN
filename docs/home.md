# Home Page — Documentation

> **Routes**
> Public: `/`
> Admin:  `/admin/home`
> API:    `/api/home`, `/api/home/:id`

---

## 1. Overview

The home page is **fully CMS-managed**. Every visual section is stored as a row in the `PageContent` table (`page = "home"`) with a section-specific JSON `content` column. The admin dashboard provides a tabbed editor that writes to this table; the public page reads from it.

If a section row is missing or `isActive = false`, the public page falls back to the default content defined in [`src/modules/home/data/home-content.ts`](../src/modules/home/data/home-content.ts).

### Visual Sections (in display order)

| # | Section key           | Component                         | Purpose                                                    |
|---|-----------------------|-----------------------------------|------------------------------------------------------------|
| 1 | `hero`                | `HeroSection`                     | Full-screen intro with logo, headline, tagline, CTA        |
| 2 | `categories`          | `ProductCategories`               | "MADE FOR EVERYDAY LOVE" — 4 category cards                |
| 3 | `vision_mission`      | `VisionMission`                   | "LET NATURE RECLAIM YOU" two-column Vision & Mission block |
| 4 | `products_foundation` | `ProductsFoundation`              | Dark section with product image + two text blocks          |
| 5 | `why_jivo`            | `WhyJivo`                         | "SO, WHY JIVO EXACTLY?" with 6 value pillars               |

---

## 2. Database Model

File: [`prisma/schema/home.prisma`](../prisma/schema/home.prisma)

```prisma
model PageContent {
  id        String   @id @default(cuid())
  page      String   // "home", "about", "privacy-policy", etc.
  section   String   // "hero", "categories", "vision_mission", etc.
  title     String?
  content   Json     // Flexible shape per section (see Section 4)
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([page, section])
  @@index([page, sortOrder])
}
```

- A section is **uniquely identified by the (page, section) tuple** — e.g. `("home", "hero")`.
- `content` is a free-form JSON blob validated at the application layer with Zod (see [`validations.ts`](../src/modules/home/validations.ts)).
- `sortOrder` controls display order on the public page.
- `isActive = false` hides the section from the public page.

---

## 3. File Layout

```
src/modules/home/
├── actions.ts                  # Server actions (create, read, update, upsert, delete)
├── validations.ts              # Zod schemas per section
├── types.ts                    # TypeScript interfaces per section
├── index.ts                    # Barrel export
├── data/
│   └── home-content.ts         # Default content (fallbacks + seed source)
└── components/
    ├── home-main.tsx           # Orchestrator — renders all sections in order
    ├── hero-section.tsx
    ├── product-categories.tsx
    ├── vision-mission.tsx
    ├── products-foundation.tsx
    └── why-jivo.tsx

src/app/(public)/page.tsx        # Public home page (/)
src/app/admin/(dashboard)/home/page.tsx   # Admin editor (/admin/home)
src/app/api/home/route.ts        # GET (list) + POST (create)
src/app/api/home/[id]/route.ts   # GET + PUT + DELETE (by section id)

prisma/schema/home.prisma        # PageContent model
prisma/seed.ts                   # Seeds all 5 sections on `npm run db:seed`
```

---

## 4. Section Content Schemas

All section shapes are defined in [`types.ts`](../src/modules/home/types.ts) and validated by Zod in [`validations.ts`](../src/modules/home/validations.ts).

### 4.1 `hero`

```typescript
interface HeroContent {
  logo: string;              // /images/Jivo Logo.png
  backgroundImage: string;   // Full-screen BG image URL
  headline: string;          // "LET NATURE RECLAIM YOU"
  subtitle: string;          // Tagline under the headline
  ctaText: string;           // "Explore Products"
  ctaHref: string;           // "/products"
}
```

### 4.2 `categories`

```typescript
interface CategoriesContent {
  heading: string;           // "MADE FOR EVERYDAY LOVE"
  items: {
    name: string;            // "Cooking Oil"
    image: string;           // Category image URL
    href: string;            // "/products?category=cooking-oil"
    bgColor: string;         // Tailwind class: "bg-jivo-green" | "bg-jivo-sage" | "bg-jivo-blue" | "bg-jivo-maroon"
  }[];
}
```

### 4.3 `vision_mission`

```typescript
interface VisionMissionContent {
  backgroundImage: string;
  heading: string;           // "LET NATURE RECLAIM YOU"
  subtitle: string;          // Short brand line, max 500 chars
  intro?: string;            // Optional longer paragraph between subtitle and columns, max 2000 chars
  vision: string;            // Multi-line vision paragraph
  mission: string;           // Multi-line mission paragraph
}
```

**Layout order (public page):**
1. Heading
2. Subtitle (italic, small)
3. Intro paragraph (optional — hidden if empty)
4. Vision + Mission two-column grid

### 4.4 `products_foundation`

```typescript
interface ProductsFoundationContent {
  productImage: string;
  section1: { heading: string; paragraphs: string[] };  // "Our Products Are Our Service"
  section2: { heading: string; paragraphs: string[] };  // "Our Foundation is Built on Values..."
}
```

### 4.5 `why_jivo`

```typescript
interface WhyJivoContent {
  heading: string;           // "SO, WHY JIVO EXACTLY?"
  subheading: string;        // "Because our motive is different."
  leftText: string;          // Italic intro paragraph
  rightParagraphs: string[]; // Right-column paragraphs
  valuePillars: {
    icon: string;            // One of: Users | Scale | Heart | HandHeart | Lightbulb | ShieldCheck
    title: string;           // "People", "Truth", etc.
    description: string;
  }[];
}
```

---

## 5. API Reference

All routes live under `src/app/api/home/`. JSON response shape is consistent:

```typescript
{ success: true,  data: T }
{ success: false, error: string, fieldErrors?: Record<string, string[]> }
```

### 5.1 `GET /api/home`

Returns all home sections.

| Param             | Behavior                                                                 |
|-------------------|--------------------------------------------------------------------------|
| *(no query)*      | **Public** — returns only active sections, ordered by `sortOrder` asc.   |
| `?all=true` (admin)| Returns every section (active + inactive). Requires auth.               |

**Example request**
```http
GET /api/home
```

**Example response**
```json
{
  "success": true,
  "data": [
    {
      "id": "cm1abc...",
      "page": "home",
      "section": "hero",
      "title": "Hero",
      "content": {
        "logo": "/images/Jivo Logo.png",
        "backgroundImage": "/images/Eon7do.jpg",
        "headline": "LET NATURE RECLAIM YOU",
        "subtitle": "The Heartbeat of Jivo — ...",
        "ctaText": "Explore Products",
        "ctaHref": "/products"
      },
      "sortOrder": 0,
      "isActive": true,
      "createdAt": "2026-04-15T...",
      "updatedAt": "2026-04-15T..."
    }
    /* …more sections… */
  ]
}
```

### 5.2 `POST /api/home`

**Auth required.** Creates a new section.

```http
POST /api/home
Content-Type: application/json
Cookie: authjs.session-token=<session>

{
  "section": "hero",
  "content": { /* matches the section schema in §4 */ },
  "sortOrder": 0,
  "isActive": true
}
```

- Returns `409` if a section with the same `section` key already exists.
- Returns `400` with `fieldErrors` on validation failure.

### 5.3 `GET /api/home/:id`

**Auth required.** Returns a single section by `id`.

### 5.4 `PUT /api/home/:id`

**Auth required.** Updates a section. All fields optional; only provided keys are touched.

```http
PUT /api/home/cm1abc...
Content-Type: application/json

{
  "content": { /* partial or full section content */ },
  "sortOrder": 2,
  "isActive": false
}
```

### 5.5 `DELETE /api/home/:id`

**Auth required.** Deletes a section. The public page will fall back to default content for that section.

---

## 6. Admin Dashboard

**URL:** `/admin/home`

### Workflow
1. Log in at `/admin/login` with the seeded admin credentials (`.env.local` → `ADMIN_EMAIL` / `ADMIN_PASSWORD`, or the admin DB user).
2. Sidebar → **Home Page**.
3. Table lists every section (active + inactive) with order, status toggle, last-updated, edit/delete.
4. Click **Add missing sections** chips at the top to create any section that doesn't exist yet (e.g. `hero`, `categories`, etc.).
5. **Edit** opens a dialog with a section-specific form (images, inputs, repeatable lists for category items / pillars / paragraphs).
6. **Image fields** use `<ImageUpload>` which hits `POST /api/upload` — Sharp resizes to 1200×1200, converts to WebP, writes to `public/images/<timestamp>-<slug>.webp`, and returns a public URL.
7. Status badge is clickable — one-tap active/inactive toggle.

### Default content templates
When creating a new section, the admin form pre-fills sensible defaults:
- `hero` → blank logo/BG, CTA: "Explore Products" → `/products`
- `categories` → "MADE FOR EVERYDAY LOVE" + one starter item with `bg-jivo-green`
- `vision_mission` → blank heading + blank vision/mission
- `products_foundation` → blank image + two empty section groups
- `why_jivo` → blank heading + one starter `Heart` pillar

---

## 7. Image Upload

- **Endpoint:** `POST /api/upload` — multipart/form-data, field name `file`.
- **Auth:** required.
- **Limits:** 5 MB max, types: `image/jpeg`, `image/png`, `image/webp`.
- **Processing:** Sharp resize-to-fit 1200×1200 (no enlargement) → WebP quality 80.
- **Output path:** `/images/<timestamp>-<slug>.webp`
- **Delete:** `DELETE /api/upload` with `{ "url": "/images/..." }`.

Components that consume it:
- `<ImageUpload value onChange onRemove />` — single file, with drag-and-drop.
- `<MultiImageUpload value onChange maxImages />` — multi-file.

Both live in [`src/components/shared/image-upload.tsx`](../src/components/shared/image-upload.tsx).

---

## 8. Theme & Colors

Defined as CSS custom properties in [`src/app/globals.css`](../src/app/globals.css), exposed as Tailwind utilities:

| Utility class      | Purpose                                | Approx color |
|--------------------|----------------------------------------|--------------|
| `bg-jivo-olive`    | Categories section background          | Soft beige/olive |
| `bg-jivo-brown`    | "Why Jivo" dark section background     | Deep brown    |
| `text-jivo-cream`  | Light text on dark sections            | Warm cream    |
| `bg-jivo-green`    | Cooking Oil category card              | Deep green    |
| `bg-jivo-sage`     | Wheatgrass Juice card                  | Sage green    |
| `bg-jivo-blue`     | Water card                             | Sky blue      |
| `bg-jivo-maroon`   | Super Foods card                       | Burgundy      |
| `text-gold` / `bg-gold` | Accent (pillars, "Vision/Mission" labels) | Warm gold |

The palette is **tuned to match the brand screenshots** (olive hero, cream categories strip, dark-brown "Why Jivo" block).

---

## 9. Postman Testing

### 9.1 Fetch public home data (no auth)
```
GET http://localhost:3000/api/home
```

### 9.2 Log in as admin (store cookie for next requests)
```
POST http://localhost:3000/api/auth/callback/credentials
Content-Type: application/x-www-form-urlencoded

email=admin@jivo.in&password=admin123&csrfToken=<from /api/auth/csrf>
```

Simpler: log in via browser at `/admin/login`, copy the `authjs.session-token` cookie, reuse it in Postman.

### 9.3 Update the hero section
First get the section `id`:
```
GET http://localhost:3000/api/home?all=true
```
Then:
```
PUT http://localhost:3000/api/home/<id>
Content-Type: application/json
Cookie: authjs.session-token=<token>

{
  "content": {
    "logo": "/images/Jivo Logo.png",
    "backgroundImage": "/images/Eon7do.jpg",
    "headline": "LET NATURE RECLAIM YOU",
    "subtitle": "Updated tagline.",
    "ctaText": "Shop Now",
    "ctaHref": "/products"
  }
}
```

### 9.4 Create a new section (e.g. if you deleted one)
```
POST http://localhost:3000/api/home
Content-Type: application/json
Cookie: authjs.session-token=<token>

{
  "section": "hero",
  "content": { "logo": "...", "backgroundImage": "...", "headline": "...",
               "subtitle": "...", "ctaText": "Explore Products", "ctaHref": "/products" },
  "sortOrder": 0,
  "isActive": true
}
```

### 9.5 Toggle inactive
```
PUT http://localhost:3000/api/home/<id>
Content-Type: application/json

{ "isActive": false }
```

### 9.6 Delete a section
```
DELETE http://localhost:3000/api/home/<id>
```

---

## 10. Seeding

Run:
```bash
npm run db:seed
```

This seeds:
- An admin `User` (`admin@jivo.in`, password from `.env.local`)
- All 5 home sections with production-ready default content

Safe to re-run — uses `upsert`.

---

## 11. Extending / Next Steps

- **Add a new section** — edit [`types.ts`](../src/modules/home/types.ts), [`validations.ts`](../src/modules/home/validations.ts), create a new `*-section.tsx` component, add it to `home-main.tsx`, and register a default template + editor in [`src/app/admin/(dashboard)/home/page.tsx`](../src/app/admin/(dashboard)/home/page.tsx).
- **Move to dynamic navbar** — currently the top navbar uses hardcoded links in [`src/components/layout/navbar.tsx`](../src/components/layout/navbar.tsx). When you build the navbar admin module, swap it back to DB-driven.
- **Multi-page CMS** — the same `PageContent` model powers `about`, `privacy-policy`, etc. Just change the `page` filter in your module actions.
