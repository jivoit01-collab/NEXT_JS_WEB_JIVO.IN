# Implementation Plan — `/our-essence/core-values` Page

> **Status:** Plan only. No code will be written until you say "go".
> **Scope:** New public page `/our-essence/core-values` + full admin CMS + API routes + SEO + docs, following every rule in `docs/prompt1.md`.

---

## 1. Page Overview

| Field | Value |
|-------|-------|
| Page | Core Values |
| Public route | `/our-essence/core-values` |
| Admin route | `/admin/our-essence-core-values` (sibling of existing `/admin/our-essence-the-story`) |
| Parent section | Our Essence |
| Navbar | already built — not touched |

### Sections (derived from the 3 screenshots)

| Key | Screenshot | Title | Layout |
|-----|-----------|-------|--------|
| `hero` | #1 | ESSENCE IN ACTION | Full-screen (100vh) background image, text left-aligned, vertically centered-bottom |
| `foundation` | #2 | TRUTH AS FOUNDATION | Centered white title + 2-column grid (Truth / Devotion) over hands background |
| `principles` | #3 | (no title) | 2-column grid with 3 pillars (Sewa, Intelligence, Integrity) over sunset-sky background |

---

## 2. UI Structure

### Hero Section (`hero`) — full screen
- Height: `min-h-screen` with background image covering full viewport
- Background: wheat-field sunset image
- Dark gradient overlay on left side only (`bg-gradient-to-r from-black/70 via-black/40 to-transparent`) for legibility
- Content block aligned **bottom-left** with generous padding (`px-6 sm:px-12 lg:px-20 pb-20 sm:pb-28`)
- Typography:
  - **Heading**: `ESSENCE IN ACTION` — `font-jost-bold`, `text-5xl md:text-6xl lg:text-7xl`, white, uppercase, tracking-tight
  - **Subtitle**: `text-base md:text-lg`, white/90, max-w-md, mt-4
  - **Paragraph**: separate `text-sm md:text-base`, white/80, max-w-md, mt-6
- No CTA buttons (pure value-statement page)
- `priority` on the image, `sizes="100vw"`

### Foundation Section (`foundation`)
- Height: `min-h-[80vh]` with background image of hands
- Dark overlay (`bg-black/55`) for legibility across entire image
- Centered heading **TRUTH AS FOUNDATION** at top (`text-4xl md:text-5xl lg:text-6xl`, font-jost-bold, tracking-wide, uppercase)
- Two-column grid below heading (`grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 max-w-6xl mx-auto px-6 pb-20`)
  - **TRUTH** — small uppercase label + paragraph text
  - **DEVOTION** — small uppercase label + paragraph text
- Labels: `text-base tracking-[0.2em] font-jost-bold text-white uppercase mb-4`
- Body text: `text-sm md:text-base text-white/85 leading-relaxed`

### Principles Section (`principles`)
- Height: `min-h-[80vh]` with sunset-sky background
- Light overlay (`bg-black/30`) to keep the sky visible but text legible
- 2-column grid with 3 pillars (Sewa top-left, Intelligence top-right, Integrity bottom-left)
- Same label + body styling as foundation section
- 3rd pillar spans second row, leaving the bottom-right empty (matches screenshot)

### Shared wrapper
- `main.tsx` composes: `<HeroSection />` (eager) → `<LazyOnView><FoundationSection/></LazyOnView>` → `<LazyOnView><PrinciplesSection/></LazyOnView>` per §24

---

## 3. Prisma Model

New file: `prisma/schema/core-values.prisma`

```prisma
model CoreValuesPage {
  id        String   @id @default(cuid())
  section   String   @unique       // "hero" | "foundation" | "principles"
  title     String?
  content   Json                   // typed by module types
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([sortOrder])
}
```

Then: `npm run db:generate && npm run db:push`.

`SeoMeta` already exists (used by the shared SEO module) — only a new seeded row with `page = "our-essence/core-values"` is needed.

---

## 4. Module Layout — `src/modules/core-values/`

