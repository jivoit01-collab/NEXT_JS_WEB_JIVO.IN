# Jivo Wellness - Master Build Prompt

> **This file is your master instruction set.** Share this with Claude Code in the Jivo Wellness project. When you say "create the home page" or "create the about page", Claude will follow this exact pattern to build everything: module components, Prisma models, admin dashboard page, API routes, and CRUD operations.

---

## Quick Reference

- **Architecture:** See `EXPLAIN.md` for full tech stack, folder structure, and system details
- **Admin Styling:** Copy exact admin dashboard design from `cd ../mera-pind-balle-balle` (sidebar, topbar, cards, forms, tables)
- **Reference Project:** `../mera-pind-balle-balle/src/app/(admin)/admin/dashboard/` for admin UI patterns

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

Create/update the model in `prisma/schema.prisma` for the page's data.

**Pattern for CMS-managed pages:**
```prisma
model PageContent {
  id        String   @id @default(cuid())
  page      String                // "home", "about", "contact"
  section   String                // "hero", "mission", "features", "seo"
  title     String?
  content   Json                  // Flexible JSON for any section structure
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@unique([page, section])
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

## Admin Dashboard Design (EXACT COPY from Mera Pind Balle Balle)

The admin dashboard must match the exact styling from the reference project at `../mera-pind-balle-balle`.

### Dashboard Layout (`src/app/(admin)/admin/dashboard/layout.tsx`)

**Copy this exact pattern from MPBB:**
- `"use client"` component
- Fixed 256px sidebar on left (`w-64 bg-card border-r shadow-sm`)
- Mobile: hamburger → slide-in sidebar with backdrop overlay (`bg-black/40`)
- Sidebar header: Back arrow (link to `/`) + "Admin Panel" title + close button (mobile)
- Scrollable nav items with icons from `lucide-react`
- Active state: `bg-primary text-primary-foreground` on active link
- Hover state: `hover:bg-accent text-foreground/80 hover:text-foreground`
- Main content area: `flex-1 md:ml-64 min-w-0`
- Mobile topbar: `sticky top-0 z-20 h-14 border-b bg-background/95 backdrop-blur`
- Desktop topbar: `sticky top-0 z-20 h-12 border-b bg-background/95 backdrop-blur`
- Both topbars have: `ModeToggle` + `AdminLogoutButton`
- Content area: `<main className="p-4 sm:p-6">{children}</main>`

### Sidebar Menu Items

```tsx
const menuItems = [
  { title: "Dashboard",      href: "/admin/dashboard",               icon: LayoutDashboard },
  { title: "Home Page",      href: "/admin/dashboard/home",          icon: Home },
  { title: "About Page",     href: "/admin/dashboard/about",         icon: Info },
  { title: "Products",       href: "/admin/dashboard/products",      icon: Package },
  { title: "Orders",         href: "/admin/dashboard/orders",        icon: ShoppingCart },
  { title: "Blogs",          href: "/admin/dashboard/blogs",         icon: FileText },
  { title: "Careers",        href: "/admin/dashboard/careers",       icon: BriefcaseBusiness },
  { title: "Contact Leads",  href: "/admin/dashboard/contact",       icon: Mail },
  { title: "Newsletter",     href: "/admin/dashboard/newsletter",    icon: Newspaper },
  { title: "Navbar",         href: "/admin/dashboard/navbar",        icon: Navigation },
  { title: "SEO",            href: "/admin/dashboard/seo",           icon: Globe },
  { title: "Settings",       href: "/admin/dashboard/settings",      icon: Settings },
  { title: "Uploads",        href: "/admin/dashboard/uploads",       icon: Upload },
];
```

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

**IMPORTANT: Follow the EXACT admin styling from Mera Pind Balle Balle.**

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

  // Tab-based editor UI (matches MPBB admin/dashboard/home pattern)
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
          {/* See MPBB admin/dashboard/home/page.tsx for exact field patterns */}
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

### 10. Page Documentation (`docs/home.md`)

```markdown
# Home Page - API Documentation

## Public API

### GET /api/home
Returns all active home page sections.

**Response:**
{
  "success": true,
  "data": {
    "hero": {
      "title": "India's Largest Cold Press Canola Oil Seller",
      "subtitle": "Premium oils for a healthier life",
      "image": "https://utfs.io/f/xxx.webp",
      "primaryCTA": { "label": "Shop Now", "link": "/products" },
      "secondaryCTA": { "label": "Learn More", "link": "/about" }
    },
    "mission": {
      "title": "Our Mission",
      "description": "...",
      "image": "https://utfs.io/f/xxx.webp",
      "stats": [
        { "label": "Products", "value": "50+" },
        { "label": "Happy Customers", "value": "1M+" }
      ]
    },
    "health-benefits": { ... },
    "testimonials": { ... },
    "cta": { ... }
  }
}

## Admin API

### GET /api/admin/home
Auth: Required (ADMIN/SUPER_ADMIN)
Returns ALL sections (including inactive).

### POST /api/admin/home
Auth: Required (ADMIN/SUPER_ADMIN)
Create or update a section.

**Request Body:**
{
  "section": "hero",
  "content": {
    "title": "India's Largest Cold Press Canola Oil Seller",
    "subtitle": "Premium oils for a healthier life",
    "image": "https://utfs.io/f/xxx.webp",
    "primaryCTA": { "label": "Shop Now", "link": "/products" },
    "secondaryCTA": { "label": "Learn More", "link": "/about" }
  }
}

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

- **Hero / first section:** eager (SSR, no dynamic import)
- **All other sections:** wrapped in `dynamic()` + `<LazyOnView>`
- **Heavy components** (TipTap editor, Swiper carousel, chart libs): always `dynamic(..., { ssr: false })`
- **Admin dashboard tabs:** each tab's body is lazy-loaded with `dynamic()` — tab content only renders when user clicks the tab
- **Images:** use `<SafeImage loading="lazy" />` for below-the-fold, `priority` only on hero image
- **Never** import one page's components from another page's `page.tsx`

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

## 🖼 IMAGE RULE

```js
<Image src="/img.png" alt="description" priority />
```

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

1. **Always read the reference project first**: `cd ../mera-pind-balle-balle` to check how admin pages are styled
2. **Follow the module structure exactly**: types → validations → data → actions → components → main.tsx
3. **Admin pages must match MPBB styling**: same sidebar, topbar, form patterns, button styles, tab interfaces
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
