# Footer — Documentation

> **Routes**
> Public:  rendered on every page by `<Footer />` in `src/components/layout/footer.tsx`
> Admin:   `/admin/footer`
> APIs:    `/api/footer`, `/api/footer/columns`, `/api/footer/columns/:id`,
>          `/api/footer/links`, `/api/footer/links/:id`,
>          `/api/footer/settings`

---

## 1. Overview

The footer is **fully CMS-managed**. It consists of:

1. **Link columns** — the grid of titled lists in the upper footer (e.g. *OUR ESSENCE*, *OUR PRODUCTS*, *JIVO MEDIA*, *COMMUNITY*, *QUICK LINKS*).
2. **Links** — individual entries inside each column.
3. **Footer Settings** (singleton) — the bottom bar: logo, copyright text, address, email, phone, phone label.

The public `<Footer />` is an async Server Component that calls `getVisibleFooter()` once per request and renders columns + bottom bar. Every edit in `/admin/footer` hits the DB and revalidates `/`, so the next page load shows the new footer.

---

## 2. Database Models

File: [`prisma/schema/footer.prisma`](../prisma/schema/footer.prisma)

```prisma
model FooterColumn {
  id        String       @id @default(cuid())
  title     String                   // "OUR ESSENCE"
  sortOrder Int          @default(0) // left → right
  isVisible Boolean      @default(true)
  links     FooterLink[]             // one-to-many
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
}

model FooterLink {
  id        String       @id @default(cuid())
  columnId  String                   // FK → FooterColumn.id (cascade on delete)
  column    FooterColumn @relation(fields: [columnId], references: [id], onDelete: Cascade)
  title     String                   // "Our Story"
  href      String                   // "/our-story"
  sortOrder Int          @default(0) // top → bottom inside the column
  isVisible Boolean      @default(true)
}

model FooterSetting {
  id            String   @id @default("default") // singleton
  logoUrl       String?
  logoAlt       String?
  copyrightText String?  // "All Right Reserved © 2026"
  address       String?
  email         String?
  phone         String?
  phoneLabel    String?  // "(TOLL FREE)"
  updatedAt     DateTime @updatedAt
}
```

Deleting a column cascades to its links via the `onDelete: Cascade` FK.

---

## 3. Module Layout

```
src/modules/footer/
├── actions.ts          # Server actions — CRUD + getters
├── validations.ts      # Zod schemas for all inputs
├── types.ts            # FooterColumnWithLinks, FooterData
└── index.ts            # Barrel export

src/components/layout/footer.tsx    # Public Footer server component
src/app/admin/(dashboard)/footer/page.tsx   # Admin CRUD UI

src/app/api/footer/route.ts                       # GET (public + admin ?all=true)
src/app/api/footer/columns/route.ts               # POST (create column)
src/app/api/footer/columns/[id]/route.ts          # PUT, DELETE
src/app/api/footer/links/route.ts                 # POST (create link)
src/app/api/footer/links/[id]/route.ts            # PUT, DELETE
src/app/api/footer/settings/route.ts              # GET, PUT
```

---

## 4. API Reference

All responses follow the project convention:
```typescript
{ success: true,  data: T }
{ success: false, error: string, fieldErrors?: Record<string, string[]> }
```

### 4.1 `GET /api/footer`
**Public** (no auth). Returns visible columns + visible links + settings.

```json
{
  "success": true,
  "data": {
    "columns": [
      {
        "id": "cm...",
        "title": "OUR ESSENCE",
        "sortOrder": 0,
        "isVisible": true,
        "links": [
          { "id": "cm...", "title": "Our Story", "href": "/our-story", "sortOrder": 0, "isVisible": true }
        ]
      }
    ],
    "setting": {
      "id": "default",
      "logoUrl": "/images/Jivo Logo.png",
      "logoAlt": "Jivo",
      "copyrightText": "All Right Reserved © 2026",
      "address": "Jt/190, Nehru Market, Rajouri Garden, New Delhi - 110027",
      "email": "info@jivo.in",
      "phone": "1800 137 4433",
      "phoneLabel": "(TOLL FREE)"
    }
  }
}
```

