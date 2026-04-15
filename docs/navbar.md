# Navbar — Documentation

> **Routes**
> Public: rendered globally inside `/` (and any future page that mounts `<Navbar />`)
> Admin:  `/admin/navbar`
> API:    `/api/navbar`, `/api/navbar/:id`, `/api/navbar/settings`

---

## 1. Overview

The public navbar is **fully CMS-managed**. It has two pieces of state:

1. **Nav links** — the menu items shown on the right of the bar (e.g. *Products*, *Our Essence*, *Media*, *Community*). Each link is a row in the `NavLink` table.
2. **Brand settings** — the logo image and accessible alt text shown on the left. Stored as a single row in the `NavbarSetting` table (singleton with `id = "default"`).

The component itself is a single responsive React file ([`src/components/layout/navbar.tsx`](../src/components/layout/navbar.tsx)) — desktop nav, mobile hamburger panel, scroll-aware glass effect, and logo all live there. **There is no separate `navbar-client` or `mobile-nav` file.**

If the DB has no nav links yet, the component falls back to a hardcoded set that mirrors the seeded rows. If the DB has no logo set, the component falls back to a text wordmark using `SITE_NAME` from `@/lib/constants`.

### Visual layout

| Slot      | Source                                | Fallback                                       |
|-----------|---------------------------------------|------------------------------------------------|
| Logo      | `NavbarSetting.logoUrl` (uploaded image) | Text wordmark (`SITE_NAME` or `logoAlt`)    |
| Nav items | `NavLink` rows where `isVisible = true`, ordered by `sortOrder` | Default 4 items (Products, Our Essence, Media, Community) |
| Mobile    | Same data — toggled by hamburger inline panel | n/a                                          |

---

## 2. Database Models

File: [`prisma/schema/navbar.prisma`](../prisma/schema/navbar.prisma)

```prisma
model NavLink {
  id        String   @id @default(cuid())
  title     String   // "Products", "Our Essence", "Media", "Community"
  href      String   // "/products", "/our-essence", "/media", "/community"
  sortOrder Int      @default(0)
  isVisible Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([sortOrder])
}

model NavbarSetting {
  id        String   @id @default("default")  // singleton — only one row
  logoUrl   String?  // Uploaded brand logo
  logoAlt   String?  // Optional alt-text override (defaults to SITE_NAME)
  updatedAt DateTime @updatedAt
}
```

- `NavLink` is a regular CRUD list ordered by `sortOrder`.
- `NavbarSetting` is a **singleton** keyed by `id = "default"`. The `getNavbarSetting()` action upserts the row, so the table always returns exactly one record.

---

## 3. File Layout

```
src/modules/navbar/
├── actions.ts                     # Server actions (links + settings)
├── validations.ts                 # Zod schemas
├── types.ts                       # TypeScript interfaces
└── index.ts                       # Barrel export

src/components/layout/
└── navbar.tsx                     # ⭐ Single client component (desktop + mobile + glass)

src/app/(public)/page.tsx          # Public home page — fetches links + logo, mounts <Navbar />

src/app/admin/(dashboard)/navbar/
└── page.tsx                       # Admin manager (logo card + links table + dialogs)

src/app/api/navbar/
├── route.ts                       # GET (list) + POST (create link)
├── [id]/route.ts                  # GET + PUT + DELETE (single link)
└── settings/route.ts              # GET (public) + PUT (admin) singleton brand settings

prisma/schema/navbar.prisma        # NavLink + NavbarSetting models
prisma/seed.ts                     # Seeds the four default links on `npm run db:seed`
```

---

## 4. TypeScript Shapes

Defined in [`types.ts`](../src/modules/navbar/types.ts) and validated by Zod in [`validations.ts`](../src/modules/navbar/validations.ts).

### 4.1 `NavLink`

```typescript
interface NavLinkItem {
  id: string;
  title: string;        // displayed label
  href: string;         // internal path or absolute URL
  sortOrder: number;    // ascending sort
  isVisible: boolean;   // hidden links are excluded from the public nav
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface NavLinkInput {
  title: string;
  href: string;
  sortOrder?: number;   // defaults to 0
  isVisible?: boolean;  // defaults to true
}
```

### 4.2 `NavbarSetting`

```typescript
interface NavbarSettingItem {
  id: string;             // always "default"
  logoUrl: string | null; // /images/<timestamp>-<slug>.webp from /api/upload
  logoAlt: string | null; // override for accessibility — falls back to SITE_NAME
  updatedAt: Date | string;
}

interface NavbarSettingInput {
  logoUrl?: string | null;
  logoAlt?: string | null;
}
```

---

## 5. API Reference

All routes live under `src/app/api/navbar/`. JSON response shape is consistent across the project:

```typescript
{ success: true,  data: T }
{ success: false, error: string, fieldErrors?: Record<string, string[]> }
```

