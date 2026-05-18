# Jivo Wellness - Master Build Prompt

> **This file is your master instruction set.** Share this with Claude Code in the Jivo Wellness project. When you say "create the home page" or "create the about page", Claude will follow this exact pattern to build everything: module components, Prisma models, admin dashboard page, API routes, and CRUD operations.

---

## Quick Reference

- **Architecture:** See `EXPLAIN.md` for full tech stack, folder structure, and system details
- **Admin Styling:** Follow the existing admin dashboard at `src/app/admin/(dashboard)/layout.tsx` — sidebar, topbar, card-grid boxes, forms, tables
- **Reference:** Use the existing `/admin` page, `/admin/our-essence` page, and admin layout as the source of truth for all admin UI patterns

---

## Project Context

**What:** Rebuild jivo.in (health/wellness products company) as a modern Next.js application with full e-commerce, CMS-powered admin dashboard, blog, and SEO optimization.

**Core Principle:** Every feature is a self-contained module. The admin can manage the ENTIRE website from the dashboard — zero code changes needed for content updates.

---

## Tech Stack (Confirmed)

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript, Turbopack) |
| Database | PostgreSQL + Prisma ORM (native `pg` adapter) |
| Auth | NextAuth v5 (JWT strategy, Credentials + env fallback) |
| UI | shadcn/ui (New York) + Tailwind CSS v4 (oklch) |
| Validation | Zod + React Hook Form (@hookform/resolvers) |
| Rich Text | TipTap v3 (blog/CMS content editing) |
| File Uploads | UploadThing + Sharp (image processing) |
| Rate Limiting | Upstash Redis (@upstash/ratelimit) |
| Animations | Framer Motion + Swiper (carousels) |
| UI State | Redux Toolkit (modals, sidebar, theme) |
| Server State | TanStack React Query (API data, caching) |
| Error Monitoring | Sentry |
| Notifications | Sonner (toasts) |
| Icons | Lucide React |
| Theme | next-themes (dark/light) |
| Formatting | Prettier + prettier-plugin-tailwindcss |

### NOT in this project (removed)
- ~~Razorpay~~ (no payment gateway)
- ~~Resend~~ (no email service)
- ~~Reviews/Ratings~~ (no review system)
- ~~Coupons/Discounts~~ (no coupon system)
- ~~Wishlist~~ (no wishlist feature)
- ~~Search page~~ (no dedicated search)
- ~~Product Variants~~ (single price per product, no 500ml/1L/5L variants)

---

## Architecture: Feature-Module Based

```
src/
  app/           # THIN pages — only routing + imports from modules
  modules/       # FEATURE MODULES — all logic lives here
  components/    # SHARED components (used across 2+ modules)
  lib/           # INFRASTRUCTURE (db, auth, utils, constants)
  store/         # Redux Toolkit (UI state only)
  hooks/         # Shared hooks
  providers/     # React context providers
```

### Module Structure (every module follows this)

```
src/modules/{feature}/
  |-- components/
  |   |-- {Component1}.tsx
  |   |-- {Component2}.tsx
  |   |-- main.tsx              # Main page component (arranges all sections)
  |   |-- index.ts              # Barrel export
  |-- actions.ts                # Server actions (CRUD operations)
  |-- validations.ts            # Zod schemas
  |-- types.ts                  # TypeScript types
  |-- data/
  |   |-- queries.ts            # Database read operations (cached)
  |   |-- mutations.ts          # Database write operations
  |   |-- index.ts
  |-- index.ts                  # Module barrel export
```

### Module Rules

```
RULE 1: A module can import from @/lib/* and @/components/* (shared infra)
RULE 2: A module can import from OTHER modules' index.ts (barrel only)
RULE 3: A module NEVER imports from another module's internal files
RULE 4: If a component is used in 2+ modules → move to @/components/shared/
RULE 5: Every folder has an index.ts barrel export
RULE 6: /app pages are THIN — import from modules, add metadata, return JSX
```

---

## How to Create ANY Page (Master Workflow)

When the user says **"create the {page} page"**, **ALWAYS** produce ALL of the following (non-negotiable deliverables):

1. **Public UI** — the user-facing page with all sections
2. **Prisma model(s)** — data shape + `db:push`
3. **API routes** — public GET + admin CRUD (fully documented)
4. **Admin dashboard page** — tabbed CMS editor with one tab per section
5. **SEO tab** — mandatory extra tab in the admin editor (see §23 SEO System)
6. **Default strong SEO** — baked into module defaults (used when admin hasn't set anything)
7. **Folder structure** — follow `docs/EXPLAIN.md` exactly (§2 Folder Structure)
8. **Lazy-loading setup** — `main.tsx` uses `next/dynamic` for below-the-fold sections (see §24)
9. **Docs MD file** — `docs/{page}.md` with all API URLs, JSON formats, Postman instructions

**Follow these steps IN ORDER:**

### Step 1: Prisma Model

Create/update the model in `prisma/schema/{page}.prisma` for the page's data.

**⚠️ NAMING CONVENTION (MANDATORY):**
- **One table per page/feature** — NEVER use a generic shared table for multiple pages.
- **Table name = page name** — e.g. `HomePage`, `AboutPage`, `ContactPage`, `MediaPage`.
- All sections of a page are rows inside that page's single table (stored as JSON in `content` column).
- No `page` column needed — the table name IS the page.
- Sub-features that need their own table use the page name as prefix — e.g. `HeroSlide` for home carousel slides.
- Site-wide features (navbar, footer, seo) get their own feature-named table — e.g. `NavLink`, `Footer`, `SeoMeta`.

**Pattern for CMS-managed pages:**
```prisma
model HomePage {
  id        String   @id @default(cuid())
  section   String   @unique       // "hero", "categories", "vision_mission", etc.
  title     String?
  content   Json                   // Flexible JSON for any section structure
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([sortOrder])
}
```

**For other pages, follow the same pattern:**
```prisma
model AboutPage {
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

**Also ensure `SeoMeta` exists** (separate model used by `generateMetadata`):
```prisma
model SeoMeta {
  id              String  @id @default(cuid())
  page            String  @unique   // "home", "about", "products", "contact", ...
  metaTitle       String
  metaDescription String? @db.Text
  keywords        String[]          // PostgreSQL text[]
  ogTitle         String?
  ogDescription   String? @db.Text
  ogImage         String?
  twitterCard     String  @default("summary_large_image")
  canonicalUrl    String?
  structuredData  Json?             // JSON-LD
  robots          String  @default("index,follow") // or "noindex,nofollow"
  updatedAt       DateTime @updatedAt
}
```

Then run:
```bash
npm run db:generate
npm run db:push
```

### Step 2: Module — Types

Create `src/modules/{page}/types.ts` with TypeScript interfaces matching the JSON structure of each section. **Always include the `SeoData` type** (imported from `src/modules/seo/types.ts`).

### Step 3: Module — Validations

Create `src/modules/{page}/validations.ts` with Zod schemas for each section. **Always include `seoSchema`** (imported from `src/modules/seo/validations.ts`).

### Step 4: Module — Data Layer

Create `src/modules/{page}/data/queries.ts` (read) and `mutations.ts` (write). Also create `src/modules/{page}/data/defaults.ts` exporting `defaultSeo` (strong fallback SEO) and any default section content.

### Step 5: Module — Server Actions

Create `src/modules/{page}/actions.ts` with CRUD operations (admin-protected). Include `updateSeoMeta()` action.

### Step 6: Module — Components (with Lazy Loading)

Create individual section components + `main.tsx` that arranges them all. **`main.tsx` MUST use `next/dynamic`** for all below-the-fold sections (hero loads eagerly, rest lazy). See §24.

### Step 7: Public Page Folder

Create the page folder **under `(public)`** exactly like `docs/EXPLAIN.md` describes:

```
src/app/(public)/{page}/
  page.tsx           # Thin route handler
  loading.tsx        # Loading skeleton
```

`page.tsx` exports `generateMetadata()` that reads from `SeoMeta` with fallback to `defaultSeo`.

**Home page exception** — home serves `/` so it lives at BOTH:
- `src/app/(public)/home/` — the module's folder (contains `page-content.tsx`, metadata helper, loading skeleton)
- `src/app/(public)/page.tsx` — the root route that re-exports from `(public)/home/`

This keeps home symmetric with every other page.

### Step 8: Admin Dashboard Page

Create `src/app/(admin)/admin/dashboard/{page}/page.tsx` — full CMS editor.

**The tab list MUST end with an `"SEO"` tab** (after all content section tabs) — see §23 for the exact field layout. This is mandatory for every CMS page.

### Step 9: API Routes

Create API routes:
- **Public GET** — `src/app/api/{page}/route.ts`
- **Admin CRUD** — `src/app/api/admin/{page}/route.ts`
- **SEO CRUD** — `src/app/api/admin/seo/[page]/route.ts` (shared endpoint handles any page)

### Step 10: Page-Specific MD File

Create `docs/{page}.md` with API URLs, JSON data format (including SEO JSON shape), CRUD details, and Postman instructions.

---

### Pages Excluded From the SEO Tab

Do **NOT** add an SEO tab/entry for these (they aren't indexed pages):

- `navbar` (shared chrome, not a page)
- `footer` (shared chrome, not a page)
- All routes under `/admin/dashboard/**` (private, `noindex`)
- All routes under `/api/**`
- Auth pages (`/login`, `/signup`, `/admin/login`) — `noindex` by default, no admin SEO tab needed

All other public routes **MUST** have an SEO entry.

---

## Admin Dashboard Design (Self-Referencing — No External Projects)

All admin UI patterns come from the existing code in THIS project. Do NOT reference `mera-pind-balle-balle` or any external project.

### Dashboard Layout (`src/app/admin/(dashboard)/layout.tsx`)

- `"use client"` component
- Fixed 256px sidebar on left (`w-64 bg-card border-r shadow-sm`)
- Mobile: hamburger → slide-in sidebar with backdrop overlay (`bg-black/40`)
- Sidebar header: Back arrow (link to `/`) + "Admin Panel" title + close button (mobile)
- Styled scrollbar: thin 6px, rounded thumb, hover darkens
- Main content area: `flex-1 md:ml-64 min-w-0`
- Mobile topbar: `sticky top-0 z-20 h-14 border-b bg-background/95 backdrop-blur`
- Desktop topbar: `sticky top-0 z-20 h-12 border-b bg-background/95 backdrop-blur`
- Both topbars have: `ModeToggle` (dark/light) + `Logout` button
- Content area: `<main className="p-4 sm:p-6">{children}</main>`

### Sidebar Structure (Dropdown Sections)

Every sidebar item is a **dropdown section** with a consistent pattern:
- Section header: icon + title (links to hub page) + chevron toggle (expands/collapses)
- Active state: `bg-primary text-primary-foreground`
- Hover state: `hover:bg-accent text-foreground/80 hover:text-foreground`
- Children: indented with `border-l`, smaller text `text-[13px]`
- Active child: `bg-primary/15 text-primary`
- Auto-expand: whichever section contains the current page auto-expands on mount

```tsx
const SIDEBAR: NavSection[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    children: [
      { title: 'Home Page', href: '/admin/home', icon: Home },
      { title: 'Navbar', href: '/admin/navbar', icon: Navigation },
      { title: 'Footer', href: '/admin/footer', icon: PanelBottom },
    ],
  },
  {
    title: 'Our Essence',
    href: '/admin/our-essence',
    icon: Sparkles,
    children: [
      { title: 'The Story', href: '/admin/our-essence-the-story', icon: BookOpen },
    ],
  },
  { title: 'Our Products', href: '/admin/our-products', icon: Package, children: [] },
  { title: 'Jivo Media', href: '/admin/media', icon: Newspaper, children: [] },
  { title: 'Community', href: '/admin/community', icon: Users, children: [] },
  { title: 'SEO Manager', href: '/admin/seo', icon: Globe, children: [] },
];
```

**SEO Manager is a separate top-level section** (not nested under Dashboard) because it manages SEO across ALL pages site-wide.

### Adding a New Page to the Sidebar

When building a new page, add it as a child of the appropriate section:
1. Open `src/app/admin/(dashboard)/layout.tsx`
2. Find the relevant section in `SIDEBAR`
3. Add `{ title: 'Page Name', href: '/admin/page-route', icon: IconName }` to its `children`
4. Add the same page entry to the section's hub page (e.g., `src/app/admin/(dashboard)/our-essence/page.tsx` → `SECTION_PAGES` array)

### Section Hub Pages (Dashboard for each nav section)

Each sidebar section links to a **hub page** with this consistent layout:
1. Colored section label (uppercase, tracking-widest)
2. Title heading (font-jost-bold, centered)
3. Subtitle with description
4. Search bar (filters pages by name + description)
5. Section icon + "Pages" or "Global Pages" heading
6. Card grid (2×2 mobile → 3-col tablet → 4-col desktop)

### Card Grid Box Styling (MANDATORY for all admin hubs)

```tsx
<Link
  href={page.href}
  className="group relative flex flex-col items-center justify-center gap-3
    overflow-hidden rounded-2xl border bg-card p-6 text-center
    transition-all duration-300 hover:-translate-y-1.5
    hover:border-primary/30 hover:shadow-lg"
>
  {/* Gradient overlay on hover */}
  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5
    opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

  {/* Icon */}
  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl
    bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
    <Icon size={24} className="text-primary" />
  </div>

  {/* Label + description */}
  <div className="relative z-10">
    <span className="text-sm font-semibold text-foreground
      transition-colors duration-200 group-hover:text-primary">{page.label}</span>
    <p className="mt-1 text-[11px] leading-tight text-muted-foreground">{page.description}</p>
  </div>
</Link>
```

Each page entry needs: `label`, `href`, `icon`, `description`, `color` (gradient classes).

### Admin Page Patterns

**Pattern A: CMS Page Editor (Home, About, etc.)**
- Tabbed form interface (one tab per section)
- Each tab has form fields matching the section's JSON structure
- Image upload buttons (UploadThing)
- "Save Changes" button at top-right AND bottom
- Loading state with `<Loader className="animate-spin" />`
- Success/error alerts with `bg-primary/10 border-primary/30` and `bg-destructive/10 border-destructive/30`
- Reset button to clear form
- **Always ends with an `"SEO"` tab** (last tab) — fields: Meta Title, Meta Description, Keywords (tag input), OG Title, OG Description, OG Image (UploadThing), Twitter Card (select), Canonical URL, Structured Data (JSON textarea), Robots (select: `index,follow` / `noindex,nofollow`). Save button for SEO tab calls the **SEO-specific** server action (`updateSeoMeta(page, data)`).

**Pattern B: CRUD Manager (Products, Blogs, etc.)**
- Header: Title + count + "Add New" button
- Filters row (category, status, etc.)
- Card grid or DataTable for items
- Dialog (shadcn/ui) for create/edit forms
- Delete with confirmation
- Toggle active/inactive from list view
- Toast notifications via Sonner

**Pattern C: Read-Only Manager (Contact Leads, Newsletter, Careers)**
- DataTable with columns
- Read/unread status toggle
- Detail dialog on row click
- Export to Excel (optional)

---

## Example: Home Page (Complete Walkthrough)

This is the reference implementation. Every other page follows this same pattern.

### 1. Prisma Model (already exists as PageContent)

The home page uses `PageContent` with `page: "home"` and different sections:

```
Sections: hero, mission, featured-products, health-benefits, testimonials, cta
```

### 2. Types (`src/modules/home/types.ts`)

```typescript
export interface HeroSection {
  title: string;
  subtitle: string;
  image: string;
  primaryCTA: { label: string; link: string };
  secondaryCTA: { label: string; link: string };
}

