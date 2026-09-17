# Koffie (Instant Coffee) — Page Documentation

## 1. Page Overview

| | |
|---|---|
| **Public route** | `/products/coffee` |
| **Admin route** | `/jivo-dev/our-products/coffee` |
| **Module** | `src/modules/our-products/coffee/` |
| **Prisma model** | `OurProductsCoffee` (`prisma/schema/our-products-coffee.prisma`) |
| **SEO key** | `our-products-coffee` |
| **Rendering** | ISR — `export const revalidate = 300` |

The page borrows its layouts from two existing pages:

- **Sections 1 and 2** are based on the **Natural Mineral Water** page
  (`/products/water`) and use the same animation. Section 2 also has the same fields.
  The hero's layout was adjusted to match the Koffie design (see the table below).
- **Sections 3 and 4** copy the **Groundnut Oils** page (`/products/groundnut-oils`),
  sections 3 (`goodness`) and 4 (`authenticity`), in the same way.

Places where the Koffie version differs from the page it copies:

| Section | Change | Why |
|---|---|---|
| Hero | The text block sits bottom-left (`lg:px-[8%]`, `bottom-[16%]`, max width 34% on desktop) instead of centred. | Matches the Koffie design. |
| Hero | Both jars stand upright and sit 3% in from the right edge; only their bases are cut off by the bottom of the section. The small jar sits to the left of the big one. The group is `clamp(12rem, 40vw, 70rem)` wide. Water pushes its bottles past the right edge. | Matches the Koffie design. |
| Hero | There is no background image option. The hero is always the flat `#4C2118` colour. | The design has no background image. |
| Hero | The section is a size container (`container-type: size`) that is 60svh tall on phones, 70svh from `sm` and 100dvh from `lg`, with a 22rem minimum. The logo, jars, text and spacing are all sized in `cqw`/`cqh`, so the arrangement matches the 1920×945 design at every screen size. Text sizes have readable minimums on small screens. | Keeps the same positions at every screen size. |
| Range | With fewer than 3 variants, the grid uses 2 columns from `md` up and is capped at `max-w-3xl` and centred. Water always uses 3 columns. | Koffie has two pack sizes. With a third, empty column the two cards would sit off to the left. |
| Key Highlights | The uploaded `image` is a full-bleed **background**, anchored right so the beans stay in view, with the text at the top left. The groundnut original shows its image as artwork beside the text. On phones and small tablets a light left-to-right shade keeps the text readable. | Matches the Koffie design. |
| Key Highlights | Full screen (`min-h-dvh`) from `md` up. On phones the section is at least 60svh tall and grows with its content. | Requested layout. |
| Beyond Beans | The background is always flat `#3D1F08` (`COFFEE_BEAN`). The uploaded image is decorative line art at the bottom right (`object-contain`, 3:2, 67% of the width on desktop, 80% on `sm`, 96% on phones), not a full-bleed cover. On phones, bottom padding leaves room for the artwork under the text. The field is still named `backgroundImage` so existing data keeps working. | Matches the Koffie design. |
| Key Highlights | The intro paragraph only renders when it has text. | The design goes straight from the heading to the bullet list. |
| Key Highlights | The bullets don't use `lg:whitespace-nowrap`. | The Koffie bullets are too long for one line and would overflow the column (responsive.md §5 / §7). |

### Palette (from the "KOFFIE PAGE" swatch sheet)

| Token | Hex | Used for |
|---|---|---|
| `COFFEE_ESPRESSO` | `#4C2118` | Hero background |
| `COFFEE_ROAST` | `#582C12` | Range section background |
| `COFFEE_CARAMEL` | `#8C512D` | Range card background, Key Highlights background |
| `COFFEE_BEAN` | `#3D1F08` | Beyond Beans background when no artwork is uploaded |
| `COFFEE_CREAM` | `#FFFFFF` | Heading and label text |
| `COFFEE_CREAM_ALT` | `#E8C9A0` | Underline that appears when you hover the range heading |

---

## 2. UI Structure

