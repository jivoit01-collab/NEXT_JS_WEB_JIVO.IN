# Healthy Wheatgrass Juice — Page Documentation

## 1. Page Overview

| | |
|---|---|
| **Public route** | `/products/wheatgrass-juice` |
| **Admin route** | `/jivo-dev/our-products/wheatgrass-juice` |
| **Module** | `src/modules/our-products/wheatgrass-juice/` |
| **Prisma model** | `OurProductsWheatgrassJuice` (`prisma/schema/our-products-wheatgrass-juice.prisma`) |
| **SEO key** | `our-products-wheatgrass-juice` |
| **Rendering** | ISR — `export const revalidate = 300` |

Sections 1 and 2 intentionally mirror the **Natural Mineral Water** page's styling and
animation exactly; only the content and palette differ. Sections 3 and 4 share one
layout component (`copy-with-art-section.tsx`); section 5 mirrors water's feature row
over a background photo.

### Palette

| Token | Hex | Used for |
|---|---|---|
| `WHEATGRASS_GREEN` | `#148311` | Hero field, range card background |
| `WHEATGRASS_SAGE` | `#70B294` | Range section background |
| `WHEATGRASS_FOREST` | `#215338` | Wellness background, highlights fallback |
| `WHEATGRASS_LEAF` | `#ABC991` | Difference section background |
| `WHEATGRASS_INK` | `#215338` | Heading/body ink on the pale leaf field |

---

## 2. UI Structure

| # | Section key | Component | Description |
|---|---|---|---|
| 1 | `hero` | `hero-section.tsx` | Flat green field, centred JIVO wordmark, left copy + BUY CTA, bottle group bottom-right. Copied from the water hero. |
| 2 | `range` | `range-section.tsx` | Sage field; scroll-snapping **carousel** of flavour cards with prev/next arrows. |
| 3 | `wellness` | `wellness-section.tsx` | Deep forest field; **left-aligned** copy, wheatgrass blades bleeding off the right. |
| 4 | `difference` | `difference-section.tsx` | Pale leaf field; **left-aligned** copy, tilted bottle bleeding off the bottom-right. |
| 5 | `highlights` | `highlights-section.tsx` | Six icon columns with dividers over a full-bleed wheatgrass photo. |

Order and visibility are **data-driven** (`sortOrder` / `isActive`) — see §6.

---

## 3. API

### Public GET

```
GET /api/our-products/wheatgrass-juice
```

Returns every **active** section keyed by section name:

```json
{
  "success": true,
  "data": {
    "hero": { "...": "..." },
    "range": { "...": "..." },
    "wellness": { "...": "..." },
    "difference": { "...": "..." },
    "highlights": { "...": "..." }
  }
}
```

### SEO CRUD (shared endpoint)

```
GET  /api/admin/seo/our-products-wheatgrass-juice
POST /api/admin/seo/our-products-wheatgrass-juice
```

### Server actions (`src/modules/our-products/wheatgrass-juice/actions.ts`)

| Action | Purpose |
|---|---|
| `getWheatgrassPageSectionsAction()` | Public read (active, ordered) |
| `getAllWheatgrassSectionsAction()` | Admin read (all rows, incl. inactive) |
| `getWheatgrassSectionAction(section)` | Admin read, single section |
| `upsertWheatgrassSectionAction(section, content)` | Admin write (Zod-validated) |
| `deleteWheatgrassSectionAction(id)` | Admin delete |
| `setWheatgrassSectionActiveAction(section, isActive)` | Show/hide a section |
| `reorderWheatgrassSectionsAction(orderedSections)` | Persist a new section order |

All admin actions require an `ADMIN` / `SUPER_ADMIN` session and revalidate both
`/products/wheatgrass-juice` and `/jivo-dev/our-products/wheatgrass-juice`.

---

## 4. Workflow

1. Admin opens `/jivo-dev/our-products/wheatgrass-juice`.
2. The page loads content from `GET /api/our-products/wheatgrass-juice` and row
   metadata (order/visibility) from `getAllWheatgrassSectionsAction()`.
3. Editing a tab and pressing **Save Changes** calls
   `upsertWheatgrassSectionAction(tabKey, content)`, which validates with the
   matching Zod schema before writing.
4. The **Manage Sections** panel (drag to reorder, toggle Visible/Hidden) calls
   `reorderWheatgrassSectionsAction` / `setWheatgrassSectionActiveAction`.
5. `revalidatePath` refreshes the public ISR page.

---

## 5. Data Structure

```jsonc
// hero
{
  "logoImage": "string",
  "heading": "HEALTHY WHEATGRASS",
  "subtitleLineOne": "Himalayan Greens.",
  "subtitleLineTwo": "Pure Goodness.\nSimply Refreshing.",
  "ctaLabel": "BUY",
  "ctaHref": "shop.jivo.in",
  "productImage": "string",
  "productImageSecondary": "string",
  "backgroundImage": ""   // empty keeps the flat green field
}

// range
{
  "heading": "HEALTHY WHEATGRASS RANGE OF PRODUCTS",
  "variants": [{ "image": "string", "label": "Rose", "size": "200ml", "href": "" }]
}

// wellness | difference  (identical shape)
{ "heading": "string", "paragraph": "string", "image": "string" }

// highlights
{
  "heading": "KEY HIGHLIGHTS",
  "highlights": [{ "image": "string", "label": "string", "description": "string" }],
  "backgroundImage": "string"
}
```

Every image field is **optional** in validation: components render the upload
placeholder via `SafeImage`, so editors can save copy before art is uploaded.

---

## 6. Section Order + Visibility (prompt1 §8b)

- Query returns `where: { isActive: true }, orderBy: { sortOrder: 'asc' }`.
- The page passes that **ordered list** to `WheatgrassMain`, which maps a
  `SECTION_COMPONENTS` registry over it — inactive sections are absent from the
  list and therefore never render; unknown keys are skipped.
- Reordering/hiding is a **content operation** from the admin, never a code change.

---

## 7. Image Handling

- All images go through `SafeImage`; empty/unknown values fall back to
  `/api/uploads/placeholder.png`.
- Hero art uses `priority` + `fetchPriority="high"`; every image passes a `sizes`.
- Sections 3/4 artwork is decorative (`aria-hidden`, absolute) — permitted by
  responsive.md §6 since primary copy stays in normal flow.

---

## 8. SEO

Defaults live in `data/defaults.ts` (`defaultSeo`) and are overridden by any
`SeoMeta` row keyed `our-products-wheatgrass-juice`.

- `generateMetadata()` → `resolveSeo('our-products-wheatgrass-juice', defaultSeo)`
- JSON-LD → `getStructuredData(...)` emitting a `Product` + `Brand` graph
- Listed in `src/app/sitemap.ts` at priority `0.9`, `weekly`

---

## 9. Postman

```bash
# 1. Public read
GET http://localhost:3000/api/our-products/wheatgrass-juice

# 2. Login as admin (stores the session cookie)
POST http://localhost:3000/api/auth/callback/credentials
  email=admin@jivo.in&password=<ADMIN_PASSWORD>

# 3. Read SEO
GET http://localhost:3000/api/admin/seo/our-products-wheatgrass-juice
```

Section writes go through server actions (not REST), so exercise them from the
admin UI at `/jivo-dev/our-products/wheatgrass-juice`.

---

## 10. Update Log

| Date | Change |
|---|---|
| 2026-08-12 | Page created — 5 sections, CMS table seeded, registered in CMS registry / sitemap / preview map. |