### 5.1 `GET /api/navbar`

Returns navbar links.

| Param              | Behavior                                                                  |
|--------------------|---------------------------------------------------------------------------|
| *(no query)*       | **Public** — returns only `isVisible = true`, ordered by `sortOrder` asc. |
| `?all=true` (admin)| Returns every link (visible + hidden). Requires admin auth.               |

**Example response**
```json
{
  "success": true,
  "data": [
    { "id": "cm1abc...", "title": "Products",    "href": "/products",    "sortOrder": 0, "isVisible": true,  "createdAt": "...", "updatedAt": "..." },
    { "id": "cm1def...", "title": "Our Essence", "href": "/our-essence", "sortOrder": 1, "isVisible": true,  "createdAt": "...", "updatedAt": "..." },
    { "id": "cm1ghi...", "title": "Media",       "href": "/media",       "sortOrder": 2, "isVisible": true,  "createdAt": "...", "updatedAt": "..." },
    { "id": "cm1jkl...", "title": "Community",   "href": "/community",   "sortOrder": 3, "isVisible": true,  "createdAt": "...", "updatedAt": "..." }
  ]
}
```

### 5.2 `POST /api/navbar`

**Auth required.** Creates a new nav link.

```http
POST /api/navbar
Content-Type: application/json
Cookie: authjs.session-token=<session>

{
  "title": "Blog",
  "href": "/blog",
  "sortOrder": 4,
  "isVisible": true
}
```

- Returns `400` with `fieldErrors` on validation failure (empty title, etc.).

### 5.3 `GET /api/navbar/:id`

**Auth required.** Returns a single nav link by `id`.

### 5.4 `PUT /api/navbar/:id`

**Auth required.** Updates a link. All fields optional; only provided keys are touched.

```http
PUT /api/navbar/cm1abc...
Content-Type: application/json

{
  "title": "Shop",
  "isVisible": false
}
```

### 5.5 `DELETE /api/navbar/:id`

**Auth required.** Permanently deletes a link.

### 5.6 `GET /api/navbar/settings`

**Public.** Returns the singleton `NavbarSetting` row. Auto-creates the row on first call so this never returns `null`.

```json
{
  "success": true,
  "data": {
    "id": "default",
    "logoUrl": "/images/1776235176553-jivo-logo.webp",
    "logoAlt": null,
    "updatedAt": "2026-04-15T..."
  }
}
```

### 5.7 `PUT /api/navbar/settings`

**Auth required.** Upserts the singleton row.

```http
PUT /api/navbar/settings
Content-Type: application/json
Cookie: authjs.session-token=<session>

{
  "logoUrl": "/images/1776235176553-jivo-logo.webp",
  "logoAlt": "Jivo Wellness"
}
```

Pass `null` to either field to clear it (and fall back to the text wordmark).

---

## 6. Admin Dashboard

**URL:** `/admin/navbar`

### Workflow
1. Log in at `/admin/login` with the seeded admin credentials (`.env.local` → `ADMIN_EMAIL` / `ADMIN_PASSWORD`).
2. Sidebar → **Navbar**.
3. **Brand logo card** at the top:
   - Drag-and-drop or click to upload a logo image (`/api/upload` resizes + WebPs it).
   - Edit the alt text. Empty alt falls back to `SITE_NAME` (`Jivo Wellness`).
   - Live preview shows what the logo will look like in the navbar.
   - Click **Save logo** — only enabled when the form is dirty.
4. **Stats row** — total links, visible count, hidden count.
5. **Links table** — every link (visible + hidden) with order, status badge, edit/delete.
   - Click the status badge to toggle visibility instantly.
   - Pencil → opens the edit dialog. Trash → opens the confirm-delete dialog.
6. **Add Link** button (top-right) → opens the create dialog with empty defaults.

### Dialog fields (create + edit)
| Field      | Notes                                                                 |
|------------|-----------------------------------------------------------------------|
| Title      | 1–60 chars. The visible label.                                        |
| Link       | 1–200 chars. Internal path (`/products`) or absolute URL.             |
| Sort order | Integer ≥ 0. Lower = further left.                                    |
| Visibility | Toggle button — Active means it shows on the public nav.              |

---

## 7. Image Upload (Logo)

The logo upload reuses the project-wide `<ImageUpload>` component, which posts to `/api/upload`:

- **Endpoint:** `POST /api/upload` — multipart/form-data, field name `file`.
- **Auth:** required.
- **Limits:** 5 MB max, types: `image/jpeg`, `image/png`, `image/webp`.
- **Processing:** Sharp resize-to-fit 1200×1200 (no enlargement) → WebP quality 80.
- **Output path:** `/images/<timestamp>-<slug>.webp`
- **Delete:** `DELETE /api/upload` with `{ "url": "/images/..." }`.

