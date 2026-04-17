# Navbar — Documentation

> **Routes**
> Public: rendered globally inside `/` (and any future page that mounts `<Navbar />`)
> Admin:  `/admin/navbar`
> API:    `/api/navbar`, `/api/navbar/:id`, `/api/navbar/settings`, `/api/navbar/sublinks`, `/api/navbar/sublinks/:id`

---

## 1. Overview

The public navbar is **fully CMS-managed** with a **two-level mega-dropdown** system:

1. **Nav links** — the top-level menu items shown on the right of the bar (e.g. *Our Essence*, *Our Products*, *Jivo Media*, *Community*). Each link is a row in the `NavLink` table.
2. **Sub-links** — dropdown items shown when hovering a top-level link. Each sub-link belongs to a `NavLink` parent via the `NavSubLink` table. This mirrors the footer's `FooterColumn → FooterLink` pattern.
3. **Brand settings** — the logo image and accessible alt text. Stored as a singleton in the `NavbarSetting` table.

### Visual layout

| Slot          | Source                                | Fallback                                       |
|---------------|---------------------------------------|------------------------------------------------|
| Logo          | `NavbarSetting.logoUrl` (uploaded image) | Text wordmark (`SITE_NAME` or `logoAlt`)    |
| Nav items     | `NavLink` rows where `isVisible = true`, ordered by `sortOrder` | Default 4 items |
| Dropdown      | `NavSubLink` rows where `isVisible = true`, grouped under their parent `NavLink` | Empty (no dropdown shown) |
| Mobile        | Same data — top-level links with accordion sub-links | n/a                    |

### Desktop hover behavior

- Hovering a top-level link opens a full-width glass-effect panel below the navbar
- Panel uses `bg-black/20 backdrop-blur-xl backdrop-saturate-150 border-b border-white/10`
- Sub-links arranged in a 2–4 column grid (auto based on count)
- Fade-in animation (translateY + opacity, 200ms)
- 150ms leave delay to prevent flicker when moving cursor from link to panel

### Mobile behavior

- Top-level links render as a list with chevron toggle buttons
- Tapping the chevron expands/collapses that link's sub-links (accordion pattern)
- Sub-links indented with a left border

---

## 2. Database Models

File: [`prisma/schema/navbar.prisma`](../prisma/schema/navbar.prisma)

```prisma
model NavLink {
  id        String       @id @default(cuid())
  title     String       // "Our Essence", "Our Products", "Jivo Media", "Community"
  href      String       // "/our-essence", "/products", "/media", "/community"
  sortOrder Int          @default(0)
  isVisible Boolean      @default(true)
  subLinks  NavSubLink[] // Dropdown sub-items shown on hover
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  @@index([sortOrder])
}

model NavSubLink {
  id        String   @id @default(cuid())
  navLinkId String
  navLink   NavLink  @relation(fields: [navLinkId], references: [id], onDelete: Cascade)
  title     String   // "The Story / Journey", "Canola Oil", etc.
  href      String   // "/our-essence/story", "/products/canola-oil", etc.
  sortOrder Int      @default(0)
  isVisible Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([navLinkId, sortOrder])
}

model NavbarSetting {
  id        String   @id @default("default")  // singleton — only one row
  logoUrl   String?  // Uploaded brand logo
  logoAlt   String?  // Optional alt-text override (defaults to SITE_NAME)
  updatedAt DateTime @updatedAt
}
```

- `NavLink` holds top-level menu items ordered by `sortOrder`.
- `NavSubLink` holds dropdown sub-items, each belonging to a `NavLink`. `onDelete: Cascade` means deleting a NavLink automatically deletes all its sub-links.
- `NavbarSetting` is a **singleton** keyed by `id = "default"`.

---

## 3. File Layout