```
src/modules/core-values/
  components/
    hero-section.tsx
    foundation-section.tsx
    principles-section.tsx
    main.tsx
    index.ts
  data/
    queries.ts          # getCoreValuesPageData, getCoreValuesSection
    mutations.ts        # upsertCoreValuesSection
    defaults.ts         # defaultSeo + defaultContent per section
    index.ts
  actions.ts            # updateCoreValuesSection, updateSeoMeta wrapper
  validations.ts        # Zod: heroSchema, foundationSchema, principlesSchema (+ seoSchema import)
  types.ts              # HeroSection, FoundationSection, PrinciplesSection, CoreValuesPageData
  index.ts              # barrel
```

### Types (`types.ts`)

```ts
export interface HeroSectionData {
  eyebrow?: string;              // optional "ESSENCE IN ACTION" override
  title: string;
  subtitle: string;
  description: string;
  backgroundImage: string;       // stored as /api/uploads/{filename}
}

export interface ValueBlock {
  label: string;                 // "TRUTH" / "DEVOTION" / ...
  description: string;
}

export interface FoundationSectionData {
  heading: string;               // "TRUTH AS FOUNDATION"
  backgroundImage: string;
  blocks: ValueBlock[];          // [Truth, Devotion]
}

export interface PrinciplesSectionData {
  backgroundImage: string;
  blocks: ValueBlock[];          // [Sewa, Intelligence, Integrity]
}

export interface CoreValuesPageData {
  hero: HeroSectionData;
  foundation: FoundationSectionData;
  principles: PrinciplesSectionData;
}
```

### Validations (`validations.ts`)
- Zod schemas matching each type.
- `blocks` array: min 2 for foundation, min 3 for principles.
- Re-export `seoSchema` from `@/modules/seo/validations` for the admin SEO tab.

### Defaults (`data/defaults.ts`)
- Ships strong defaults so the page renders correctly **before** admin edits.
- `defaultSeo` template (per §23):
  - metaTitle: `"Core Values | Our Essence | Jivo Wellness"`
  - metaDescription: `"Truth, Devotion, Sewa, Intelligence, Integrity — the five principles that shape every action at Jivo Wellness."`
  - keywords: `["jivo core values", "truth devotion sewa", "jivo essence", "wellness values"]`
  - ogImage: hero fallback
  - structuredData: `AboutPage` schema
  - canonicalUrl: `${BASE_URL}/our-essence/core-values`
  - robots: `"index,follow"`
- `defaultContent` for all 3 sections (exact copy from screenshots).

---

## 5. Public Page

```
src/app/(public)/our-essence/core-values/
  page.tsx           # generateMetadata via resolveSeo("our-essence/core-values", defaultSeo)
  loading.tsx        # 3 skeleton blocks
  error.tsx          # §27 template — tag "[core-values page error]"
  not-found.tsx      # §27 template
```

`page.tsx`:
```tsx
export const revalidate = 60;                // SSG + ISR per §25
export async function generateMetadata() {
  return resolveSeo("our-essence/core-values", defaultSeo);
}
export default async function CoreValuesPage() {
  const data = await getCoreValuesPageData();
  return <CoreValuesPageContent data={JSON.parse(JSON.stringify(data))} />;
}
```

---

## 6. Admin Dashboard Page

```
src/app/admin/(dashboard)/our-essence-core-values/
  page.tsx           # tabbed editor
  loading.tsx
  error.tsx
```

### Tabs (in order)
1. **Hero** — title, subtitle, description, background image (UploadThing)
2. **Foundation** — heading, background image, dynamic list of `{label, description}` blocks (Add/Remove, min 2)
3. **Principles** — background image, dynamic list of blocks (min 3)
4. **SEO** — `<SeoTabPanel page="our-essence/core-values" />` (reused from `@/modules/seo`)

### Sidebar registration
In `src/app/admin/(dashboard)/layout.tsx` → `SIDEBAR` → `"Our Essence"` children:
```ts
{ title: 'Core Values', href: '/admin/our-essence-core-values', icon: Compass }
```
And add matching entry to the Our Essence hub page `SECTION_PAGES` array.