For best results upload a **transparent PNG/WebP around 120×40 px** (or larger but in the same aspect). The navbar renders the logo at `h-7 lg:h-9` and `w-auto`, so wide logos are fine but very tall logos will be cropped.

---

## 8. Public Component — `<Navbar />`

File: [`src/components/layout/navbar.tsx`](../src/components/layout/navbar.tsx)

### Props

```typescript
interface NavbarProps {
  links?: NavbarLink[];          // defaults to the 4 hardcoded fallbacks
  logoUrl?: string | null;       // null → text wordmark fallback
  logoAlt?: string | null;       // null → SITE_NAME
}

interface NavbarLink {
  id?: string;
  title: string;
  href: string;
}
```

### Style notes
- **Position:** `fixed top-0 z-50 w-full` — overlays the page, no layout shift.
- **Background:** `bg-transparent`. Pages should provide their own dark hero so white text is readable.
- **Scroll behavior:** `useScroll(40)` adds `border-b border-white/10 backdrop-blur-xl` once the user scrolls past 40 px (no solid colour — it's a glass effect).
- **Height:** `h-14` mobile / `lg:h-16` desktop.
- **Mobile menu:** inline `<div>` with `max-h` transition — no `<Sheet>` portal, no extra files.

### Mounting in a page

```tsx
import { Navbar } from '@/components/layout';
import { getVisibleNavLinks, getNavbarSetting } from '@/modules/navbar';

export default async function HomePage() {
  const [navLinks, navSetting] = await Promise.all([
    getVisibleNavLinks(),
    getNavbarSetting(),
  ]);

  return (
    <Navbar
      links={navLinks.length ? navLinks : undefined}
      logoUrl={navSetting.logoUrl}
      logoAlt={navSetting.logoAlt}
    />
  );
}
```

---

## 9. Postman Testing

### 9.1 Fetch public nav links (no auth)
```
GET http://localhost:3000/api/navbar
```

### 9.2 Fetch logo settings (no auth)
```
GET http://localhost:3000/api/navbar/settings
```

### 9.3 Log in as admin
Easiest: log in via browser at `/admin/login`, copy the `authjs.session-token` cookie, reuse it in Postman.

### 9.4 Create a new link
```
POST http://localhost:3000/api/navbar
Content-Type: application/json
Cookie: authjs.session-token=<token>

{ "title": "Blog", "href": "/blog", "sortOrder": 4, "isVisible": true }
```

### 9.5 Update a link
First grab its id:
```
GET http://localhost:3000/api/navbar?all=true
```
Then:
```
PUT http://localhost:3000/api/navbar/<id>
Content-Type: application/json
Cookie: authjs.session-token=<token>

{ "title": "Our Story", "href": "/our-essence" }
```

### 9.6 Toggle hidden
```
PUT http://localhost:3000/api/navbar/<id>
Content-Type: application/json

{ "isVisible": false }
```

### 9.7 Delete a link
```
DELETE http://localhost:3000/api/navbar/<id>
```

### 9.8 Update the brand logo
```
PUT http://localhost:3000/api/navbar/settings
Content-Type: application/json
Cookie: authjs.session-token=<token>

{
  "logoUrl": "/images/1776235176553-jivo-logo.webp",
  "logoAlt": "Jivo Wellness"
}
```

### 9.9 Clear the logo (fall back to text wordmark)
```
PUT http://localhost:3000/api/navbar/settings
Content-Type: application/json

{ "logoUrl": null }
```

---

## 10. Seeding

Run:
```bash
npm run db:seed
```

This seeds (idempotent — safe to re-run):
- The four default links from the brand screenshot:
  - **Products** → `/products` (sort 0)
  - **Our Essence** → `/our-essence` (sort 1)
  - **Media** → `/media` (sort 2)
  - **Community** → `/community` (sort 3)
- The seed script does **not** preset a logo — upload one from `/admin/navbar` after first boot. Until then the navbar shows the `Jivo Wellness` text wordmark.

---

## 11. Extending / Next Steps

- **Reorder via drag-and-drop** — the table currently uses a numeric `sortOrder` field. Wire `@dnd-kit` to it and PATCH the new orders in bulk.
- **Per-link icons** — add an optional `icon` column (Lucide name) to `NavLink`, render it left of the label in the public nav.
- **Submenus / dropdowns** — extend `NavLink` with `parentId String?` for self-referencing tree relations, then render nested `<Popover>` panels in `navbar.tsx`.
- **Multiple logos** — split `NavbarSetting` into `logoLight` / `logoDark` if you ever switch the navbar to a light theme on inner pages.
- **Public site-wide layout** — currently the Navbar is mounted inside `(public)/page.tsx`. When `(public)/layout.tsx` is added, move the data fetch + `<Navbar />` mount up there so every public route gets it for free.