| # | Section key | Component | Description |
|---|---|---|---|
| 1 | `hero` | `hero-section.tsx` | Flat espresso background (no background image). JIVO wordmark centred at the top, two upright jars at the bottom right with a small gap from the edge, and a heading, subtitle and **BUY** button at the bottom left. |
| 2 | `range` | `range-section.tsx` | Roast-brown background with the heading "OUR RANGE OF PRODUCTS" and caramel cards (50g, 100g). Cards slide in from the left. Each jar is drawn larger than the one before it. |
| 3 | `keyHighlights` | `highlights-section.tsx` | Full-bleed coffee-bean photo (or a flat caramel background if none is uploaded), full screen from `md` up. "KEY HIGHLIGHTS" heading and a six-item bullet list at the top left. |
| 4 | `beyondBeans` | `beyond-beans-section.tsx` | Flat `#3D1F08` background with the heading and paragraph at the top left. Transparent coffee-branch line art sits at the bottom right, about two-thirds of the section width and slightly cut off at the right and bottom edges. |

Section order and visibility come from the database (`sortOrder` / `isActive`). See §6.

---

## 3. API

### Public GET

```
GET /api/our-products/coffee
```

Returns every **active** section, keyed by section name:

```json
{
  "success": true,
  "data": {
    "hero": { "...": "..." },
    "range": { "...": "..." },
    "keyHighlights": { "...": "..." },
    "beyondBeans": { "...": "..." }
  }
}
```

If the query fails, it returns `500` with
`{ "success": false, "error": "Failed to load page data" }`. The error is logged with the tag
`[GET /api/our-products/coffee]`.

### SEO CRUD (shared endpoint)

```
GET  /api/admin/seo/our-products-coffee
POST /api/admin/seo/our-products-coffee
```

### Server actions (`src/modules/our-products/coffee/actions.ts`)

| Action | Purpose |
|---|---|
| `getCoffeePageSectionsAction()` | Public read (active sections, in order) |
| `getAllCoffeeSectionsAction()` | Admin read (all rows, including inactive) |
| `getCoffeeSectionAction(section)` | Admin read of a single section |
| `upsertCoffeeSectionAction(section, content)` | Admin write, validated with Zod |
| `deleteCoffeeSectionAction(id)` | Admin delete |
| `setCoffeeSectionActiveAction(section, isActive)` | Show or hide a section |
| `reorderCoffeeSectionsAction(orderedSections)` | Save a new section order |

All admin actions require an `ADMIN` or `SUPER_ADMIN` session. Each one returns
`ActionResponse<T>` and revalidates both `/products/coffee` and
`/jivo-dev/our-products/coffee`.

---

## 4. Workflow

1. The admin opens `/jivo-dev/our-products/coffee`.
2. The page loads content from `GET /api/our-products/coffee`, and the order and
   visibility of each row from `getAllCoffeeSectionsAction()`.
3. The admin edits a tab and presses **Save Changes**. This calls
   `upsertCoffeeSectionAction(tabKey, content)`, which validates the content against
   that section's Zod schema, saves it, and deletes any image the edit removed
   (only when no other record still uses it).
4. The **Manage Sections** panel lets the admin drag sections to reorder them and
   switch each one between Visible and Hidden. It calls
   `reorderCoffeeSectionsAction` and `setCoffeeSectionActiveAction`.
5. `revalidatePath` refreshes the public ISR page.

---

## 5. Data Structure

```jsonc
// hero
{
  "logoImage": "string",
  "heading": "KOFFIE",
  "subtitleLineOne": "Dawn's Bold Awakening.",
  "subtitleLineTwo": "",            // optional
  "ctaLabel": "BUY",
  "ctaHref": "/our-products",
  "productImage": "string",         // large jar
  "productImageSecondary": ""       // optional small jar, left of the big one
}

// range
{
  "heading": "OUR RANGE OF PRODUCTS",
  "variants": [
    { "image": "string", "label": "50g", "href": "" },
    { "image": "string", "label": "100g", "href": "" }
  ]
}

// keyHighlights
{
  "heading": "KEY HIGHLIGHTS",
  "paragraph": "",                  // optional intro
  "highlightsHeading": "",          // optional sub-heading
  "highlights": ["Ethical Sourcing: Select arabica from responsible estates.", "..."],
  "image": "string"                 // full-bleed background photo
}

// beyondBeans
{
  "heading": "BEYOND BEANS: WELLNESS INFUSED",
  "paragraph": "string",            // line breaks preserved
  "backgroundImage": ""             // transparent 3:2 line art, bottom-right (empty = none)
}
```

Validation doesn't require any image field. When an image is missing, `SafeImage` shows the
upload placeholder, so editors can save text before the artwork is uploaded.