### UX details (matches existing admin)
- Header with title + "Save Changes" button (top-right, also bottom)
- Alerts: `bg-primary/10 border-primary/30` for success, `bg-destructive/10 border-destructive/30` for error
- Toast via Sonner
- Image uploads go through UploadThing → store only filename → render via `/api/uploads/[filename]` (§image storage rule)

---

## 7. API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/core-values` | `GET` | Public fetch — returns all active sections merged into `CoreValuesPageData` |
| `/api/admin/core-values` | `GET` | Admin fetch — all sections including inactive |
| `/api/admin/core-values` | `POST` | Upsert one section `{section, content}` — auth-guarded (ADMIN / SUPER_ADMIN) |
| `/api/admin/seo/[page]` | `GET`/`POST` | Already exists — handles SEO for any page including this one |

All responses follow `ActionResponse<T>` (§27): `{success: true, data}` or `{success: false, error}`.
All errors logged with `[GET /api/core-values]` / `[POST /api/admin/core-values]` prefix.

---

## 8. Sitemap & Robots

- `src/app/sitemap.ts` → add static route `{BASE_URL}/our-essence/core-values` (priority 0.8, changefreq monthly).
- No robots.txt change (defaults already allow all public pages).

---

## 9. Seed Data

Extend `prisma/seed.ts`:
1. Insert 3 rows into `CoreValuesPage` using `defaultContent`.
2. Insert 1 row into `SeoMeta` with `page = "our-essence/core-values"` from `defaultSeo`.

---

## 10. Docs File — `docs/core-values.md`

Full per-page docs per the §Page Documentation System rule:
1. Page overview (route, admin route, sections)
2. UI structure (hero / foundation / principles)
3. API documentation (public GET, admin GET/POST, SEO endpoint) with exact request/response JSON
4. Workflow (admin edits → API → DB → revalidate → public updated)
5. Data structure per section
6. Image handling (upload → `/uploads/images/{timestamp}-{name}` → served via `/api/uploads/[filename]`)
7. SEO documentation (fields stored in `SeoMeta` row `page="our-essence/core-values"`)
8. Postman testing (login → get → update hero → update foundation → update principles → update SEO)
9. Update log (first entry: today)

---

## 11. Deliverables Checklist (§26)

- [ ] `prisma/schema/core-values.prisma` + `db:push`
- [ ] `src/modules/core-values/{types,validations,actions}.ts`
- [ ] `src/modules/core-values/data/{queries,mutations,defaults,index}.ts`
- [ ] `src/modules/core-values/components/{hero,foundation,principles,main,index}.tsx/.ts`
- [ ] `src/modules/core-values/index.ts`
- [ ] `src/app/(public)/our-essence/core-values/{page,loading,error,not-found}.tsx`
- [ ] `src/app/admin/(dashboard)/our-essence-core-values/{page,loading,error}.tsx`
- [ ] Sidebar + hub page entry in Our Essence
- [ ] `src/app/api/core-values/route.ts`
- [ ] `src/app/api/admin/core-values/route.ts`
- [ ] Seed `CoreValuesPage` + `SeoMeta` row
- [ ] `src/app/sitemap.ts` updated
- [ ] `docs/core-values.md`

---

## 12. Open Decisions (picked best-practice defaults — will proceed unless you object)

1. **Route path** — `/our-essence/core-values` (nested under our-essence) rather than flat `/core-values`. Matches visual hierarchy and the admin naming convention already in use for "our-essence-the-story".
2. **Section count** — 3 sections (hero / foundation / principles) rather than 1 monolith. Lets admin edit each background and value block independently.
3. **Admin URL** — `/admin/our-essence-core-values` (flat slug with hyphens) — matches existing `the-story` sibling.
4. **`principles` section layout** — 2-col grid with 3 items, bottom-right cell empty to match screenshot #3 exactly.
5. **SEO page key** — `"our-essence/core-values"` (slash-separated, matches route). Downstream SeoMeta lookups key by this exact string.
6. **Rendering** — `revalidate = 60` (ISR) rather than `force-dynamic`, since this is static-ish content updated rarely.

---

**Ready to build.** Say "go" (or "build it") and I will execute Phase-by-Phase in this order: Prisma → module files → public page → admin page → API routes → sidebar wiring → seed → sitemap → docs.