```
src/modules/navbar/
├── actions.ts                     # Server actions (links + sub-links + settings)
├── validations.ts                 # Zod schemas (link + sub-link + settings)
├── types.ts                       # TypeScript interfaces
└── index.ts                       # Barrel export

src/components/layout/
└── navbar.tsx                     # Client component (desktop dropdown + mobile accordion + glass)

src/app/(public)/home/page-content.tsx  # Fetches links + sub-links + logo, mounts <Navbar />

src/app/admin/(dashboard)/navbar/
└── page.tsx                       # Admin manager (logo card + tab-based link/sub-link UI)

src/app/api/navbar/
├── route.ts                       # GET (list) + POST (create link)
├── [id]/route.ts                  # GET + PUT + DELETE (single link)
├── settings/route.ts              # GET (public) + PUT (admin) singleton brand settings
├── sublinks/route.ts              # POST (create sub-link)
└── sublinks/[id]/route.ts         # PUT + DELETE (single sub-link)

prisma/schema/navbar.prisma        # NavLink + NavSubLink + NavbarSetting models
```

---

## 4. TypeScript Shapes

Defined in [`types.ts`](../src/modules/navbar/types.ts) and validated by Zod in [`validations.ts`](../src/modules/navbar/validations.ts).

### 4.1 `NavLink`

```typescript
interface NavLinkItem {
  id: string;
  title: string;
  href: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
```

### 4.2 `NavSubLink`

```typescript
interface NavSubLinkItem {
  id: string;
  navLinkId: string;
  title: string;
  href: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
```

### 4.3 `NavLinkWithSubLinks`

```typescript
interface NavLinkWithSubLinks extends NavLinkItem {
  subLinks: NavSubLinkItem[];
}
```

### 4.4 `NavbarSetting`

```typescript
interface NavbarSettingItem {
  id: string;
  logoUrl: string | null;
  logoAlt: string | null;
  updatedAt: Date | string;
}
```

---

## 5. API Reference

All routes live under `src/app/api/navbar/`. JSON response shape:

```typescript
{ success: true,  data: T }
{ success: false, error: string, fieldErrors?: Record<string, string[]> }
```

### 5.1 NavLink Endpoints

| Endpoint | Method | Auth | Behavior |
|----------|--------|------|----------|
| `/api/navbar` | GET | No | Returns visible links + visible sub-links. `?all=true` + admin auth → everything. |
| `/api/navbar` | POST | Yes | Create new nav link |
| `/api/navbar/:id` | GET | Yes | Fetch single link with sub-links |
| `/api/navbar/:id` | PUT | Yes | Update link (partial) |
| `/api/navbar/:id` | DELETE | Yes | Delete link (cascade deletes sub-links) |

### 5.2 NavSubLink Endpoints

| Endpoint | Method | Auth | Behavior |
|----------|--------|------|----------|
| `/api/navbar/sublinks` | POST | Yes | Create sub-link (requires valid `navLinkId`) |
| `/api/navbar/sublinks/:id` | PUT | Yes | Update sub-link (can move between parents) |
| `/api/navbar/sublinks/:id` | DELETE | Yes | Delete sub-link |

### 5.3 Settings Endpoints

| Endpoint | Method | Auth | Behavior |
|----------|--------|------|----------|
| `/api/navbar/settings` | GET | No | Get singleton settings |
| `/api/navbar/settings` | PUT | Yes | Update logo + alt text |

---

## 6. Admin Dashboard

**URL:** `/admin/navbar`

### Layout (matches footer admin pattern)

1. **Header** — "Navbar Management" with "View Live Site" + "Add Link" buttons
2. **Stats row** — 4 cards: Total links, Visible, Total sub-links, Hidden
3. **Brand logo card** — Image upload, alt text, live preview, save button
4. **Nav Links & Sub-Links card** — Tab-based management:
   - **Tab strip** — horizontal scrollable tabs for each NavLink, showing visibility dot + title + sub-link count badge
   - **Active link panel** — selected link's details + sub-links table

### Workflow

1. Log in at `/admin/login`.
2. Sidebar → **Navbar**.
3. **Brand logo card**: upload/change logo, edit alt text, save.
4. **Nav Links tab strip**: click a tab to manage that link.
5. **Active link panel**: view/edit the link properties, toggle visibility.
6. **Sub-links table**: add, edit, delete, toggle visibility of dropdown items.
7. **Add Link** button: creates a new top-level NavLink.
8. **Delete** on a NavLink warns that all sub-links will also be deleted (cascade).

### Dialog fields

**NavLink (create/edit):**
| Field | Notes |
|-------|-------|
| Title | 1–60 chars. The visible label. |
| Link (href) | 1–200 chars. Internal path or full URL. |
| Sort order | Integer >= 0. Lower = further left. |
| Visibility | Toggle button. |