### 4.2 `GET /api/footer?all=true`
**Admin only.** Returns all columns (including hidden) with all links (including hidden).

### 4.3 `POST /api/footer/columns` — Admin only
```json
{
  "title": "OUR ESSENCE",
  "sortOrder": 0,
  "isVisible": true
}
```
- `title`: required, 1–80 chars
- `sortOrder`: integer ≥ 0 (lower = further left)
- `isVisible`: boolean, default `true`

### 4.4 `PUT /api/footer/columns/:id` — Admin only
All fields optional; only provided keys are updated.

### 4.5 `DELETE /api/footer/columns/:id` — Admin only
**Cascade deletes** all links in the column.

### 4.6 `POST /api/footer/links` — Admin only
```json
{
  "columnId": "cm...",
  "title": "Our Story",
  "href": "/our-story",
  "sortOrder": 0,
  "isVisible": true
}
```
- `columnId`: required — must reference an existing `FooterColumn`
- `title`: 1–120 chars
- `href`: 1–300 chars (internal paths or absolute URLs)

### 4.7 `PUT /api/footer/links/:id` — Admin only
Partial update. Can move a link to a different column by changing `columnId`.

### 4.8 `DELETE /api/footer/links/:id` — Admin only

### 4.9 `GET /api/footer/settings`
**Public.** Returns the singleton settings row. Auto-creates it on first call.

### 4.10 `PUT /api/footer/settings` — Admin only
```json
{
  "logoUrl": "/images/custom-logo.webp",
  "logoAlt": "Jivo Wellness",
  "copyrightText": "All Right Reserved © 2026",
  "address": "New Delhi",
  "email": "info@jivo.in",
  "phone": "1800 137 4433",
  "phoneLabel": "(TOLL FREE)"
}
```
Any field can be `null` to clear it. Any omitted field is left unchanged.

---

## 5. Admin Dashboard

**URL:** `/admin/footer`

### Top card — Brand & Contact
Singleton settings editor:
- **Logo** — uploaded via `<ImageUpload>` → stored as `/images/<timestamp>-<name>.webp`
- **Logo alt text** — SEO/accessibility fallback
- **Copyright text** — shown in bottom bar
- **Address, Email, Phone, Phone label** — displayed as icons + text in the bottom bar

Click **Save Settings** to persist.

### Bottom card — Link Columns
Each column is a collapsible row:
- **Expand** → see all links in that column
- **Eye toggle** → show/hide column instantly (no dialog)
- **Pencil** → edit column title / order / visibility
- **Trash** → delete column (and all its links, confirmed)
- **Add Link** (inside expanded column) → create a link in that column

### Link editor
Fields:
- **Column** — dropdown to re-parent the link
- **Title** — display text
- **URL / path** — `/about`, `https://…`, anything
- **Sort order** — integer, lower = higher up in the column
- **Visibility** — quick toggle

Toast notifications fire on every save / delete / toggle. `router.refresh()` runs after every mutation to refresh the admin view instantly.

---

## 6. Seeding

`npm run db:seed` installs:
- 5 columns with 45 total links, matching the reference design exactly
- 1 footer settings row with brand info from the screenshot

The seed wipes & recreates footer columns + links each run (small enough to do this cleanly). Settings use `upsert`.

---

## 7. Extending

### Add a new column programmatically
```typescript
import { createColumn } from '@/modules/footer';

await createColumn({ title: 'NEW SECTION', sortOrder: 5, isVisible: true });
```

### Use `getVisibleFooter()` anywhere
Already a Server Action, so it can be called from any Server Component:
```tsx
import { getVisibleFooter } from '@/modules/footer';

const { columns, setting } = await getVisibleFooter();
```

### Add a link-grouping feature
The schema already supports column-level visibility. If you want more complex grouping (e.g. sub-columns or nested menus), add a `parentId String?` field on `FooterLink` and tree-render recursively in the public component.