---

## 6. Section Order + Visibility (prompt1 §8b)

- The query returns `where: { isActive: true }, orderBy: { sortOrder: 'asc' }`.
- The page passes that ordered list to `CoffeeMain`, which renders each entry through
  its `SECTION_COMPONENTS` registry. Inactive sections aren't in the list, so they
  never render. Unknown section keys are skipped.
- Reordering or hiding sections is done from the admin. It never needs a code change.

---

## 7. Image Handling

- Uploaded files are stored in `/uploads/images/`, and the database stores only the
  filename.
- Images are served at `/uploads/images/<file>`, which `next.config.ts` rewrites to
  `/api/uploads/[filename]`. When a file isn't found, that route returns
  `placeholder.png` instead.
- **Development only:** if `DEV_UPLOADS_FALLBACK_ORIGIN` is set in `.env.local`
  (for example `https://abc.jivo.in`), an image missing from local disk is fetched from
  `<origin>/uploads/images/<file>`. This lets a local setup that shares the live
  database show images uploaded on the server. Production ignores this variable.
- Hero images use `priority` and `fetchPriority="high"`. Every image passes a `sizes` value.
- The Key Highlights and Beyond Beans backgrounds are decorative: each has an empty
  `alt`, and grid stacking (responsive.md §6) keeps the text in normal flow.

---

## 8. SEO

The defaults are `defaultSeo` in `data/defaults.ts`. A `SeoMeta` row with the key
`our-products-coffee` overrides them. `prisma/seed.ts` seeds that row.

- Metadata: `generateMetadata()` calls `resolveSeo('our-products-coffee', defaultSeo)`.
- JSON-LD: `getStructuredData(...)` outputs a `Product` with a `Brand`
  (category `Instant Coffee`).
- The page is in `src/app/sitemap.ts` with priority `0.9` and change frequency `weekly`.
- `robots` is `index,follow`.

| Field | Default |
|---|---|
| metaTitle | Koffie — Instant Smooth Premium Coffee \| Jivo Wellness |
| metaDescription | Jivo Koffie — instant smooth premium coffee from ethically sourced arabica… |
| keywords | jivo koffie, jivo coffee, instant coffee india, premium instant coffee, … |
| ogImage | `og-default.png` |
| canonical | `${SITE_URL}/products/coffee` |

---

## 9. Postman

```bash
# 1. Public read
GET http://localhost:3000/api/our-products/coffee

# 2. Log in as admin (stores the session cookie)
POST http://localhost:3000/api/auth/callback/credentials
  email=admin@jivo.in&password=<ADMIN_PASSWORD>

# 3. Read SEO
GET http://localhost:3000/api/admin/seo/our-products-coffee
```

Section writes use server actions, not REST endpoints, so test them from the admin UI
at `/jivo-dev/our-products/coffee`.

---

## 10. Setup

```bash
npm run db:generate   # regenerate the Prisma client (adds OurProductsCoffee)
npm run db:push       # create the OurProductsCoffee table
npm run db:seed       # insert-only: SEO row + 4 default sections
```

The page appears in these places:

- the CMS registry (`src/modules/admin/cms/pages.ts`), which feeds the admin sidebar,
  the SEO Manager and Analytics
- the admin products hub
- `src/lib/preview-utils.ts`
- `src/lib/uploads-usage.ts`
- the product knowledge index

---

## 11. Update Log

| Date | Change |
|---|---|
| 2026-09-17 | Page created with 4 sections (hero and range copied from water; key highlights and beyond beans copied from groundnut). CMS table and seed added, and the page registered in the CMS registry, sitemap, preview map, uploads usage and knowledge index. |
| 2026-09-17 | Hero: moved the text to the bottom left and pulled both jars in from the right edge, per the design. Removed the hero background image option from the type, validation, defaults, admin editor and seed. |
| 2026-09-17 | Hero made fully responsive. It now scales as one unit using container units, is 60% of the screen height on phones, and was checked at 360, 390, 430, 768, 1024, 1366, 1920, 2560 and 740×360 landscape with no horizontal overflow. |
| 2026-09-17 | Key Highlights: the image is now a full-bleed background with the text on top, and the section is full screen from `md` up (at least 60svh on phones). |
| 2026-09-17 | Beyond Beans: now a flat `#3D1F08` background, with the line art made smaller and moved to the bottom right to match the design. |