**NavSubLink (create/edit):**
| Field | Notes |
|-------|-------|
| Parent link | Dropdown selector choosing which NavLink this belongs to. |
| Title | 1–120 chars. |
| URL / path | 1–300 chars. |
| Sort order | Integer >= 0. Lower = higher in dropdown. |
| Visibility | Toggle button. |

---

## 7. Image Upload (Logo)

Same as before — reuses the project-wide `<ImageUpload>` component posting to `/api/upload`. Recommended: transparent PNG/WebP ~120x40 px.

---

## 8. Public Component — `<Navbar />`

File: [`src/components/layout/navbar.tsx`](../src/components/layout/navbar.tsx)

### Props

```typescript
interface NavbarProps {
  links?: NavbarLink[];
  logoUrl?: string | null;
  logoAlt?: string | null;
}

interface NavbarLink {
  id?: string;
  title: string;
  href: string;
  subLinks?: NavbarSubLink[];
}

interface NavbarSubLink {
  id?: string;
  title: string;
  href: string;
}
```

### Style notes
- **Position:** `fixed top-0 z-50 w-full`
- **Background:** `bg-transparent` with scroll-aware `backdrop-blur-xl`
- **Dropdown panel:** `bg-black/20 backdrop-blur-xl backdrop-saturate-150` — glassmorphism effect matching the navbar itself
- **Height:** `h-14` mobile / `lg:h-16` desktop
- **Desktop dropdown:** full-width panel with 2–4 column grid, fade/slide animation
- **Mobile menu:** inline accordion with expand/collapse per link
- **ChevronDown** icon on links with sub-links, rotates 180deg when open

### Mounting in a page

```tsx
import { Navbar } from '@/components/layout';
import { getVisibleNavLinks, getNavbarSetting } from '@/modules/navbar';

export default async function HomePage() {
  const [navLinks, navSetting] = await Promise.all([
    getVisibleNavLinks(),
    getNavbarSetting(),
  ]);

  const links = navLinks.map((l) => ({
    id: l.id,
    title: l.title,
    href: l.href,
    subLinks: l.subLinks?.map((s) => ({
      id: s.id,
      title: s.title,
      href: s.href,
    })) ?? [],
  }));

  return (
    <Navbar
      links={links.length > 0 ? links : undefined}
      logoUrl={navSetting.logoUrl}
      logoAlt={navSetting.logoAlt}
    />
  );
}
```

---

## 9. Postman Testing

### 9.1 Fetch public nav links with sub-links (no auth)
```
GET http://localhost:3000/api/navbar
```

### 9.2 Create a new sub-link (admin)
```
POST http://localhost:3000/api/navbar/sublinks
Content-Type: application/json
Cookie: authjs.session-token=<token>

{
  "navLinkId": "<parent-nav-link-id>",
  "title": "The Story / Journey",
  "href": "/our-essence/story",
  "sortOrder": 0,
  "isVisible": true
}
```

### 9.3 Update a sub-link
```
PUT http://localhost:3000/api/navbar/sublinks/<id>
Content-Type: application/json
Cookie: authjs.session-token=<token>

{ "title": "Our Story", "sortOrder": 1 }
```

### 9.4 Delete a sub-link
```
DELETE http://localhost:3000/api/navbar/sublinks/<id>
```

### 9.5 Delete a nav link (cascades sub-links)
```
DELETE http://localhost:3000/api/navbar/<id>
```

---

## 10. Seeding

Run:
```bash
npm run db:seed
```

Seeds the four default top-level links. Sub-links should be added via the admin dashboard after first boot.

---

## 11. Extending / Next Steps

- **Reorder via drag-and-drop** — wire `@dnd-kit` to the tab strip and sub-links table for sortOrder changes.
- **Per-sub-link icons** — add an optional `icon` column to `NavSubLink`, render it left of the label in the dropdown.
- **Three-level menus** — extend `NavSubLink` with its own children if needed (not recommended for UX).
- **Multiple logos** — split `NavbarSetting` into `logoLight` / `logoDark` for different page themes.
- **Featured items** — add an `isFeatured` boolean to `NavSubLink` to highlight certain dropdown items.