export interface MissionSection {
  title: string;
  description: string;
  image: string;
  stats: { label: string; value: string }[];
}

export interface HealthBenefit {
  title: string;
  description: string;
  icon: string;
}

export interface HealthBenefitsSection {
  title: string;
  subtitle: string;
  benefits: HealthBenefit[];
}

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  avatar: string;
}

export interface TestimonialsSection {
  title: string;
  testimonials: Testimonial[];
}

export interface CTASection {
  title: string;
  description: string;
  buttonText: string;
  link: string;
  image: string;
}

export interface HomePageData {
  hero: HeroSection;
  mission: MissionSection;
  healthBenefits: HealthBenefitsSection;
  testimonials: TestimonialsSection;
  cta: CTASection;
}
```

### 3. Validations (`src/modules/home/validations.ts`)

```typescript
import { z } from "zod";

export const heroSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().min(1, "Subtitle is required"),
  image: z.string().min(1, "Image is required"),
  primaryCTA: z.object({
    label: z.string().min(1),
    link: z.string().min(1),
  }),
  secondaryCTA: z.object({
    label: z.string().min(1),
    link: z.string().min(1),
  }),
});

export const missionSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  image: z.string().min(1),
  stats: z.array(z.object({
    label: z.string().min(1),
    value: z.string().min(1),
  })),
});

export const healthBenefitsSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  benefits: z.array(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    icon: z.string().min(1),
  })),
});

export const testimonialsSchema = z.object({
  title: z.string().min(1),
  testimonials: z.array(z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    quote: z.string().min(1),
    avatar: z.string().optional().default(""),
  })),
});

export const ctaSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  buttonText: z.string().min(1),
  link: z.string().min(1),
  image: z.string().optional().default(""),
});
```

### 4. Data Layer (`src/modules/home/data/queries.ts`)

```typescript
import { prisma } from "@/lib/db";

export async function getHomePageData() {
  const sections = await prisma.pageContent.findMany({
    where: { page: "home", isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const data: Record<string, any> = {};
  for (const section of sections) {
    data[section.section] = section.content;
  }
  return data;
}

export async function getHomeSection(section: string) {
  return prisma.pageContent.findUnique({
    where: { page_section: { page: "home", section } },
  });
}
```

### 5. Server Actions (`src/modules/home/actions.ts`)

```typescript
"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateHomeSection(section: string, content: any) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.pageContent.upsert({
      where: { page_section: { page: "home", section } },
      update: { content, updatedAt: new Date() },
      create: { page: "home", section, content },
    });

    revalidatePath("/");
    revalidatePath("/admin/dashboard/home");
    return { success: true };
  } catch (error) {
    console.error("[updateHomeSection]", error);
    return { error: "Failed to update section" };
  }
}
```

### 6. Components (`src/modules/home/components/`)

**Individual section files:**
- `hero-section.tsx` — Hero with image, title, subtitle, CTAs (Swiper if carousel)
- `mission-section.tsx` — Mission/vision with stats
- `featured-products.tsx` — Product cards (imports from products module)
- `health-benefits.tsx` — Grid of benefit cards with icons
- `testimonials-section.tsx` — Testimonial carousel (Swiper)
- `cta-section.tsx` — Closing CTA with background image

**Main component (`main.tsx`):**
```tsx
import HeroSection from "./hero-section";
import MissionSection from "./mission-section";
import FeaturedProducts from "./featured-products";
import HealthBenefits from "./health-benefits";
import TestimonialsSection from "./testimonials-section";
import CTASection from "./cta-section";
import type { HomePageData } from "../types";

export default function HomePageContent({ data }: { data: HomePageData }) {
  return (
    <main className="flex flex-col">
      <HeroSection data={data.hero} />
      <MissionSection data={data.mission} />
      <FeaturedProducts />
      <HealthBenefits data={data.healthBenefits} />
      <TestimonialsSection data={data.testimonials} />
      <CTASection data={data.cta} />
    </main>
  );
}
```

**Barrel export (`index.ts`):**
```typescript
export { default as HomePageContent } from "./main";
export { default as HeroSection } from "./hero-section";
// ... etc
```

### 7. Public Page (`src/app/(public)/page.tsx`)

```tsx
import { getHomePageData } from "@/modules/home/data/queries";
import { HomePageContent } from "@/modules/home";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Jivo Wellness - India's Largest Cold Press Canola Oil Seller",
  description: "Premium cold press oils, superfoods & wellness products.",
};

export default async function HomePage() {
  const data = await getHomePageData();
  return <HomePageContent data={JSON.parse(JSON.stringify(data))} />;
}
```

### 8. Admin Dashboard Page (`src/app/(admin)/admin/dashboard/home/page.tsx`)

**IMPORTANT: Follow the EXACT admin styling from the existing admin dashboard in this project.**

```tsx
"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Upload, Loader } from "lucide-react";
import { toast } from "sonner";

export default function HomePageManager() {
  const [formData, setFormData] = useState({ /* initial state matching types */ });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("hero");

  // Load data on mount
  useEffect(() => {
    fetch("/api/home").then(r => r.json()).then(data => {
      if (data.success) setFormData(data.data);
      setLoadingData(false);
    });
  }, []);

  // Save handler
  async function handleSave() {
    setLoading(true);
    const res = await fetch("/api/admin/home", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ section: activeTab, content: formData[activeTab] }),
    });
    const data = await res.json();
    if (data.success) toast.success("Section updated!");
    else toast.error(data.error || "Failed to save");
    setLoading(false);
  }

  // Tab-based editor UI (matches existing admin page editor pattern)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Homepage Manager</h1>
          <p className="text-muted-foreground mt-1">Manage all home page sections</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg font-medium transition"
        >
          {loading ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>

      {/* Tabs */}
      <div className="border rounded-lg bg-card">
        <div className="flex overflow-x-auto border-b">
          {["hero", "mission", "health-benefits", "testimonials", "cta"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")}
            </button>
          ))}
        </div>

        {/* Tab content — form fields for active section */}
        <div className="p-6 space-y-6">
          {/* Render form fields based on activeTab */}
          {/* See src/app/admin/(dashboard)/home/page.tsx for exact field patterns */}
        </div>
      </div>
    </div>
  );
}
```

### 9. API Routes

**Public GET** (`src/app/api/home/route.ts`):
```tsx
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const sections = await prisma.pageContent.findMany({
    where: { page: "home", isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const data: Record<string, any> = {};
  for (const s of sections) data[s.section] = s.content;

  return NextResponse.json({ success: true, data });
}
```

**Admin CRUD** (`src/app/api/admin/home/route.ts`):
```tsx
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user || !["ADMIN","SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sections = await prisma.pageContent.findMany({
    where: { page: "home" },
    orderBy: { sortOrder: "asc" },
  });

  const data: Record<string, any> = {};
  for (const s of sections) data[s.section] = s.content;

  return NextResponse.json({ success: true, data });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !["ADMIN","SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { section, content } = await req.json();

  const result = await prisma.pageContent.upsert({
    where: { page_section: { page: "home", section } },
    update: { content, updatedAt: new Date() },
    create: { page: "home", section, content },
  });

  return NextResponse.json({ success: true, data: result });
}
```

## 📄 PAGE DOCUMENTATION SYSTEM (UPDATED - MANDATORY)

### 🚨 CRITICAL RULE

❌ DO NOT create:

* plan.md
* multiple documentation files

✅ ONLY create ONE file per page:

```
docs/{page}.md
```

---

## 🎯 PURPOSE

This file must help ANY developer:

* understand page structure
* understand API flow
* understand UI rendering
* understand SEO
* manage updates easily

---

## 📦 REQUIRED CONTENT (MANDATORY)

Each `{page}.md` MUST include:

---

### 1. 📌 PAGE OVERVIEW

* Page name
* Route
* Admin route
* Sections list

Example:

```
Page: Home
Route: /
Admin: /admin/dashboard/home

Sections:
- hero
- mission
- testimonials
```

---

### 2. 🧠 UI STRUCTURE (VERY IMPORTANT)

Explain what user sees on screen:

Example:

```
Hero Section:
- Title (big heading)
- Subtitle
- Background image
- Two buttons (Shop Now, Learn More)

Mission Section:
- Left image
- Right text
- Stats cards
```

👉 Based on screenshot/design

---

### 3. 🔌 API DOCUMENTATION (DETAILED)

#### Public API

```
GET /api/{page}
```

✔ Include EXACT response JSON

---

#### Admin API

```
POST /api/admin/{page}
```

✔ Include:

* request body
* response
* section-wise example

---

### 4. 🔄 WORKFLOW (MOST IMPORTANT)

Explain full data flow:

```
Admin updates section →
API call →
Data saved in DB →
Page revalidated →
User sees updated UI
```

👉 Step-by-step

---

### 5. 🧾 DATA STRUCTURE

Explain JSON per section:

Example:

```
hero:
- title: string
- subtitle: string
- image: string
```

---

### 6. 🖼 IMAGE HANDLING

Explain:

* stored in `/uploads/images`
* served via `/api/uploads/[filename]`
* fallback logic

---

### 7. 🔍 SEO DOCUMENTATION (MANDATORY)

Include:

```
metaTitle
metaDescription
keywords
ogImage
canonical
structuredData
```

Explain:

* where stored (SeoMeta)
* how used (generateMetadata)

---

### 8. 🧪 POSTMAN TESTING

Step-by-step:

1. Login
2. Get API
3. Update section

---

### 9. 🔄 UPDATE LOG (VERY IMPORTANT)

Whenever page changes:

```
[DATE]

- Added new section: FAQ
- Updated hero structure
- Changed API response
```

👉 This MUST be updated on every change

---

## 🚫 FORBIDDEN

Claude MUST NOT:

* create multiple docs
* skip workflow
* skip UI explanation
* skip SEO section
* write incomplete API

---

## 🎯 FINAL GOAL

* Any developer can manage project easily
* No confusion in API/UI
* Clear system understanding
* Easy maintenance

---


**Response:** { "success": true, "data": { ... } }

## Postman Testing

### 1. Get home page data (public)
GET http://localhost:3000/api/home

### 2. Login as admin (get session cookie)
POST http://localhost:3000/api/auth/callback/credentials
Body: { "email": "admin@jivo.in", "password": "admin123" }

### 3. Update hero section
POST http://localhost:3000/api/admin/home
Headers: Cookie: next-auth.session-token=...
Body: { "section": "hero", "content": { ... } }

### 4. Update mission section
POST http://localhost:3000/api/admin/home
Body: { "section": "mission", "content": { ... } }

## Admin Dashboard
Path: /admin/dashboard/home
Features: Tabbed editor for each section (Hero, Mission, Health Benefits, Testimonials, CTA)
Each tab has form fields matching the section JSON structure.
Images uploaded via UploadThing.
Save button updates the database and revalidates the public page.
```

---

## All Pages to Build (in order)

Create a `docs/{page}.md` file for each page following the same pattern as `docs/home.md` above.

### Public Pages (with admin CMS)

| # | Page | Route | Admin Route | Sections |
|---|------|-------|-------------|----------|
| 1 | **Home** | `/` | `/admin/dashboard/home` | hero, mission, featured-products, health-benefits, testimonials, cta |
| 2 | **About (Who We Are)** | `/about` | `/admin/dashboard/about` | hero, story, team, values, timeline |
| 3 | **Products** | `/products` | `/admin/dashboard/products` | CRUD: product listing, categories, images, price, stock |
| 4 | **Product Detail** | `/product/[slug]` | (same products CRUD) | gallery, description, benefits, certifications, add-to-cart |
| 5 | **Blog** | `/blog` | `/admin/dashboard/blogs` | CRUD: blog posts with TipTap editor, tags, SEO |
| 6 | **Blog Post** | `/blog/[slug]` | (same blogs CRUD) | content, author, tags, related posts |
| 7 | **Contact** | `/contact` | `/admin/dashboard/contact` | contact form + admin views submissions |
| 8 | **Careers** | `/careers` | `/admin/dashboard/careers` | job listings + application form, admin views applications |
| 9 | **Cart** | `/cart` | - | cart items, quantity controls, proceed to checkout |
| 10 | **Checkout** | `/checkout` | - | address form, order summary, place order |
| 11 | **Order Success** | `/order-success/[id]` | - | order confirmation details |
| 12 | **Orders (User)** | `/orders` | `/admin/dashboard/orders` | user: order history. admin: manage all orders |
| 13 | **Privacy Policy** | `/privacy-policy` | `/admin/dashboard/settings` | CMS-managed legal content |
| 14 | **Terms & Conditions** | `/terms-conditions` | `/admin/dashboard/settings` | CMS-managed legal content |
| 15 | **Login** | `/login` | - | user login form |
| 16 | **Signup** | `/signup` | - | user registration form |
| 17 | **Admin Login** | `/admin/login` | - | admin login form |

### Admin-Only Pages (no public route)

| # | Page | Admin Route | Purpose |
|---|------|-------------|---------|
| 18 | **Dashboard Home** | `/admin/dashboard` | Stats cards, quick links |
| 19 | **Navbar Manager** | `/admin/dashboard/navbar` | Add/remove/reorder nav links |
| 20 | **SEO Manager** | `/admin/dashboard/seo` | Per-page SEO metadata |
| 21 | **Site Settings** | `/admin/dashboard/settings` | Key-value global config |
| 22 | **Newsletter** | `/admin/dashboard/newsletter` | View/export subscribers |
| 23 | **Media Library** | `/admin/dashboard/uploads` | Browse/delete uploaded images |

---

## Prisma Schema (Complete)

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ---- ENUMS ----

enum UserRole {
  CUSTOMER
  ADMIN
  SUPER_ADMIN
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

// ---- USER & AUTH ----

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String
  phone         String?
  role          UserRole  @default(CUSTOMER)
  emailVerified DateTime?
  image         String?
  addresses     Address[]
  orders        Order[]
  cartItems     CartItem[]
  accounts      Account[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  @@unique([provider, providerAccountId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

// ---- PRODUCTS ----

model Product {
  id              String         @id @default(cuid())
  name            String
  slug            String         @unique
  description     String         @db.Text
  benefits        String?        @db.Text
  certifications  String?
  sku             String?        @unique
  price           Decimal        @db.Decimal(10,2)
  salePrice       Decimal?       @db.Decimal(10,2)
  stock           Int            @default(0)
  weight          String?
  metaTitle       String?
  metaDescription String?
  isActive        Boolean        @default(true)
  isFeatured      Boolean        @default(false)
  categoryId      String?
  category        Category?      @relation(fields: [categoryId], references: [id])
  images          ProductImage[]
  orderItems      OrderItem[]
  cartItems       CartItem[]
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  @@index([categoryId])
  @@index([isActive, isFeatured])
  @@index([createdAt(sort: Desc)])
}

model ProductImage {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  alt       String?
  sortOrder Int     @default(0)

  @@index([productId])
}

model Category {
  id       String    @id @default(cuid())
  name     String    @unique
  slug     String    @unique
  image    String?
  isActive Boolean   @default(true)
  products Product[]
}

// ---- CART ----

model CartItem {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int     @default(1)

  @@unique([userId, productId])
  @@index([userId])
}

// ---- ORDERS ----

model Order {
  id              String        @id @default(cuid())
  orderNumber     String        @unique
  userId          String
  user            User          @relation(fields: [userId], references: [id])
  items           OrderItem[]
  subtotal        Decimal       @db.Decimal(10,2)
  shippingCost    Decimal       @db.Decimal(10,2) @default(0)
  discount        Decimal       @db.Decimal(10,2) @default(0)
  total           Decimal       @db.Decimal(10,2)
  status          OrderStatus   @default(PENDING)
  paymentStatus   PaymentStatus @default(PENDING)
  paymentMethod   String?
  shippingAddress Json
  estimatedDelivery DateTime?
  notes           String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([userId])
  @@index([status])
  @@index([paymentStatus])
  @@index([createdAt(sort: Desc)])
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  name      String
  price     Decimal @db.Decimal(10,2)
  quantity  Int

  @@index([orderId])
}

// ---- CMS ----

model PageContent {
  id        String   @id @default(cuid())
  page      String
  section   String
  title     String?
  content   Json
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([page, section])
  @@index([page, sortOrder])
}

model NavLink {
  id        String  @id @default(cuid())
  title     String
  href      String
  isVisible Boolean @default(true)
  sortOrder Int     @default(0)
}

model SiteSetting {
  id    String @id @default(cuid())
  key   String @unique
  value String @db.Text
}

model SeoMeta {
  id              String  @id @default(cuid())
  page            String  @unique
  title           String
  description     String? @db.Text
  ogImage         String?
  structuredData  Json?
}

// ---- BLOG ----

model BlogPost {
  id              String    @id @default(cuid())
  title           String
  slug            String    @unique
  excerpt         String?   @db.Text
  content         String    @db.Text
  coverImage      String?
  author          String    @default("Jivo Wellness")
  tags            String[]
  isPublished     Boolean   @default(false)
  metaTitle       String?
  metaDescription String?
  publishedAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([isPublished, publishedAt(sort: Desc)])
}

// ---- CONTACT / CAREERS / NEWSLETTER ----

model ContactInquiry {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String?
  subject   String?
  message   String   @db.Text
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([isRead, createdAt(sort: Desc)])
}

model JobApplication {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String
  position  String
  resume    String?
  message   String?  @db.Text
  createdAt DateTime @default(now())

  @@index([createdAt(sort: Desc)])
}

model NewsletterSubscriber {
  id        String   @id @default(cuid())
  email     String   @unique
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}

model Address {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  label     String?
  line1     String
  line2     String?
  city      String
  state     String
  pincode   String
  phone     String?
  isDefault Boolean @default(false)
}
```
## 🌐 SITEMAP & ROBOTS SYSTEM (MANDATORY)

### Goal

Every public page created in the project must be automatically included in the sitemap without manual updates.

---

## ✅ SINGLE FILE RULE

* Only ONE sitemap:

  ```
  /sitemap.xml
  ```

* Only ONE robots file:

  ```
  /robots.txt
  ```

---

## ⚙️ BASE URL RULE (IMPORTANT)

The project MUST use environment-based URL.

```js
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://jivo.in";
```

👉 Always use `BASE_URL` instead of hardcoding domain.

---

## ⚙️ SITEMAP GENERATION RULE

The project MUST use dynamic sitemap generation.

### Implementation:

* File location:

  ```
  src/app/sitemap.ts
  ```

* The sitemap must include:

  1. Static routes (home, about, contact, etc.)
  2. Dynamic routes (products, blog posts, etc.) from database

---

## 🧩 SITEMAP STRUCTURE RULE

Every time a new page is created:

### 1. Static Page

If page is static:

Example:

```
/about
/contact
/blog
```

👉 Add route inside sitemap static array using BASE_URL:

```js
{
  url: `${BASE_URL}/about`
}
```

---

### 2. Dynamic Page

If page uses database (Product, Blog):

👉 Fetch data from DB and map:

```js
products.map(product => ({
  url: `${BASE_URL}/product/${product.slug}`
}))
```

---

## ❌ EXCLUDED FROM SITEMAP

DO NOT include:

* /admin/**
* /api/**
* /login, /signup
* /cart, /checkout
* /orders

---

## 🤖 ROBOTS.TXT RULE

* File location:

  ```
  src/app/robots.ts
  ```

* Must always:

  * Allow all public pages
  * Block private routes
  * Reference sitemap using BASE_URL

Example:

```js
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://jivo.in";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

---

## 🔗 SITEMAP LINKING RULE

robots.txt MUST dynamically include:

```js
sitemap: `${BASE_URL}/sitemap.xml`
```

---

## 🔄 AUTO UPDATE RULE

When a new page/module is created:

* If static → add route in sitemap static list
* If dynamic → ensure DB query is included in sitemap

👉 Developer MUST NOT forget this step

---

## 🎯 FINAL GOAL

* All public pages are indexed by Google
* No private pages are indexed
* Sitemap stays always updated automatically
* Domain works correctly in dev + production

---

---

## Environment Variables

```env
NODE_ENV="development"

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/jivo_db"

# Auth
AUTH_SECRET="your-secret-key-min-32-characters"
AUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@jivo.in"
ADMIN_PASSWORD="admin123"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# File Upload
UPLOADTHING_TOKEN="your-uploadthing-token"

# Rate Limiting (optional)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Error Monitoring (optional)
NEXT_PUBLIC_SENTRY_DSN="https://xxx@sentry.io/xxx"
```

---

## NPM Scripts

```json
{
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "format": "prettier --write .",
  "analyze": "ANALYZE=true next build",
  "db:generate": "prisma generate",
  "db:push": "prisma db push",
  "db:seed": "npx tsx prisma/seed.ts",
  "db:studio": "prisma studio"
}
```

---

## How the Admin Uses the Dashboard

1. **Admin logs in** at `/admin/login` with email + password
2. **Dashboard home** shows stats (total products, orders today, revenue)
3. **Click any sidebar link** to manage that section
4. **Example: Edit Home Page**
   - Click "Home Page" in sidebar
   - Switch tabs: Hero, Mission, Health Benefits, Testimonials, CTA
   - Edit text fields, upload images
   - Click "Save Changes" → data saved to PostgreSQL → public page updated instantly
5. **Example: Add Product**
   - Click "Products" → "Add Product"
   - Fill form: name, price, stock, description, category, images
   - Click "Save" → product appears on public `/products` page
6. **Example: Manage Orders**
   - Click "Orders" → see all orders in table
   - Click an order → see details, update status (PENDING → CONFIRMED → SHIPPED → DELIVERED)
7. **No code changes needed** — everything is database-driven

---

## §23 SEO System (Mandatory for Every Public Page)

### Goal

Every public page the site creates must have **strong default SEO** out of the box, editable by the admin from the per-page admin editor. No page ships without SEO.

### Storage

- **`SeoMeta` table** — one row per page, keyed by `page` (e.g., `"home"`, `"about"`, `"products"`, `"blog"`, `"contact"`, `"careers"`, `"privacy-policy"`, `"terms-conditions"`, `"product:{slug}"`, `"blog:{slug}"`).
- Product & blog detail pages use their own SEO fields (`metaTitle`, `metaDescription` already on `Product`/`BlogPost`) — the admin edits SEO inline within the product/blog edit form (not in `SeoMeta`).

### Fallback chain (resolving SEO at request time)

```
1. DB row in SeoMeta for this page      → use if found
2. Module's defaultSeo (in data/defaults.ts)  → use if no DB row
3. Site-wide default in src/lib/seo.ts  → final fallback (title, description, OG image)
```

### Shared SEO module (`src/modules/seo/`)

Create once, reused by every page:

```
src/modules/seo/
  |-- types.ts            # SeoData interface + SeoFormData
  |-- validations.ts      # seoSchema (Zod)
  |-- actions.ts          # updateSeoMeta(page, data), getSeoMeta(page)
  |-- data/
  |   |-- queries.ts      # getSeoByPage, getAllSeo
  |   |-- defaults.ts     # siteDefaultSeo (absolute fallback)
  |-- components/
  |   |-- SeoTabPanel.tsx # Reusable admin form component for any page's SEO tab
  |   |-- index.ts
  |-- utils.ts            # resolveSeo(page): builds final Metadata with fallbacks
  |-- index.ts            # Barrel
```

### `resolveSeo()` helper — used by every `generateMetadata`

```ts
// src/modules/seo/utils.ts
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { siteDefaultSeo } from "./data/defaults";

export async function resolveSeo(
  page: string,
  moduleDefault?: Partial<SeoData>
): Promise<Metadata> {
  const dbSeo = await prisma.seoMeta.findUnique({ where: { page } });
  const merged = { ...siteDefaultSeo, ...moduleDefault, ...(dbSeo ?? {}) };

  return {
    title: merged.metaTitle,
    description: merged.metaDescription,
    keywords: merged.keywords,
    alternates: merged.canonicalUrl ? { canonical: merged.canonicalUrl } : undefined,
    openGraph: {
      title: merged.ogTitle ?? merged.metaTitle,
      description: merged.ogDescription ?? merged.metaDescription,
      images: merged.ogImage ? [{ url: merged.ogImage }] : [],
      type: "website",
    },
    twitter: {
      card: merged.twitterCard,
      title: merged.ogTitle ?? merged.metaTitle,
      description: merged.ogDescription ?? merged.metaDescription,
      images: merged.ogImage ? [merged.ogImage] : undefined,
    },
    robots: merged.robots,
    other: merged.structuredData
      ? { "script:ld+json": JSON.stringify(merged.structuredData) }
      : undefined,
  };
}
```

### Every public page uses it

```tsx
// src/app/(public)/about/page.tsx
import { resolveSeo } from "@/modules/seo";
import { defaultSeo as aboutDefaultSeo } from "@/modules/about/data/defaults";

export async function generateMetadata() {
  return resolveSeo("about", aboutDefaultSeo);
}
```

### Admin SEO tab (reused in every page editor)

The admin CMS page imports `<SeoTabPanel page="home" />` as its final tab. The component owns its own fetch/save logic — the page-level Save button does not need to know about SEO internals.

### Default strong SEO template (per-module)

Every module's `data/defaults.ts` exports:

```ts
export const defaultSeo: SeoData = {
  metaTitle: "About Jivo Wellness | India's Largest Cold Press Canola Oil Seller",
  metaDescription: "Learn about Jivo Wellness — premium cold press oils, superfoods & wellness products crafted for health-conscious families across India.",
  keywords: ["jivo wellness", "cold press oil", "canola oil", "healthy oils india"],
  ogTitle: "About Jivo Wellness",
  ogDescription: "Premium cold press oils & wellness products made in India.",
  ogImage: "/og/about.jpg",
  twitterCard: "summary_large_image",
  canonicalUrl: "https://jivo.in/about",
  robots: "index,follow",
  structuredData: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Jivo Wellness",
    url: "https://jivo.in",
  },
};
```

### Pages EXCLUDED from SEO tab (no entry in admin SEO list)

- `navbar`, `footer` — shared chrome, not indexed pages
- `/admin/**` — private (set `robots: "noindex,nofollow"` in admin layout)
- `/api/**` — API routes, no UI
- `/login`, `/signup`, `/admin/login` — `noindex` by default
- `/cart`, `/checkout`, `/order-success/[id]`, `/orders` — user-only, `noindex`

### Admin SEO Manager page (`/admin/dashboard/seo`)

Still exists as a **global SEO overview** that lists every page's SEO status in a table (title, description truncated, last updated). Clicking a row opens the editor (same `SeoTabPanel` component). This is the place admins go to bulk-manage SEO across all pages.

---

## §24 Lazy Loading & Performance Pattern (Mandatory)

### Goal

A public page must not render every section on first paint. Only the **hero / above-the-fold** section is server-rendered eagerly; every other section is deferred via `next/dynamic` + intersection observer so bundles load only when the user actually scrolls to them.

### Pattern for every page's `main.tsx`

```tsx
// src/modules/{page}/components/main.tsx
import dynamic from "next/dynamic";
import { HeroSection } from "./hero-section";           // EAGER (above the fold)
import { SectionSkeleton } from "@/components/common/section-skeleton";

// Lazy-load everything below the fold
const MissionSection       = dynamic(() => import("./mission-section").then(m => m.MissionSection), { loading: () => <SectionSkeleton /> });
const FeaturedProducts     = dynamic(() => import("./featured-products").then(m => m.FeaturedProducts), { loading: () => <SectionSkeleton /> });
const HealthBenefits       = dynamic(() => import("./health-benefits").then(m => m.HealthBenefits), { loading: () => <SectionSkeleton /> });
const TestimonialsSection  = dynamic(() => import("./testimonials-section").then(m => m.TestimonialsSection), { loading: () => <SectionSkeleton /> });
const CTASection           = dynamic(() => import("./cta-section").then(m => m.CTASection), { loading: () => <SectionSkeleton /> });

export function HomePageContent({ data }: { data: HomePageData }) {
  return (
    <main className="flex flex-col">
      <HeroSection data={data.hero} />
      <LazyOnView><MissionSection data={data.mission} /></LazyOnView>
      <LazyOnView><FeaturedProducts /></LazyOnView>
      <LazyOnView><HealthBenefits data={data.healthBenefits} /></LazyOnView>
      <LazyOnView><TestimonialsSection data={data.testimonials} /></LazyOnView>
      <LazyOnView><CTASection data={data.cta} /></LazyOnView>
    </main>
  );
}
```

### `<LazyOnView>` wrapper (shared)

```tsx
// src/components/common/lazy-on-view.tsx
"use client";
import { useRef, useState, useEffect } from "react";

export function LazyOnView({ children, rootMargin = "200px" }: { children: React.ReactNode; rootMargin?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { rootMargin }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [rootMargin]);

  return <div ref={ref} className="min-h-[1px]">{visible ? children : null}</div>;
}
```

### Next.js route-level code splitting (automatic)

Next.js already code-splits every route. Pages under `src/app/(public)/{page}/page.tsx` are fetched only when the user navigates to them. **Do not** import page components eagerly from other pages — always use route-based navigation so each page's JS bundle downloads only when needed.

### Rules

- **Hero / first section:** eager (SSR, no dynamic import, no animation)
- **SEO-relevant content sections:** `next/dynamic` ONLY (NOT wrapped in `<LazyOnView>`) — this code-splits JS but keeps SSR so crawlers see full content. Reveal-on-scroll is handled by framer-motion `whileInView` instead. See §24b below.
- **Client-only widgets** (carousels, chat, comments, optional interactive blocks, heavy framer-motion-driven hero effects): wrap in `<LazyOnView>` — browser skips mounting until the user scrolls near them. SSR is intentionally skipped for these.
- **Heavy components** (TipTap editor, Swiper carousel, chart libs): always `dynamic(..., { ssr: false })`
- **Admin dashboard tabs:** each tab's body is lazy-loaded with `dynamic()` — tab content only renders when user clicks the tab
- **Images:** use `<SafeImage />` everywhere — default lazy-loading, `priority` only on hero image
- **Never** import one page's components from another page's `page.tsx`

### §24b — When to use `<LazyOnView>` vs bare `next/dynamic`

| Section type | Strategy | Why |
|---|---|---|
| Hero / above-the-fold | Direct SSR import (no dynamic, no LazyOnView) | LCP — must render on first paint |
| SEO content below fold (mission, values, why-jivo, story, etc.) | `next/dynamic` alone + framer-motion `whileInView` for reveal | Crawlers need to see content. JS still splits per section. Animation triggers only when scrolled to — same UX benefit without SEO cost. |
| Non-SEO widget (testimonial carousel, video embed, chat, comments, map) | `next/dynamic(..., { ssr: false })` + `<LazyOnView>` | No SEO relevance. Skip SSR and skip render entirely until visible — saves TTFB + JS. |
| Admin editor tabs | `next/dynamic` only | No SEO. Lazy on tab click. |

**Hydration-safety rule:** Never wrap SSR-content in `<LazyOnView>`. SSR sends the children's HTML; `<LazyOnView>` initial client state is `visible=false` → hydration mismatch. The existing `home-main.tsx` documents this — do not revert.

### §24c — Reveal-on-scroll without sacrificing SSR

Use framer-motion's `whileInView` + the shared variants in [`src/lib/animation-variants.ts`](../src/lib/animation-variants.ts):

```tsx
'use client';
import { motion } from 'framer-motion';
import { container, fadeUp } from '@/lib/animation-variants';

export function MissionSection({ data }) {
  return (
    <section className="py-16 md:py-24">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="mx-auto max-w-6xl px-4"
      >
        <motion.h2 variants={fadeUp}>{data.heading}</motion.h2>
        <motion.p variants={fadeUp}>{data.body}</motion.p>
      </motion.div>
    </section>
  );
}
```

- **One `motion.div` parent** per section with `staggerChildren` — not one `<motion.*>` per DOM node. Fewer IntersectionObservers, smoother stagger.
- **`viewport={{ once: true, amount: 0.25 }}`** — animate once, at 25% visible. Never re-animate on scroll-up.
- **Never animate the hero.** LCP must not wait for JS/animation.
- **Respect `prefers-reduced-motion`** via `useReducedMotion()` → return a no-op variant set.

---

## §25 Per-Page Folder Structure (Follow EXPLAIN.md Exactly)

Every public page **must** have its own folder — no shared pages, no inline page components.

```
src/app/(public)/
  |-- page.tsx                         # HOME — re-exports from (public)/home
  |-- layout.tsx
  |-- loading.tsx
  |-- error.tsx
  |
  |-- home/                            # Home page module folder
  |   |-- page-content.tsx             # Server component that fetches + renders
  |   |-- loading.tsx                  # Home-specific skeleton
  |
  |-- about/
  |   |-- page.tsx                     # generateMetadata + server component
  |   |-- loading.tsx
  |
  |-- products/
  |   |-- page.tsx
  |   |-- loading.tsx
  |
  |-- product/
  |   |-- [slug]/
  |       |-- page.tsx
  |       |-- loading.tsx
  |
  |-- blog/
  |   |-- page.tsx
  |   |-- loading.tsx
  |   |-- [slug]/
  |       |-- page.tsx
  |       |-- loading.tsx
  |
  |-- contact/page.tsx
  |-- careers/page.tsx
  |-- cart/page.tsx
  |-- checkout/page.tsx
  |-- orders/page.tsx
  |-- order-success/[orderId]/page.tsx
  |-- privacy-policy/page.tsx
  |-- terms-conditions/page.tsx
  |-- login/page.tsx
  |-- signup/page.tsx
```

### Why a `home/` folder?

To keep home symmetric with every other page (SEO, loading state, module boundary). The root `(public)/page.tsx` is a 2-line re-export:

```tsx
// src/app/(public)/page.tsx
export { default } from "./home/page-content";
export { generateMetadata } from "./home/page-content";
```

This gives home its own folder for SEO/assets/loading while still serving at `/`.

### `generateMetadata` + `page-content.tsx` (home) template

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
## ⚠️ SEO APPLICABILITY RULE

SEO is ONLY required for:

* Public pages (`/`, `/about`, `/products`, `/blog`, etc.)

SEO is NOT required for:

* `/admin/**`
* `/api/**`
* `navbar`
* `footer`
* `/login`, `/signup`
* `/cart`, `/checkout`, `/orders`

👉 These MUST use:

```
robots: "noindex,nofollow"
```

---

## ✅ SEO RULES (PUBLIC PAGES ONLY)

Every public page MUST:

* Implement `generateMetadata()`
* Use `resolveSeo(page, defaultSeo)`
* Include:

  * metaTitle
  * metaDescription
  * keywords
  * canonicalUrl
  * OpenGraph
  * structuredData

❌ DO NOT:

* Leave metadata empty
* Use duplicate titles
* Skip structured data

---

## ⚙️ PERFORMANCE RULES (MANDATORY)

* Hero section MUST load instantly (NO lazy loading)
* Below-the-fold sections MUST use `next/dynamic`
* Use `next/image` for ALL images
* Use `priority` for hero images
* Avoid full `"use client"` pages
* Split server + client components

---

## 🚀 RENDERING STRATEGY

| Page Type | Strategy         |
| --------- | ---------------- |
| Home      | SSG + revalidate |
| About     | SSG              |
| Blog      | ISR              |
| Product   | ISR              |
| Admin     | CSR              |

```js
export const revalidate = 60;
```

---

## 📊 CORE WEB VITALS TARGET

* LCP < 2.5s
* CLS < 0.1
* FID < 100ms

---

## 🔍 INDEXING RULES

### Indexed:

* Home
* About
* Products
* Blog
* Contact

### Not Indexed:

* `/admin/**`
* `/api/**`
* `/login`, `/signup`
* `/cart`, `/checkout`

---

## 🧠 STRUCTURED DATA RULE

| Page    | Schema                 |
| ------- | ---------------------- |
| Home    | WebSite + Organization |
| About   | AboutPage              |
| Product | Product                |
| Blog    | Article                |

---

## ⚡ LAZY LOADING RULE

```js
const Section = dynamic(() => import("./Section"));
```

✔ Use for:

* testimonials
* sliders
* heavy UI

❌ Don’t use for:

* hero
* main heading

---

## 🖼 IMAGE STORAGE SYSTEM (MANDATORY - STRICT RULE)

### 🚨 CRITICAL RULE

Dynamic images MUST NOT be stored inside `/public`.

❌ FORBIDDEN:

* `/public/images`
* static image overwrite
* same filename reuse

---

## ✅ APPROVED STORAGE ARCHITECTURE

All uploaded images MUST be stored in:

```
/uploads/images/
```

---

## ⚙️ FILE NAMING RULE (MANDATORY)

Every uploaded file MUST have a unique name:

```js
const fileName = `${Date.now()}-${originalName}`;
```

👉 Prevents:

* caching issues
* overwrite bugs
* missing images

---

## 🗄 DATABASE STORAGE RULE

Only store the filename in DB:

```json
{
  "image": "1713456789-hero.png"
}
```

❌ DO NOT store full path
❌ DO NOT store `/public/...`

---

## 🌐 IMAGE SERVING RULE

Images MUST be served via API route:

```
/api/uploads/[filename]
```

---

## ⚙️ API IMPLEMENTATION (MANDATORY)

```js
import fs from "fs";
import path from "path";

export async function GET(req, { params }) {
  const filePath = path.join(process.cwd(), "uploads/images", params.file);

  if (!fs.existsSync(filePath)) {
    return new Response("Not Found", { status: 404 });
  }

  const file = fs.readFileSync(filePath);

  return new Response(file, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000",
    },
  });
}
```

---

## 🖥 FRONTEND USAGE RULE

Always render image like this:

```js
src={`/api/uploads/${filename}`}
```

---

## 🛡 FALLBACK HANDLING (MANDATORY)

```js
<img
  src={`/api/uploads/${image}`}
  onError={(e) => (e.currentTarget.src = "/placeholder.png")}
/>
```

---

## 🧹 DELETE RULE

When deleting image:

1. Delete from `/uploads/images`
2. Remove reference from DB

```js
fs.unlinkSync(filePath);
```

---

## ⚡ PERFORMANCE RULE

* Use `Cache-Control` headers
* Use unique filenames (no cache issues)
* Optimize images using `sharp` before saving

---

## 🚫 FORBIDDEN PATTERNS

Claude MUST NEVER:

* store images in `/public`
* reuse same file name
* hardcode image paths
* skip fallback handling
* skip API-based serving

---

## 🎯 FINAL GOAL

* No missing images
* No caching issues
* No broken UI
* Scalable image system

---

## 🔗 CANONICAL RULE

```js
canonical: "https://yourdomain.com/page"
```

---

## 🔥 FINAL GOAL

* Fast loading website ⚡
* SEO optimized pages 📈
* Google indexable content 🔍
* Scalable architecture 🧠

---

---

## §26 Mandatory Deliverables Checklist

Every time the user asks "create the {page} page", the following must exist before marking the task done:

- [ ] Prisma model(s) added + `db:push` run
- [ ] `src/modules/{page}/types.ts`
- [ ] `src/modules/{page}/validations.ts` (includes SEO schema import)
- [ ] `src/modules/{page}/data/queries.ts`
- [ ] `src/modules/{page}/data/mutations.ts`
- [ ] `src/modules/{page}/data/defaults.ts` (with `defaultSeo` export)
- [ ] `src/modules/{page}/actions.ts`
- [ ] `src/modules/{page}/components/*.tsx` — one file per section
- [ ] `src/modules/{page}/components/main.tsx` — uses `next/dynamic` + `<LazyOnView>`
- [ ] `src/modules/{page}/index.ts` — barrel export
- [ ] `src/app/(public)/{page}/page.tsx` (or `page-content.tsx` for home) — includes `generateMetadata` via `resolveSeo`
- [ ] `src/app/(public)/{page}/loading.tsx` — skeleton
- [ ] `src/app/(public)/{page}/error.tsx` — error boundary (see §27)
- [ ] `src/app/(public)/{page}/not-found.tsx` — 404 boundary (see §27)
- [ ] `src/app/(admin)/admin/dashboard/{page}/page.tsx` — tabbed editor ending with `<SeoTabPanel />`
- [ ] `src/app/(admin)/admin/dashboard/{page}/loading.tsx` + `error.tsx` (see §27)
- [ ] `src/app/api/{page}/route.ts` — public GET
- [ ] `src/app/api/admin/{page}/route.ts` — admin CRUD
- [ ] Row in `SeoMeta` seeded by `prisma/seed.ts`
- [ ] `docs/{page}.md` — complete API + Postman docs (including SEO endpoints)

---

## §27 Error Handling (Mandatory for Every Page)

### Goal

Every page must surface failures clearly enough that the dev can debug from the browser tab + server log alone — no guessing. No silent `try/catch` swallows. No raw stack traces in production. Distinct UI for "broken", "loading", "not found".

### Required files for every public page

```
src/app/(public)/{page}/
  page.tsx              # Route handler
  loading.tsx           # Skeleton while server fetches data (Suspense fallback)
  error.tsx             # Error boundary (caught render/fetch errors)
  not-found.tsx         # 404 boundary (when notFound() is called)
```

### Required files for every admin page

```
src/app/admin/(dashboard)/{page}/
  page.tsx
  loading.tsx
  error.tsx             # Per-section error (NOT a global crash)
```

### `error.tsx` template

```tsx
'use client';
import { useEffect } from 'react';
import { Button } from '@/components/ui';
import { AlertTriangle, RotateCw } from 'lucide-react';

export default function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Centralized log — sent to Sentry/console with full context for debugging.
    console.error('[home page error]', { message: error.message, digest: error.digest, stack: error.stack });
  }, [error]);

  return (
    <main className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <h1 className="text-xl font-semibold">Something broke on this page.</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        We&apos;ve logged the issue. You can retry, or head back home while we look at it.
      </p>
      {process.env.NODE_ENV !== 'production' && (
        <pre className="max-w-2xl overflow-auto rounded-lg bg-muted px-3 py-2 text-left text-xs">
          {error.message}
          {error.digest ? `\n\ndigest: ${error.digest}` : ''}
        </pre>
      )}
      <Button onClick={reset} className="gap-2">
        <RotateCw className="h-4 w-4" /> Try again
      </Button>
    </main>
  );
}
```

### `not-found.tsx` template

```tsx
import Link from 'next/link';
import { Button } from '@/components/ui';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-bold">404 — page not found</h1>
      <p className="text-sm text-muted-foreground">
        The page you&apos;re looking for has moved or never existed.
      </p>
      <Button asChild className="gap-2"><Link href="/"><Home className="h-4 w-4" /> Back home</Link></Button>
    </main>
  );
}
```

### Server actions / API routes — error contract

Every server action returns the canonical `ActionResponse<T>`:

```ts
export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error?: string; fieldErrors?: Record<string, string[]> };
```

Rules:

1. **Always log on the server before returning.** Use a tagged prefix so logs are greppable:
   ```ts
   } catch (err) {
     console.error('[updateSeoMetaAction]', { page, err });
     return { success: false, error: 'Failed to save SEO' };
   }
   ```
2. **Return user-safe error messages.** Never leak `err.stack` or DB error text to the UI — the log line has that for debugging.
3. **Validation errors get `fieldErrors`** so the form can highlight the bad fields.
4. **API routes** return `NextResponse.json({ success: false, error })` with the right status (400/401/403/404/500). Always log first.
5. **Client fetches** must always check `data.success` and `toast.error(data.error ?? 'fallback message')`. Wrap in `try/catch` for network failures with a separate "Network error" toast.

### Forbidden patterns

- ❌ `try { … } catch { /* nothing */ }` — silent swallow
- ❌ `console.log(err)` — use `console.error` with a tagged prefix
- ❌ `toast.error(err.message)` directly — use a friendly message; log the raw error
- ❌ Returning raw `Error` objects from server actions
- ❌ `redirect('/')` on error — show the error UI so devs can see what happened

### Log tag convention

```
[<file or function name>] <short context>
[updateSeoMetaAction] { page: 'home', err }
[GET /api/admin/seo/[page]] { page, err }
[SeoListTable.load] err
```

Greppable in production logs: `grep '\[updateSeoMetaAction\]'` finds every error from that function.

### Sentry (when configured)

If `NEXT_PUBLIC_SENTRY_DSN` is set:
- `error.tsx` automatically captures via `@sentry/nextjs`
- Server actions add `Sentry.captureException(err, { extra: { … } })` after the `console.error`
- API routes use the Sentry handler wrapper

---

## Instructions for Claude Code

When building any page:

1. **Always read the existing admin pages first**: check `src/app/admin/(dashboard)/layout.tsx` and any existing hub/editor pages for styling patterns
2. **Follow the module structure exactly**: types → validations → data → actions → components → main.tsx
3. **Admin pages must match the existing admin styling**: same sidebar dropdown pattern, card-grid boxes, tabbed editor forms, button styles — reference `src/app/admin/(dashboard)/` for all patterns
4. **Create the docs/{page}.md file** for every page with API URLs, JSON data, and Postman instructions
5. **Use the user's screenshots/descriptions** to determine what sections each page needs
6. **Always create**: public page + admin dashboard page + API routes + SEO tab + docs MD — every single time
7. **Lazy-load below-the-fold sections** via `next/dynamic` + `<LazyOnView>` (see §24)
8. **Every public page** must register SEO defaults in `data/defaults.ts` AND use `resolveSeo()` in `generateMetadata`
9. **Follow folder structure from `docs/EXPLAIN.md` exactly** — per-page folders under `(public)/` including `home/`
10. **Every page MUST ship `loading.tsx`, `error.tsx`, and `not-found.tsx`** (see §27 for templates and the required log-tag convention)
11. **Server actions and API routes MUST use the `[functionName]` log tag + `ActionResponse<T>` contract** — never silently swallow errors
12. **Test with Postman**: document every API endpoint with example requests and responses

When the user sends screenshots or describes sections, map each visual section to:
- A TypeScript interface in `types.ts`
- A Zod schema in `validations.ts`
- A section key in `PageContent` (e.g., "hero", "mission", "cta")
- A component file in `components/` — lazy-loaded in `main.tsx` unless it's the hero
- A tab in the admin editor (final tab is always SEO)
- An API endpoint with documented JSON format
- A field in the page's `defaultSeo` (update if the section changes keywords/description relevance)

---

# 🔥 GLOBAL SYSTEM RULES — IMAGE + PERFORMANCE + SAFETY (MANDATORY)

---

## §28 🛑 SEED SAFETY SYSTEM (CRITICAL — NEVER BREAK DATA)

### 🚨 RULE

Claude MUST NEVER overwrite existing database content.

### ❌ FORBIDDEN

- Using `upsert` in seed scripts for CMS content (sections, pages, rows that admins edit)
- Overwriting existing records during `db:seed`
- Resetting DB in production without `--force`
- Replacing existing image field with `"placeholder.png"` when a row already exists

### ✅ REQUIRED

**Safe Seed Logic (INSERT ONLY for CMS content):**

```ts
const existing = await prisma.model.findUnique({ where: { key } });
if (!existing) {
  await prisma.model.create({ data });
} else {
  // skip — admin may have edited this row
}
```

Only `User` / `SeoMeta` / settings rows are allowed to `upsert`, and only when `FORCE_RESET` is true OR the row is missing.

### ⚠️ RESET MODE (STRICT CONTROL)

```bash
npm run db:seed:reset           # dev/staging only
npm run db:seed:reset -- --force   # production — dangerous, wipes content
```

Guard required:

```ts
if (FORCE_RESET && process.env.NODE_ENV === 'production' && !args.includes('--force')) {
  console.error('❌ REFUSED: --reset on production requires --force flag');
  process.exit(1);
}
```

### 🎯 GOAL

- Never lose uploaded images
- Never override admin changes
- Safe production deployment

---

## §29 🖼 IMAGE SYSTEM (MANDATORY)

### 🚨 CRITICAL RULE

**ALL images in the project MUST use `<SafeImage>` component** from `@/components/shared`.

### ❌ FORBIDDEN

- `<img>` tag usage (raw HTML)
- `<SafeImage><Image/></SafeImage>` pattern (double-wrapping)
- Direct `next/image` `<Image>` for user-editable/DB-backed images (only allowed for static `/public` assets like logos in navbar/footer where absolute control is needed — and even there prefer `<SafeImage>`)
- Direct `/api/uploads/...` URL construction in JSX
- Manual `onError` fallback logic in components (SafeImage already handles it)
- Storing full image path in DB — store **filename only**

### ✅ REQUIRED

SafeImage MUST:
- Use `next/image` internally
- Accept `src` as **bare filename** (e.g. `"1713456789-hero.png"`), absolute path (`/…`), or external URL (`http…`)
- Convert internally → `/api/uploads/${filename}`
- Handle missing images automatically with placeholder fallback
- URL-encode filenames (spaces / special chars)
- Log warning in dev mode when fallback triggers
- Support `priority` prop for hero / above-the-fold images
- Default to lazy loading (via `next/image`)

### Reference implementation

The canonical `SafeImage` lives at [`src/components/shared/safe-image.tsx`](../src/components/shared/safe-image.tsx). Do NOT duplicate it — always import from `@/components/shared`.

Usage:

```tsx
import { SafeImage } from '@/components/shared';

// Hero / above-the-fold
<SafeImage src={hero.backgroundImage} alt="Hero" fill priority sizes="100vw" className="object-cover" />

// Below-the-fold — lazy by default
<SafeImage src={card.image} alt={card.title} width={400} height={300} className="object-cover" />
```

### 🔄 GLOBAL REPLACEMENT RULE

When touching any file, if you see:

```
Find:    <img ... src={...} ...
Replace: <SafeImage src={rawFilename} alt=... ... />
```

(pass the raw filename — SafeImage resolves the URL itself; do NOT pass `toSrc()` or `/api/uploads/...`)

### ⚙️ IMAGE STORAGE RULE

- Upload destination: `/uploads/images/`
- Filename format: `${Date.now()}-${sanitizedOriginalName}`
- DB stores **filename only**: `"171234-logo.webp"` — NOT `"/uploads/images/171234-logo.webp"`, NOT `"/api/uploads/171234-logo.webp"`

### 🌐 IMAGE SERVING RULE

All uploaded images served via the API route:

```
GET /api/uploads/[filename]
```

No direct filesystem access from the client.

---

## §30 🧠 DEBUGGING (PRODUCTION-SAFE LOGGING)

### SafeImage (dev only)

SafeImage already emits `console.warn('[SafeImage] IMAGE MISSING: …')` on fallback — no manual wiring needed.

### Upload API logging (required)

In `src/app/api/uploads/[filename]/route.ts`, when the requested file is missing, log a warning in dev so devs can spot a dangling DB reference:

```ts
if (!existsSync(filePath)) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[UPLOAD API] Missing file:', filename);
  }
  // fall back to placeholder…
}
```

### Debug matrix

| Case          | Behavior              |
| ------------- | --------------------- |
| Image correct | Render normally       |
| DB wrong      | Placeholder + warning |
| File deleted  | Placeholder + warning |
| Broken path   | Logged clearly        |

---

## §31 ⚡ PERFORMANCE + LAZY LOADING (MANDATORY)

- Hero section → **NO** lazy loading (eager SSR for LCP)
- All other sections → `next/dynamic` with a skeleton `loading` fallback
- Avoid full-page `"use client"` — split server + client
- Use `next/image` (via `<SafeImage>`) for every image
- Use `priority` only on hero images

```tsx
const Section = dynamic(() => import('./section').then(m => m.Section), {
  loading: () => <SectionSkeleton height="lg" />,
});
```

---

## §32 ✨ UI/UX ANIMATION RULE

### Section sizing

- Vertical rhythm: `py-16 md:py-24` (or similar — stay consistent)
- Container: `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`
- Responsive grids: `grid md:grid-cols-2 gap-8 items-center`; alternate image left/right for rhythm

### Scroll-reveal animation (when framer-motion fits)

```tsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
>
  …
</motion.div>
```

### Image performance

- Hero → `priority`
- Others → default (lazy)
- Always via `<SafeImage>`

---

## §33 🛡 PRODUCTION SAFETY

### Must follow

- Never delete `/uploads/images` directory
- Never run `db:seed:reset` in production without `--force` and explicit approval
- Validate image shape/size before saving (UploadThing enforces this — don't bypass)

### Optional hardening

- Check file exists before render (SafeImage does)
- Log missing files (SafeImage + uploads API both do)
- Clean unused images via a scheduled admin tool (not auto)

---

## §34 🔥 FINAL EXPECTED RESULT

- No image bugs
- No DB overwrite issues
- High performance (LCP < 2.5s, CLS < 0.1)
- Strong debugging (grep-able log tags)
- Clean UI/UX
- Scalable architecture

Claude MUST follow §28–§37 for: existing code refactor, new page creation, admin dashboard work, and API development.

---

## §35 🎬 ANIMATION SYSTEM (CENTRALIZED — MANDATORY)

### 🎯 Goal

One source of truth for reveal-on-scroll motion. No per-section `Variants` objects. No `ease: [0.22, 1, 0.36, 1]` literals that break TS.

### ✅ Required file

```
src/lib/animation-variants.ts
```

Exports typed `Variants` (from `framer-motion`):

- `container` — parent with `staggerChildren: 0.12`
- `fadeUp` — `opacity 0 → 1`, `y 40 → 0`, duration 0.6
- `fadeIn` — `opacity 0 → 1`, duration 0.5
- `fadeUpSlow` — same as fadeUp with duration 0.8 + larger stagger (for headline-heavy sections)
- Cubic bezier easing via `cubicBezier(…)` helper (not raw number arrays)

### ✅ Usage pattern

```tsx
'use client';
import { motion } from 'framer-motion';
import { container, fadeUp } from '@/lib/animation-variants';

<motion.div
  variants={container}
  initial="hidden"
  whileInView="show"
  viewport={{ once: true, amount: 0.25 }}
>
  <motion.h2 variants={fadeUp}>…</motion.h2>
  <motion.p  variants={fadeUp}>…</motion.p>
</motion.div>
```

### 🚫 Strict rules

- ❌ NO animation in hero (LCP must not wait)
- ❌ NO heavy transforms (scale+rotate+filter stacks)
- ❌ NO infinite animations on public pages
- ❌ NO duplicate `Variants` objects in section files — always import from `@/lib/animation-variants`
- ✅ duration 0.5–0.8, opacity + y only for body content
- ✅ Always `viewport={{ once: true }}`
- ✅ Respect `prefers-reduced-motion` via `useReducedMotion()`

---

## §36 🎨 SHARED SECTION WRAPPER (MANDATORY FOR NEW SECTIONS)

### 🎯 Goal

Kill the repeated `<section><bg><overlay><container>…</container></section>` boilerplate across every module. One component, consistent spacing, enforceable defaults.

### ✅ Required file

```
src/components/shared/section.tsx
```

Exported as `<Section>` from `@/components/shared`.

### Props

```ts
interface SectionProps {
  /** Filename or absolute path — rendered via <SafeImage fill /> when provided. */
  background?: string;
  /** Dark overlay opacity 0–100. Default 0 (no overlay). */
  overlay?: number;
  /** Vertical rhythm. Default "default" = py-16 md:py-24. */
  padding?: 'sm' | 'default' | 'lg' | 'none';
  /** Inner container max-width. Default "7xl". */
  container?: '5xl' | '6xl' | '7xl' | 'full';
  /** Additional classes on <section>. */
  className?: string;
  /** Additional classes on inner container. */
  innerClassName?: string;
  children: React.ReactNode;
}
```

### Usage

```tsx
<Section background={data.bg} overlay={55} container="6xl">
  <h2>…</h2>
  <p>…</p>
</Section>
```

### Consistency

- Vertical rhythm: always `py-16 md:py-24` (default) unless specified
- Container: `mx-auto w-full px-4 sm:px-6 lg:px-8` + max-width
- Background image: rendered via `<SafeImage fill sizes="100vw" />`
- Overlay: `absolute inset-0 bg-black/{overlay}` when provided
- Content layer: `relative z-10`

Use `<Section>` for ALL new section components. Existing sections can migrate incrementally — do not mass-refactor.

---

## §37 💀 SKELETON RULES (IMPROVED)

### 🎯 Goal

Loading skeletons should MATCH the section's shape to prevent CLS and give the user a believable placeholder.

### ❌ FORBIDDEN

- One-size-fits-all generic skeletons
- Skeletons taller/shorter than the real section (causes jump)
- Skeletons inside `<LazyOnView fallback>` for SSR content (hydration mismatch)

### ✅ REQUIRED

- `SectionSkeleton` accepts `height: 'sm' | 'md' | 'lg' | 'hero'` — pick the size closest to the real section
- For layout-heavy sections (two-column, grid), create a section-specific skeleton that mirrors the grid
- Use `animate-pulse` from `@/components/ui/skeleton`
- Place skeletons only in `next/dynamic(..., { loading: ... })` — never in `<LazyOnView fallback>` for SEO content

```tsx
const MissionSection = dynamic(
  () => import('./mission-section').then(m => m.MissionSection),
  { loading: () => <SectionSkeleton height="lg" /> },
);
```

---

## §38 🚀 RENDERING STRATEGY (UPDATED — ISR, NOT `noStore`)

### 🎯 Goal

Every CMS-driven public page should serve from edge cache by default and rebuild on admin edit — not hit the DB on every visit.

### ❌ FORBIDDEN for CMS content pages

- `export const dynamic = 'force-dynamic'`
- `unstable_noStore()` at the top of `page.tsx`

### ✅ REQUIRED

```tsx
// src/app/(public)/{page}/page.tsx
export const revalidate = 300;  // 5 min — long enough to cache, short enough to refresh
```

Admin save flow already calls `revalidatePath('/…')` inside server actions → cache invalidates instantly when admin edits. ISR fills in the rest.

### Exceptions

- Admin dashboard pages (`/admin/**`) → CSR (no revalidate needed — authenticated views)
- User-specific pages (`/orders`, `/cart`) → `export const dynamic = 'force-dynamic'` (always fresh per user)
- Non-indexed auth pages (`/login`, `/signup`) → default

### Prisma SELECT optimization

Every `findMany` in a page's data query MUST select only the columns it needs:

```ts
await prisma.ourEssenceCoreValues.findMany({
  where: { isActive: true },
  orderBy: { sortOrder: 'asc' },
  select: { section: true, content: true },  // ← not the whole row
});
```

Saves bandwidth + parse time. Full-row fetches are allowed only for admin edit screens where every field matters.

### SEO query dedup

`resolveSeo(page, …)` and `getStructuredData(page, …)` both call `getSeoByPage(page)` — a duplicate round trip. Fix by wrapping `getSeoByPage` with React's `cache()`:

```ts
// src/modules/seo/data/queries.ts
import { cache } from 'react';
export const getSeoByPage = cache(async (page: string) => {
  return prisma.seoMeta.findUnique({ where: { page } });
});
```

Request-scoped memoization — second call in the same request is free.

### Font + resource preloading

- Jost loaded via `next/font` with `display: 'swap'` (already required — verify in `app/layout.tsx`)
- Hero image: explicit `<link rel="preload" as="image" href={…}>` injected per-page for cold-cache LCP wins

---

## §39 FINAL RESULT EXPECTED (COMPOSITE)

- Sections load on scroll (via code-splitting + animated reveal)
- Smooth 60fps animations (single motion parent + stagger)
- Fast initial load (ISR cache + hero preload + SELECT columns)
- Clean UI (shared `<Section>` wrapper)
- Clean TS (typed variants — no more `ease` tuple errors)

🚫 DO NOT BREAK: SafeImage internals, Prisma per-page schema, module architecture, admin dashboard pattern, SSR for SEO sections.

---

## §40 🚀 HERO LCP OPTIMIZATION (MANDATORY — EXTENDS §29, §31, §35, §38)

### 🎯 Goal

The hero is the LCP element on every public page. Target Lighthouse Performance ≥ 90 desktop / 75–85 mobile. Every rule below is non-negotiable for hero sections.

### §40.1 — Hero image props (STRICT)

Every hero `<SafeImage>` MUST pass:

```tsx
<SafeImage
  src={hero.backgroundImage}
  alt={hero.heading}
  fill
  priority                                   // ← forces eager fetch, skips lazy
  sizes="(max-width: 768px) 100vw, 100vw"    // ← tell browser it's full-width
  placeholder="blur"                         // ← when a blurDataURL is available
  blurDataURL={hero.backgroundBlur}          // ← 10×10 base64 JPEG from sharp
  className="object-cover"
/>
```

- ✅ `priority` — required on every hero image (bypasses the lazy queue, preloads via `<link rel="preload">`)
- ✅ `sizes="100vw"` (or responsive variant) — required so the optimizer picks the right width
- ✅ `placeholder="blur"` with `blurDataURL` — required when the image is uploaded through admin (generate blur at upload time with `sharp`)
- ❌ Never omit `sizes` on `fill` images — defaults to 100vw which may over-download
- ❌ Never use `priority` on anything BELOW the hero (it poisons the preload queue)

### §40.2 — Image size & format limits (STRICT)

| Target | Max size | Format |
|--------|----------|--------|
| Desktop hero | 200 KB | WebP or AVIF |
| Mobile hero | 100 KB | WebP or AVIF |
| Below-the-fold | 150 KB | WebP or AVIF |

- `sharp` (already in deps) is run at upload time to re-encode uploaded JPEG/PNG to WebP and strip metadata
- AVIF is better but slower to encode — WebP is the baseline requirement
- Originals > 2 MB should be rejected at upload with a clear error
- Admin UI should warn when a hero image exceeds the budget after encoding

### §40.3 — Blur placeholder generation (upload pipeline)

At upload time:

```ts
import sharp from 'sharp';

const buffer = await sharp(originalBuffer)
  .resize(10, 10, { fit: 'inside' })
  .jpeg({ quality: 50 })
  .toBuffer();

const blurDataURL = `data:image/jpeg;base64,${buffer.toString('base64')}`;
```

Store `blurDataURL` in the section's JSON content alongside the filename:

```json
{
  "backgroundImage": "171234-hero.webp",
  "backgroundBlur": "data:image/jpeg;base64,…"
}
```

`SafeImage` forwards both to `next/image`.

### §40.4 — Hero animation (STRICT — reinforces §35)

- ❌ NO `whileInView` on hero (LCP must paint before any JS is interactive)
- ❌ NO stagger / heavy motion / blur-filter reveal / clip-path on hero
- ❌ NO delayed mount (no `<LazyOnView>` — hero must render on first paint)
- ✅ Static content is the default
- ✅ A single `opacity 0 → 1` fade (≤ 0.3s, no Y translate) is the MAX allowed — apply only to the content overlay, never to the image itself
- ✅ Hero text must be real server-rendered HTML, not framer-motion children

**Existing exception:** `the-story/hero-section.tsx` currently animates heading/paragraph via `animate="show"` on mount. This is legacy. New hero sections MUST follow the static rule. Migrate existing ones when touching them.

### §40.5 — Overlay simplification

Overlays are allowed but keep them cheap:

- ✅ ONE overlay element maximum
- ✅ Flat `bg-black/40` / `bg-black/50` is preferred over gradients for speed
- ✅ If a gradient is required for contrast, use `bg-gradient-to-t from-black/60 to-transparent` (single-direction, 2 stops max)
- ❌ NO stacked overlays (don't layer gradient + solid + vignette)
- ❌ NO `backdrop-filter: blur` on hero overlay (expensive, hurts mobile FPS)

### §40.6 — Mobile-specific rules

- Hero min-height: `min-h-[60vh] sm:min-h-[70vh] lg:min-h-screen` — NOT `min-h-screen` on mobile (mobile screens are tall, this forces too much scrolling before second section)
- Mobile viewport ≠ desktop viewport — never serve a desktop-resolution image to a 400px-wide phone. Let `next/image` pick the right size via `sizes`.
- Text size: `clamp()` or responsive utilities — don't ship 96px fonts on mobile

### §40.7 — Font performance (reinforces §38)

Every font loaded through `next/font` MUST declare:

```ts
import { Jost } from 'next/font/google';

export const jost = Jost({
  subsets: ['latin'],
  display: 'swap',       // ← REQUIRED — prevents invisible-text-during-fetch
  weight: ['400', '500', '700', '800'],
  preload: true,         // default, but explicit is better
  variable: '--font-jost',
});
```

- ❌ Never use `display: 'block'` or `display: 'optional'` for body fonts — causes FOIT (flash of invisible text)
- ✅ Preload ONLY fonts used above the fold; defer weights only needed deeper in the page

### §40.8 — Above-the-fold priority rule

Rendering budget, in order:

1. **First paint (0–1000ms):** hero image + hero HTML (server-rendered, priority-preloaded)
2. **LCP (< 2.5s):** hero image fully decoded + painted
3. **Interactive:** framework JS, section chunks, analytics — all AFTER hero paints
4. **Below fold:** `next/dynamic` sections fetch their JS chunks as user scrolls

No JS, no framer-motion, no fonts-that-aren't-preloaded, no third-party widgets should block hero paint. If it's not above-the-fold, it's not allowed to run before LCP.

### §40.9 — Verification checklist

Before shipping a hero:

- [ ] `priority` set
- [ ] `sizes` set (at minimum `"100vw"`)
- [ ] `placeholder="blur"` + `blurDataURL` if image is admin-uploaded
- [ ] Image served as WebP/AVIF (not PNG/JPEG for hero)
- [ ] Image size under §40.2 budget
- [ ] No animation on hero content or image
- [ ] Single overlay, flat or 2-stop gradient max
- [ ] `min-h-*` scaled per breakpoint
- [ ] Lighthouse LCP ≤ 2.5s on Moto G4 throttled profile

### 🎯 Expected scores after §40 compliance

- Desktop Performance: ≥ 90
- Mobile Performance: 75–85
- LCP: < 2.5s
- CLS: < 0.1

🚫 DO NOT BREAK: SafeImage internals (don't bypass it), lazy loading system (§24), section architecture (§25, §36), Prisma / API contracts. §40 is additive — it tightens existing rules, never replaces them.

---

## §41 🖼 HERO IMAGE QUALITY (CORRECTS §40.1 / §40.2)

### 🎯 Goal

Hero image must render **visually identical to the uploaded original** on desktop — no blur, no pixelation, no CSS upscaling. §40's delivery rules still apply; this section corrects the `sizes` + encoding specifics that were causing perceived quality loss.

### 🚨 Why the earlier rule caused blur

`sizes="100vw"` on a `fill` image tells the browser to pick the largest srcset candidate matching viewport width. If the source is smaller than the rendered size (e.g. a 1200px-wide upload displayed on a 1920px desktop), every candidate gets CSS-upscaled → blur. Two failure modes:

1. **Source too small** — admin uploaded a 1024px image but viewport is 1920px wide. No srcset candidate is large enough.
2. **Optimizer picks a small candidate then CSS stretches it** — happens when `sizes` is unbounded and the candidate selection heuristic undershoots.

### §41.1 — Updated hero `sizes` prop (REPLACES §40.1 wording)

Use a **capped** sizes string so the browser knows the maximum natural width of the image:

```tsx
<SafeImage
  src={hero.backgroundImage}
  alt={hero.heading}
  fill
  priority
  sizes="(max-width: 768px) 100vw, 1920px"    // ← cap at 1920 on desktop
  placeholder="blur"
  blurDataURL={hero.backgroundBlur}
  className="object-cover"
/>
```

Variants by context:

| Hero placement | `sizes` |
|---|---|
| Full-bleed hero (100vw × 100vh) | `"(max-width: 768px) 100vw, 1920px"` |
| Bounded hero inside a container (e.g. `max-w-7xl`) | `"(max-width: 768px) 100vw, 1440px"` |
| Card / thumbnail (never hero) | `"(max-width: 640px) 100vw, 600px"` |

### §41.2 — Source image dimensions (STRICT)

| Target | Min width | Max width | Notes |
|---|---|---|---|
| Full-bleed desktop hero | 1920 px | 2400 px | Anything < 1920 will blur on FHD+ screens |
| Bounded desktop hero | 1440 px | 1800 px | Sized for container width |
| Mobile hero (responsive source) | 800 px | 1000 px | Served via srcset to phones |
| Below-the-fold images | 800 px | 1600 px | Depends on grid width |

- ❌ NEVER upload 4000 px+ images — wasted bytes, `sharp` slow, no visual benefit past 2× display resolution
- ❌ NEVER upload < 1920 px and expect sharp display on 1080p monitors
- ✅ Admin UI should WARN (not block) when a hero upload is < 1920 px wide
- ✅ Admin UI should REJECT uploads > 5 MB or > 4000 px on either axis

### §41.3 — Compression quality (CORRECTS §40.2)

`sharp` re-encoding settings at upload time:

```ts
// src/lib/image-pipeline.ts (or wherever uploads are processed)
await sharp(buffer)
  .resize({ width: 1920, withoutEnlargement: true })   // cap, don't upscale
  .webp({ quality: 85 })                                // 80–90 is the safe band
  .toBuffer();
```

| Setting | Value | Why |
|---|---|---|
| Quality | **80–90** | 85 is the default sweet spot; 80 if file must be smaller; NEVER below 70 |
| Format | WebP (fallback to AVIF when supported) | Preserves quality at 60–70% the size of JPEG |
| `withoutEnlargement` | `true` | Never upscale a small source — it just gets bigger and blurrier |
| Chroma subsampling | `4:4:4` on hero | For text-on-image heroes, avoid the default `4:2:0` which fuzzes edges |

Budget from §40.2 still holds (Desktop hero ≤ 200 KB) — quality 85 at 1920 px width typically lands in 120–180 KB for photographic content. If a particular image exceeds 200 KB at quality 85, reduce source dimensions before reducing quality.

### §41.4 — Hero slider / carousel (multiple images)

When admin uploads 4–10 hero slides:

- ✅ **First slide only** gets `priority` — it's the LCP candidate
- ✅ All other slides: no `priority`, default lazy loading
- ✅ Use Swiper's `lazy` preload strategy so next slide loads just before it animates in
- ❌ NEVER set `priority` on every slide — poisons the preload queue and kills LCP

```tsx
{slides.map((slide, i) => (
  <SafeImage
    key={slide.id}
    src={slide.image}
    priority={i === 0}                                  // ← only first
    sizes="(max-width: 768px) 100vw, 1920px"
    fill
    className="object-cover"
  />
))}
```

### §41.5 — Blur placeholder behavior (refines §40.3)

- ✅ `blurDataURL` appears for ~50–300ms while full image decodes
- ✅ Full image MUST replace blur completely — if the blur persists, that's a bug (usually: wrong `src` path or broken `/api/uploads/...` response)
- ❌ Blur must NOT be visible at rest. If users see blur after load, `SafeImage` has entered fallback state — check the `[SafeImage] IMAGE MISSING` warning in the console.
- ✅ `blurDataURL` itself is tiny (10×10 base64 ≈ 400 bytes) — inlined, no extra request

### §41.6 — CSS rules that protect image quality

```tsx
<SafeImage … className="object-cover" />   // ✅ correct
```

- ✅ `object-fit: cover` — fills the container, crops overflow, no distortion
- ❌ `object-fit: fill` — stretches image to container = distortion
- ❌ `transform: scale(>1)` on hero image — CSS upscale = blur
- ❌ `width: 100%; height: auto;` on a `fill` image — conflicts with `next/image` fill math
- ❌ Tailwind utilities that force oversized rendering (e.g. explicit `w-[2400px]` on a 1920-px source)

### §41.7 — The quality-vs-performance tradeoff (PRIORITY ORDER)

When tuning, apply fixes in this order:

1. **Fix `sizes`** (free — no quality cost, fixes browser candidate selection)
2. **Fix source dimensions** (upload at 1920 px min — free quality gain)
3. **Keep quality at 85** (don't touch)
4. **Switch JPEG → WebP** (same visual quality, 30–40% smaller)
5. **Only then** consider shrinking dimensions / dropping quality if still over budget

NEVER start with quality reduction. Compression is the last lever, not the first.

### §41.8 — Verification checklist

Before marking a hero "done":

- [ ] Source image is WebP, ≥ 1920 px wide
- [ ] `sizes` uses the capped form from §41.1
- [ ] `priority` is set on the hero (and ONLY the hero / first carousel slide)
- [ ] `object-cover` (not `fill`, not `contain` unless explicitly a logo)
- [ ] On desktop: zoom to 100% — image looks identical to the original upload
- [ ] On mobile: image is crisp, not noticeably pixelated
- [ ] Lighthouse: LCP image size matches expected byte budget (dev tools → Network → Name column shows served size)

### 🎯 Expected result

- Hero looks EXACTLY like the uploaded original on desktop ✅
- No blur at 100% zoom on 1920×1080 ✅
- Mobile gets a smaller, appropriately-sized variant ✅
- LCP still under 2.5s ✅
- File size in the 120–200 KB band for photographic heroes ✅

🚫 DO NOT BREAK: §40 targets (LCP, file size budgets), SafeImage retry/fallback logic, lazy loading for below-the-fold. §41 is a correction layer — when §40 and §41 disagree on `sizes`, follow §41.

---

## §42 🖼 HERO CLARITY POLICY — NO BLUR, NO EFFECTS (SUPERSEDES §40.3 + §41.5)

### 🎯 Goal

Hero images render at **full clarity on first paint**. No loading blur. No transition that degrades the image. What the admin uploaded is what the user sees.

### 🚨 Precedence over earlier rules

This section overrides the following parts of §40 and §41:

- **§40.3 (blur placeholder generation via `sharp`)** — NO LONGER REQUIRED. Do not compute `blurDataURL`; do not store it in section JSON.
- **§40.1 (`placeholder="blur"` + `blurDataURL` props)** — NO LONGER REQUIRED. Remove both props from every hero `<SafeImage>`.
- **§41.5 (blur behavior during load)** — INVALID. Blur never appears, not even briefly.

Everything else in §40 and §41 stands (source dimensions, `sizes` capping, `priority` on first slide only, quality 80–90 band).

### §42.1 — Canonical hero `<SafeImage>` props

```tsx
<SafeImage
  src={hero.backgroundImage}
  alt={hero.heading}
  fill
  priority
  sizes="(max-width: 768px) 100vw, 1920px"
  className="object-cover"
/>
```

Note what is **removed** vs §40.1:

- ❌ NO `placeholder="blur"`
- ❌ NO `blurDataURL={…}`

Everything else is unchanged.

### §42.2 — Forbidden visual effects on hero images

| Effect | Why forbidden |
|---|---|
| `placeholder="blur"` | Shows a blurred low-res preview before decode — visible quality hit |
| `blurDataURL` | Only used by `placeholder="blur"`; no reason to store if unused |
| CSS `filter: blur(*)` on image | Obvious clarity loss |
| CSS `backdrop-filter: blur(*)` on overlay | Reduces perceived sharpness of image beneath; expensive on mobile |
| `transform: scale(>1)` | Upscales image via CSS → softness |
| Framer-motion `filter: 'blur(6px) → blur(0px)'` reveal | Starts blurred; user sees a blurry frame |
| `transition: opacity` with staggered children | Delays full-quality render (reinforces §35 hero animation ban) |
| Overlay opacity > 0.4 | Obscures image detail; if contrast is an issue, darken the image at encode time instead of overlaying heavily |

### §42.3 — Allowed CSS only

```css
/* The entire allowed CSS surface for a hero image */
object-fit: cover;         /* or `contain` for logos */
width: 100%;
height: 100%;
```

Everything else on the image element is forbidden. Gradients/overlays live on sibling elements, never on the image itself.

### §42.4 — Overlay rules (tightens §40.5)

- ✅ Single overlay element, sibling to the image (never on the image)
- ✅ Max opacity: `bg-black/40` — higher than that hides upload detail
- ✅ Flat color preferred; 2-stop linear gradient allowed only for text-contrast reasons (`from-black/50 to-transparent`)
- ❌ NO `backdrop-blur-*` on the overlay — defeats the entire clarity policy

### §42.5 — Image delivery (reinforces §41.1 / §41.2)

- Desktop source ≥ 1920 px wide — non-negotiable for sharp rendering on FHD+ monitors
- Mobile source 800–1000 px — right-sized, no downscale waste
- WebP or AVIF only — NEVER upscale a small PNG/JPEG source
- Admin UI MUST warn if upload is < 1920 px on hero fields

### §42.6 — Hero carousel behavior

```tsx
{slides.map((slide, i) => (
  <SafeImage
    key={slide.id}
    src={slide.image}
    alt={slide.headline}
    fill
    priority={i === 0}
    sizes="(max-width: 768px) 100vw, 1920px"
    className="object-cover"
  />
))}
```

- First slide: `priority`, eager decode, no blur
- Slides 2..N: default lazy, no `priority`, no blur
- NEVER precompute or display blur on any slide

### §42.7 — Compression quality (reinforces §41.3)

- WebP quality: **85** (default), range **80–90**
- AVIF quality: **65** (≈ visual equivalent of WebP 85), range **60–75**
- NEVER below quality 70 (WebP) / 55 (AVIF) — causes visible blocking artifacts
- Chroma subsampling `4:4:4` for text-on-image heroes (preserves edge sharpness)

### §42.8 — Priority order when tuning clarity vs performance

1. **Clarity first** — image must look identical to upload at 100% zoom
2. **Correct source dimensions** — ≥ 1920 px for desktop heroes
3. **Delivery (`sizes`, `priority`)** — free, no quality cost
4. **Format** — WebP/AVIF, no quality loss vs JPEG
5. **Compression** — last lever; never drop below the bands in §42.7

If a hero can't fit in 200 KB at quality 85 / 1920 px wide, reduce source dimensions toward 1600 px before reducing quality.

### §42.9 — Final checklist

Before a hero ships:

- [ ] No `placeholder="blur"` prop anywhere
- [ ] No `blurDataURL` stored in DB or passed as prop
- [ ] No `filter: blur` or `backdrop-filter: blur` in any stylesheet or inline style
- [ ] No framer-motion blur-transition on hero content
- [ ] Overlay opacity ≤ 0.4
- [ ] Source image ≥ 1920 px (desktop) in WebP/AVIF at quality 80–90
- [ ] `sizes="(max-width: 768px) 100vw, 1920px"` on the `<SafeImage>`
- [ ] `priority` on the hero (or first carousel slide only)
- [ ] At 100% browser zoom: image looks pixel-identical to the uploaded original
- [ ] Lighthouse LCP ≤ 2.5s, Performance ≥ 90 desktop

### 🎯 Expected result

- Pixel-perfect clarity on first paint ✅
- Zero blur frames during load ✅
- No CSS filter or motion-driven distortion ✅
- Mobile still gets the right-sized image via `sizes` ✅
- Performance budget held because clarity doesn't mean bigger files — it means the right source at the right `sizes` ✅

🚫 DO NOT BREAK: SafeImage retry/fallback/placeholder-on-missing (that placeholder is a STATIC PNG, not a blur preview — unrelated), lazy loading for below-the-fold sections, ISR, module architecture.

**Authority precedence across image rules:** §42 > §41 > §40 > §29. When earlier sections contradict §42 on blur, §42 wins.

---

## §43 📱 RESPONSIVE DESIGN + SCROLL-TRIGGERED TEXT ANIMATION (MANDATORY)

Applies to **every public page AND every admin dashboard page**. Non-negotiable — any new section or page must ship with this scale out of the gate. No "we'll fix it later" — fix it now.

### §43.1 🎯 Mandatory breakpoint scale

Use Tailwind's default breakpoints. You MUST provide a value for each step where the element meaningfully changes size. Skipping `md:` is the most common mistake — don't.

| Prefix | Min width | Device                               |
| ------ | --------- | ------------------------------------ |
| base   | 0         | Phones (320–639 px)                  |
| `sm:`  | 640 px    | Large phones / small tablets         |
| `md:`  | 768 px    | Tablets                              |
| `lg:`  | 1024 px   | Small laptops / landscape tablets    |
| `xl:`  | 1280 px   | Desktops                             |
| `2xl:` | 1536 px   | Large desktops (optional)            |

### §43.2 🔤 Mandatory text-size scale

Copy this table verbatim when choosing classes. Don't invent your own scale.

| Element                        | base       | sm          | md          | lg           | xl         |
| ------------------------------ | ---------- | ----------- | ----------- | ------------ | ---------- |
| Hero H1 (primary, LCP)         | `text-3xl` | `sm:text-4xl` | `md:text-4xl` | `lg:text-5xl` | `xl:text-5xl` |
| Section H2 (below-fold)        | `text-2xl` | `sm:text-3xl` | `md:text-4xl` | `lg:text-5xl` | —          |
| Sub-heading H3                 | `text-xl`  | `sm:text-2xl` | `md:text-2xl` | `lg:text-3xl` | —          |
| Eyebrow / label (UPPERCASE)    | `text-xs`  | `sm:text-sm`  | `md:text-base`| —            | —          |
| Body paragraph (primary)       | `text-sm`  | `sm:text-base`| `md:text-lg`  | `lg:text-xl`  | —          |
| Body paragraph (secondary)     | `text-xs`  | `sm:text-sm`  | `md:text-base`| —            | —          |
| Button / link                  | `text-sm`  | `sm:text-base`| —            | —            | —          |
| Footer link                    | `text-xs`  | `sm:text-sm`  | `md:text-base`| —            | —          |

**Never use** `text-md` — it does not exist in Tailwind and silently falls back to default. Use `text-base`.

### §43.3 📏 Mandatory spacing scale

```
Section vertical padding:   py-16 sm:py-20 md:py-24 lg:py-28
Section horizontal padding: px-4 sm:px-6 lg:px-8
Container max-width:        max-w-7xl (or max-w-6xl for text-heavy)
Grid gaps (body content):   gap-8 sm:gap-10 md:gap-12 lg:gap-16
Space between H2 and body:  mb-10 sm:mb-12 md:mb-14 lg:mb-20
```

Hero is the only exception — use a `min-h-[...]` scale instead (`min-h-[60vh] sm:min-h-[70vh] lg:min-h-screen`).

### §43.4 🧱 Grid stacking rules

| Grid size        | Stack breakpoint | Example                                              |
| ---------------- | ---------------- | ---------------------------------------------------- |
| 2-col content    | `md:grid-cols-2` | `grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16`   |
| 3-col cards      | `sm:` then `lg:` | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`          |
| 4–5 col footer   | progressive      | `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5` |
| 6 uniform pills  | balanced         | `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`          |

### §43.5 🛡 Overflow safety (prevents horizontal scroll on 320 px)

Every grid child must have `min-w-0` so long text doesn't stretch the track. Every long-string container (links, emails, URLs, addresses) must have `break-words`. Phone numbers get `whitespace-nowrap`. Emails on xs only may use `break-all sm:break-normal`.

```tsx
<div className="grid grid-cols-2 gap-6 md:grid-cols-4">
  <div className="min-w-0">            {/* prevents overflow */}
    <a className="break-words">…</a>
  </div>
</div>
```

### §43.6 🎬 Scroll-triggered text animation (MANDATORY for every non-hero section)

Goal: when the user scrolls, every block of text fades in smoothly. No plain static text below the fold.

**Required primitives** (both already exist — DO NOT re-implement):

- `@/lib/animation-variants` → `container`, `fadeUp`, `fadeUpSlow`, `scaleIn`, `defaultViewport`
- `@/components/shared` → `SplitWords` (word-by-word reveal for headings)

**Required pattern for every section component:**

```tsx
'use client';
import { motion } from 'framer-motion';
import { SplitWords } from '@/components/shared';
import { container, fadeUp, defaultViewport } from '@/lib/animation-variants';

export function MySection({ data }: Props) {
  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-28">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <motion.h2
          variants={fadeUp}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
        >
          <SplitWords text={data.heading} inheritParent />
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="mt-4 text-sm sm:text-base md:text-lg"
        >
          {data.body}
        </motion.p>
      </motion.div>
    </section>
  );
}
```

**Animation rules (strict):**

| Rule | Why |
| ---- | --- |
| ✅ Wrap every section in ONE motion parent with `variants={container}` | One `IntersectionObserver` per section instead of N |
| ✅ Children use `variants={fadeUp}` — no per-child `whileInView` | Parent triggers, children inherit |
| ✅ Use `<SplitWords>` for the primary heading of every section | Word-by-word reveal is the project's signature |
| ✅ Pass `inheritParent` to `<SplitWords>` when it sits inside a motion parent | Avoids nested stagger conflicts |
| ✅ `viewport={defaultViewport}` (`once:true, amount:0.25`) | Animate once, never on scroll-up |
| ✅ Transform + opacity only | GPU path; no layout thrash |
| ❌ NO animation in hero (see §40) | LCP must not wait |
| ❌ NO `filter`, `blur`, `scale`-heavy, `rotate`-heavy on body text | Glitch + repaint |
| ❌ NO `animate={{...}}` loops on public pages | Battery drain, CPU waste |
| ❌ NO `setState` inside `requestAnimationFrame` | Triggers a full React render every frame |

### §43.7 🧪 Admin dashboard responsive rules (MANDATORY for every `/admin/**` page)

The dashboard is used from phones too (content fixes on the go). Every admin page must survive 360 px width without horizontal scroll.

```tsx
// Page header — stack on mobile, row on desktop
<div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
  <div className="min-w-0">
    <h1 className="text-xl sm:text-2xl md:text-3xl">Page Manager</h1>
    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">…</p>
  </div>
  <button className="w-full sm:w-auto …">Save</button>   {/* full-width on mobile */}
</div>

// Tabs — always horizontal scrollable, never wrap
<div className="flex overflow-x-auto border-b">
  {TABS.map((t) => (
    <button className="whitespace-nowrap px-3 py-2.5 text-sm sm:px-4 sm:py-3 sm:text-base">
      {t.label}
    </button>
  ))}
</div>

// Tab panel padding
<div className="space-y-4 p-4 sm:space-y-6 sm:p-6">…</div>

// Every form input — always w-full
<input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />

// Nested card (block list item) — less padding on mobile
<div className="space-y-3 rounded-lg border bg-background/60 p-3 sm:p-4">…</div>

// Inline row that could wrap — wrap + gap
<div className="flex flex-wrap items-center justify-between gap-2">…</div>
```

**Admin rules (strict):**

- ✅ `w-full sm:w-auto` on every primary action button — full-width touch target on phones
- ✅ `overflow-x-auto` on tab rows, data tables, and wide toolbars
- ✅ `min-w-0` on every flex/grid child that contains long strings
- ✅ Padding scales `p-3 sm:p-4` / `p-4 sm:p-6` — never hard-code `p-6` everywhere
- ✅ Text scales `text-xl sm:text-2xl md:text-3xl` for page titles
- ❌ NO admin page with fixed widths (`w-[640px]`) that break at 360 px
- ❌ NO buttons smaller than 40 px touch target (min `py-2` with `text-sm`)

### §43.8 ✅ Pre-merge responsive checklist

Before shipping any new section or page, click through these at 320 px, 375 px, 768 px, 1024 px, and 1440 px. Every one must pass:

- [ ] No horizontal scrollbar at any width
- [ ] All text fits within its column — no overflow, no truncation you didn't plan
- [ ] Grids stack at the right breakpoint (2-col at `md:`, 3+ col at `sm:`)
- [ ] Every primary heading uses `<SplitWords>` and reveals on scroll
- [ ] Every body paragraph uses `motion.p variants={fadeUp}`
- [ ] Hero has NO scroll animation (initial/animate only, or static)
- [ ] Buttons are full-width on xs, auto-width on sm+
- [ ] Admin tabs scroll horizontally without wrapping
- [ ] Footer works at 320 px — contact items stack cleanly
- [ ] Lighthouse mobile Performance ≥ 75, LCP ≤ 2.5 s

### §43.9 🎯 Authority

When §43 conflicts with an earlier section's casual example, §43 wins. The scale tables in §43.2 and §43.3 are the single source of truth for sizing. Earlier sections' one-off class strings in code snippets are illustrative — always prefer the §43 scale.

---

## §44 2xl Responsiveness + Section-Matched Skeletons (MANDATORY)

> **Rule:** Every new page — public OR admin — must look great on a 1920 px / 2560 px monitor AND show a section-matched skeleton while loading. These are non-negotiable steps in the "create a page" workflow.

---

### §44.1 Why 2xl matters

The Tailwind `2xl:` breakpoint fires at **≥ 1536 px**. Without it, text, images, and boxes stop growing at `lg:` (1024 px) and look tiny on large desktop monitors. The fix is always to add `2xl:` variants that continue the scaling progression.

---

### §44.2 2xl scale table — Public pages

Apply these to every public-facing section component.

| Element | lg: class | 2xl: class to add |
|---|---|---|
| Section vertical padding | `lg:py-28` | `2xl:py-36` or `2xl:py-40` |
| Container max-width | `max-w-7xl` / `max-w-6xl` | `2xl:max-w-screen-2xl` |
| Container horizontal padding | `lg:px-8` | `2xl:px-20` |
| Hero padding-top | `lg:pt-40` | `2xl:pt-52` |
| Hero padding-bottom | `lg:pb-24` | `2xl:pb-36` |
| H1 heading | `xl:text-6xl` | `2xl:text-7xl` |
| H2 section heading | `lg:text-5xl` | `2xl:text-6xl` |
| H3 sub-heading | `lg:text-2xl` | `2xl:text-3xl` |
| Body paragraph | `lg:text-xl` | `2xl:text-2xl` |
| Small / meta text | `lg:text-base` | `2xl:text-lg` |
| Top margin after heading | `lg:mt-6` | `2xl:mt-8` |
| Paragraph max-width | `max-w-2xl` | `2xl:max-w-3xl` |
| Grid gap | `lg:gap-16` | `2xl:gap-20` or `2xl:gap-28` |
| Portrait / feature image | `lg:w-80` | `2xl:w-96` |

`2xl:max-w-screen-2xl` is the canonical class for a full-width 2xl container (do not use arbitrary `2xl:max-w-[1920px]`).

---

### §44.3 2xl scale table — Admin panel

Apply these to every admin layout element and page.

| Element | Current | 2xl: to add |
|---|---|---|
| Sidebar width | `w-64` | `2xl:w-72` |
| Main content left margin | `md:ml-64` | `2xl:ml-72` |
| Sidebar header height | `h-16` | `2xl:h-20` |
| Sidebar header padding | `px-6` | `2xl:px-8` |
| Sidebar title | `text-lg` | `2xl:text-xl` |
| Sidebar nav item (parent) | `py-2.5 pl-3 text-sm` | `2xl:py-3 2xl:pl-4 2xl:text-base` |
| Sidebar nav item (child) | `text-[13px] px-2.5 py-2` | `2xl:text-sm 2xl:px-3 2xl:py-2.5` |
| Sidebar footer | `p-4 text-xs` | `2xl:p-5 2xl:text-sm` |
| Desktop topbar height | `h-16` | `2xl:h-20` |
| Desktop topbar padding | `px-6` | `2xl:px-8` |
| Main content padding | `sm:p-6` | `2xl:p-10` |
| Page container (hub pages) | `max-w-5xl` | `2xl:max-w-7xl` |
| Page container (CRUD pages) | `max-w-6xl` | `2xl:max-w-7xl` |
| Page title | `md:text-3xl` | `2xl:text-4xl` |
| Hub page H1 | `md:text-4xl` | `2xl:text-5xl` |
| StatCard value | `text-2xl` | `2xl:text-3xl` |
| Tab content padding | `sm:p-6` | `2xl:p-8` |
| Tab button | `sm:px-4 sm:py-3 sm:text-base` | `2xl:px-6 2xl:py-4 2xl:text-lg` |
| Save button | `sm:px-6 sm:text-base` | `2xl:px-8 2xl:py-3 2xl:text-lg` |
| Card grid (hub pages) | `lg:grid-cols-4 sm:gap-5` | `2xl:grid-cols-5 2xl:gap-6` |
| Card icon | `h-12 w-12 rounded-xl` | `2xl:h-14 2xl:w-14 2xl:rounded-2xl` |
| Card label text | `text-sm` | `2xl:text-base` |

---

### §44.4 Tailwind canonical class warnings

The Tailwind v4 linter flags arbitrary values. Always use canonical equivalents:

| Wrong (linter will warn) | Correct canonical |
|---|---|
| `2xl:w-[480px]` | `2xl:w-120` |
| `2xl:w-[520px]` | `2xl:w-130` |
| `2xl:w-[512px]` | `2xl:w-lg` |
| `2xl:w-[576px]` | `2xl:w-xl` |
| `2xl:min-w-[260px]` | `2xl:min-w-65` |
| `2xl:max-w-screen-xl` | `2xl:max-w-7xl` |
| `2xl:w-[144px]` | `2xl:w-xl` |
| `bg-gradient-to-br` | `bg-linear-to-br` |

When you see a linter warning `"The class X can be written as Y"`, fix it before moving on.

---

### §44.5 Section-matched skeleton loaders (YouTube-style)

Every section component file must export **two** things:
1. The real component — `export function HeroSection`
2. A matching skeleton — `export function HeroSectionSkeleton`

The skeleton must mirror the **exact structure and proportions** of the real section: same background colour, same padding, same grid layout, placeholder blocks for text and images. Users should feel zero layout shift when real content replaces it.

**Rule:** Never use the generic `<SectionSkeleton height="lg" />` for a new page. Always build a section-specific skeleton.

---

### §44.6 How to write a skeleton component

```tsx
// At the bottom of every section file, after the real component:

export function HeroSectionSkeleton() {
  return (
    // 1. Same <section> with same background + min-height as the real section
    <section className="relative flex min-h-[60vh] animate-pulse items-center overflow-hidden bg-muted sm:min-h-[70vh] lg:min-h-screen">
      {/* 2. Identical container padding */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-12 pt-20 sm:px-6 sm:pb-16 sm:pt-28 lg:px-8 lg:pb-24 lg:pt-40 2xl:max-w-screen-2xl 2xl:px-20 2xl:pb-36 2xl:pt-52">
        {/* 3. Heading placeholder — height matches real heading font-size */}
        <div className="h-9 w-56 rounded-md bg-muted-foreground/20 sm:h-11 sm:w-72 lg:h-14 lg:w-96 2xl:h-16 2xl:w-120" />
        {/* 4. Paragraph placeholder — same max-width and line count */}
        <div className="mt-3 max-w-xl space-y-2 sm:mt-4 sm:max-w-2xl lg:mt-6 2xl:mt-8 2xl:max-w-3xl">
          <div className="h-4 w-full rounded bg-muted-foreground/15 sm:h-5 2xl:h-6" />
          <div className="h-4 w-5/6 rounded bg-muted-foreground/15 sm:h-5 2xl:h-6" />
          <div className="h-4 w-3/4 rounded bg-muted-foreground/15 sm:h-5 2xl:h-6" />
        </div>
      </div>
    </section>
  );
}
```

**Key rules:**
- `animate-pulse` goes on the outermost skeleton element only — not on every child div.
- Skeleton section background = real section background but desaturated: use `bg-muted` for light sections; use the actual colour with reduced-opacity placeholders (`bg-white/20`, `bg-white/15`) for dark-background sections.
- Placeholder heights mirror real font sizes: `h-7` small text → `h-9/h-10` medium → `h-12/h-14` large heading → `h-16` 2xl heading.
- Placeholder widths use fractional Tailwind widths (`w-56`, `w-72`, `w-96`, `w-5/6`, `w-3/4`) that roughly match real text length.
- Grid and image skeletons must match the **same grid template** as the real content (`grid md:grid-cols-2`, portrait `aspect-[3/3.8]`, etc.).
- Skeleton components must include `2xl:` variants matching the real component's 2xl padding and sizes.

---

### §44.7 Skeleton colour guide by section background

| Section background | Heading skeleton | Text line skeleton |
|---|---|---|
| White / `bg-background` | `bg-muted-foreground/20` | `bg-muted-foreground/15` |
| Dark teal `bg-[#0a7362]` | `bg-white/20` | `bg-white/15` |
| Green `bg-[#7eaf7e]` | `bg-white/25` | `bg-white/20` |
| Hero with image + overlay | Whole section `bg-muted`; placeholders `bg-muted-foreground/20` | `bg-muted-foreground/15` |
| Dark brown + image overlay | `bg-white/20` | `bg-white/15` |
| Sunset / gradient bg | Keep the real gradient; use `bg-white/30` | `bg-white/20` |

---

### §44.8 Wiring skeletons into main.tsx and loading.tsx

**Step 1 — Export from section file:**
```tsx
// src/modules/{page}/components/hero-section.tsx
export function HeroSection({ data }) { /* ... */ }
export function HeroSectionSkeleton() { /* ... */ }  // ← add this
```

**Step 2 — Use in main.tsx dynamic fallbacks:**
```tsx
// src/modules/{page}/components/main.tsx
import { HeroSection } from './hero-section';
import { MissionSectionSkeleton } from './mission-section';
import { VisionSectionSkeleton } from './vision-section';

const MissionSection = dynamic(
  () => import('./mission-section').then(m => m.MissionSection),
  { loading: () => <MissionSectionSkeleton /> },  // ← section-specific, never generic
);
const VisionSection = dynamic(
  () => import('./vision-section').then(m => m.VisionSection),
  { loading: () => <VisionSectionSkeleton /> },
);
```

**Step 3 — Use in the route's loading.tsx:**
```tsx
// src/app/(public)/{page}/loading.tsx
import { HeroSectionSkeleton } from '@/modules/{page}/components/hero-section';
import { MissionSectionSkeleton } from '@/modules/{page}/components/mission-section';
import { VisionSectionSkeleton } from '@/modules/{page}/components/vision-section';

export default function PageLoading() {
  return (
    <main>
      <HeroSectionSkeleton />
      <MissionSectionSkeleton />
      <VisionSectionSkeleton />
    </main>
  );
}
```

---

### §44.9 Critical routing rules for loading.tsx

- `loading.tsx` only fires for the `page.tsx` in the **same directory level**. The home page lives at `src/app/(public)/page.tsx`, so its skeleton lives at `src/app/(public)/loading.tsx` — NOT at `src/app/(public)/home/loading.tsx`.
- **Never include a Navbar skeleton** in any `loading.tsx`. The real Navbar is rendered by `(public)/layout.tsx` above the Suspense boundary and is always visible during loading. A fake navbar skeleton would show two navbars.
- The root `src/app/loading.tsx` is a final fallback — keep it as a minimal blank div or spinner, never put page-specific skeletons there.

---

### §44.10 Admin loading.tsx — spinner only

Admin pages use a simple centered spinner, not section-matched skeletons:

```tsx
// src/app/admin/(dashboard)/{page}/loading.tsx
import { Loader2 } from 'lucide-react';

export default function AdminPageLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
```

Admin pages that fetch their own data (the-story, core-values editors) handle their loading state inline with this same spinner — no separate `loading.tsx` needed.

---

### §44.11 Checklist — every new page

Before marking a page "done", verify all of these:

**Public page — 2xl responsiveness:**
- [ ] All section containers use `2xl:max-w-screen-2xl 2xl:px-20`
- [ ] All section paddings have `2xl:py-36` or larger
- [ ] Hero heading has `2xl:text-7xl`, section headings have `2xl:text-6xl`
- [ ] Paragraphs have `2xl:text-2xl`, subtitles `2xl:text-3xl`
- [ ] Images/portraits have `2xl:w-96` or larger as appropriate
- [ ] Grid gaps have `2xl:gap-20` to `2xl:gap-32`
- [ ] No Tailwind linter warnings (no `w-[Npx]` arbitrary values)

**Public page — skeletons:**
- [ ] Every section file exports a `{SectionName}Skeleton` component
- [ ] Skeleton matches the real section's background and min-height
- [ ] Skeleton includes matching `2xl:` variants for padding and placeholder sizes
- [ ] `main.tsx` dynamic imports use section-specific skeletons, not `<SectionSkeleton>`
- [ ] `loading.tsx` is at the correct route directory level
- [ ] `loading.tsx` lists all section skeletons in order, wrapped in `<main>`
- [ ] `loading.tsx` has NO Navbar skeleton

**Admin page — 2xl responsiveness:**
- [ ] Container uses `2xl:max-w-7xl`
- [ ] Page title has `2xl:text-4xl` or `2xl:text-5xl`
- [ ] StatCard values have `2xl:text-3xl`
- [ ] Tab content padding has `2xl:p-8`
- [ ] Save button has `2xl:px-8 2xl:text-lg`

---

### §44.12 Authority

§44 supersedes any earlier skeleton or responsive example that uses `<SectionSkeleton height="..." />` or stops scaling at `lg:`. When building a new page, always follow §44.

