# Jivo Wellness - Complete Project Explanation

> **India's Largest Cold Press Canola Oil Seller** — A full-stack e-commerce and content management platform for premium oils, superfoods & wellness products. Built with a **built-in Admin CMS Dashboard** that lets a non-developer manage the **entire website** — every page's content, images, products, orders, blogs, navbar, SEO, and more — all from the browser. **Zero code changes needed** for day-to-day content management.


## SEO + PERFORMANCE FLOW

1. Page request comes
2. Server renders HTML (SSR/SSG)
3. Metadata generated via resolveSeo()
4. Structured data injected
5. Above-the-fold content rendered instantly
6. Below-the-fold components lazy loaded
7. Images optimized via next/image
---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Folder Structure (Industry-Level)](#2-folder-structure-industry-level)
3. [How the App Architecture Works](#3-how-the-app-architecture-works)
4. [Layout System (How Pages Get Navbar/Footer)](#4-layout-system-how-pages-get-navbarfooter)
5. [Styling System](#5-styling-system)
6. [Authentication System](#6-authentication-system)
7. [Database Layer (PostgreSQL + Prisma)](#7-database-layer-postgresql--prisma)
8. [API Architecture & Server Actions](#8-api-architecture--server-actions)
9. [Image Upload System (UploadThing + Sharp)](#9-image-upload-system-uploadthing--sharp)
10. [Admin Dashboard - Complete CMS](#10-admin-dashboard---complete-cms)
11. [Public Pages - SSR + Client Hydration Pattern](#11-public-pages---ssr--client-hydration-pattern)
12. [State Management (Redux Toolkit + React Query)](#12-state-management-redux-toolkit--react-query)
13. [Animation System](#13-animation-system)
14. [E-commerce & Cart System](#14-e-commerce--cart-system)
15. [SEO System](#15-seo-system)
16. [Security Architecture](#16-security-architecture)
17. [Rate Limiting (Upstash Redis)](#17-rate-limiting-upstash-redis)
18. [Error Monitoring (Sentry)](#18-error-monitoring-sentry)
19. [Rich Text Editor (TipTap)](#19-rich-text-editor-tiptap)
20. [Forms & Validation](#20-forms--validation)
21. [Site Constants & Configuration](#21-site-constants--configuration)
22. [Development Environment (ESLint, Prettier, Bundle Analysis)](#22-development-environment-eslint-prettier-bundle-analysis)
23. [Deployment](#23-deployment)
24. [Environment Variables](#24-environment-variables)
25. [How to Recreate This Architecture (Step-by-Step)](#25-how-to-recreate-this-architecture-step-by-step)

---

## 1. Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js (App Router + Turbopack) | 16.x | Full-stack React framework with SSR/SSG |
| **Language** | TypeScript (strict mode) | 5.x | Type-safe JavaScript |
| **UI Library** | React | 19.x | Component-based UI |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS with oklch color variables |
| **UI Components** | Shadcn/ui (New York style) + Radix UI | Latest | Pre-built accessible components |
| **Icons** | Lucide React | Latest | Clean icon library |
| **Animations** | Framer Motion | Latest | Page transitions, scroll reveals |
| **Carousels** | Swiper | Latest | Slider/carousel components |
| **Database** | PostgreSQL | Latest | Relational database |
| **ORM** | Prisma (native `pg` adapter) | 7.x | Type-safe database access |
| **Auth** | NextAuth v5 (JWT strategy) | 5.0-beta | Admin & user authentication |
| **State (Client)** | Redux Toolkit | Latest | UI state (cart sidebar, modals, nav) |
| **State (Server)** | React Query (@tanstack/react-query) | Latest | Server data fetching + caching |
| **File Upload** | UploadThing | Latest | Managed file uploads |
| **Image Processing** | Sharp | Latest | Server-side resize/compress/WebP |
| **Rate Limiting** | Upstash Redis | Latest | Serverless API rate limiting |
| **Error Monitoring** | Sentry (@sentry/nextjs) | Latest | Runtime error tracking |
| **Rich Text Editor** | TipTap v3 | Latest | Admin content editing |
| **Forms** | React Hook Form + Zod | Latest | Form handling + validation |
| **Notifications** | Sonner | Latest | Toast notifications |
| **XSS Prevention** | DOMPurify | Latest | HTML sanitization |
| **Theme** | next-themes | Latest | Dark/light mode toggle |
| **Formatting** | Prettier + prettier-plugin-tailwindcss | Latest | Code formatting + class sorting |
| **Bundle Analysis** | @next/bundle-analyzer | Latest | Production bundle visualization |

---

## 2. Folder Structure (Industry-Level)

```
jivo-wellness/
|
|-- prisma/
|   |-- schema.prisma               # Database schema (all models, enums, relations)
|   |-- seed.ts                      # Database seed script (initial data)
|
|-- public/                          # Static assets (favicon, logo, og-image)
|
|-- src/
|   |-- app/                         # Next.js App Router (pages + API)
|   |   |-- (public)/                # Route Group: ALL public website pages
|   |   |   |-- layout.tsx           # Public layout (fetches navbar/footer, wraps with LayoutWrapper)
|   |   |   |-- page.tsx             # Home page (/)
|   |   |   |-- loading.tsx          # Loading skeleton for public pages
|   |   |   |-- error.tsx            # Error boundary for public pages
|   |   |   |-- about/page.tsx
|   |   |   |-- blog/page.tsx
|   |   |   |-- blog/[slug]/page.tsx
|   |   |   |-- cart/page.tsx
|   |   |   |-- careers/page.tsx
|   |   |   |-- contact/page.tsx
|   |   |   |-- checkout/page.tsx
|   |   |   |-- login/page.tsx
|   |   |   |-- signup/page.tsx
|   |   |   |-- order-success/[orderId]/page.tsx
|   |   |   |-- orders/page.tsx             # User's order history
|   |   |   |-- privacy-policy/page.tsx
|   |   |   |-- product/[slug]/page.tsx     # Single product (slug-based)
|   |   |   |-- products/page.tsx
|   |   |   |-- terms-conditions/page.tsx
|   |   |
|   |   |-- (admin)/                 # Route Group: ALL admin pages
|   |   |   |-- admin/
|   |   |       |-- login/page.tsx   # Admin login page (/admin/login)
|   |   |       |-- layout.tsx       # Auth guard (checks session, redirects if not admin)
|   |   |       |-- page.tsx         # Redirects to /admin/dashboard
|   |   |       |-- dashboard/
|   |   |           |-- layout.tsx   # Dashboard shell (sidebar + topbar)
|   |   |           |-- page.tsx     # Dashboard home (stats cards, quick links)
|   |   |           |-- home/page.tsx           # Manage Homepage sections
|   |   |           |-- about/page.tsx          # Manage About page content
|   |   |           |-- products/page.tsx       # CRUD Products + Categories
|   |   |           |-- products/new/page.tsx   # Create new product form
|   |   |           |-- products/[id]/page.tsx  # Edit product form
|   |   |           |-- orders/page.tsx         # View/manage orders + status updates
|   |   |           |-- orders/[id]/page.tsx    # Order detail page
|   |   |           |-- blogs/page.tsx          # CRUD Blog posts (with TipTap editor)
|   |   |           |-- blogs/new/page.tsx      # Create new blog
|   |   |           |-- blogs/[id]/page.tsx     # Edit blog
|   |   |           |-- contact/page.tsx        # View contact form submissions
|   |   |           |-- careers/page.tsx        # View job applications
|   |   |           |-- newsletter/page.tsx     # View newsletter subscribers
|   |   |           |-- navbar/page.tsx         # Manage navigation links
|   |   |           |-- seo/page.tsx            # Manage per-page SEO metadata
|   |   |           |-- settings/page.tsx       # Global site settings (key-value)
|   |   |           |-- uploads/page.tsx        # Media library / file manager
|   |   |
|   |   |-- api/                     # API Routes
|   |   |   |-- auth/
|   |   |   |   |-- [...nextauth]/route.ts    # NextAuth handler
|   |   |   |-- home/
|   |   |   |   |-- route.ts                  # Homepage sections CRUD
|   |   |   |   |-- [id]/route.ts             # Single section
|   |   |   |-- navbar/
|   |   |   |   |-- route.ts                  # Public GET for nav links
|   |   |   |   |-- [id]/route.ts             # Admin CRUD for nav links
|   |   |   |-- seo/
|   |   |   |   |-- route.ts                  # SEO metadata CRUD
|   |   |   |   |-- [id]/route.ts             # Single SEO entry
|   |   |   |-- settings/
|   |   |   |   |-- [key]/route.ts            # Site settings by key
|   |   |   |-- upload/route.ts               # Image upload + deletion
|   |   |   |-- products/
|   |   |   |   |-- route.ts                  # Public product listing
|   |   |   |   |-- [slug]/route.ts           # Single product by slug
|   |   |   |-- orders/
|   |   |   |   |-- route.ts                  # Create order
|   |   |   |   |-- [id]/route.ts             # Order details
|   |   |   |-- contact/route.ts              # Contact form submission
|   |   |   |-- newsletter/route.ts           # Newsletter subscription
|   |   |   |-- admin/                        # Admin-only APIs (all protected)
|   |   |       |-- products/route.ts         # Admin product CRUD
|   |   |       |-- products/[id]/route.ts
|   |   |       |-- orders/route.ts           # Admin order management
|   |   |       |-- orders/[id]/route.ts
|   |   |       |-- blogs/route.ts
|   |   |       |-- blogs/[id]/route.ts
|   |   |       |-- categories/route.ts
|   |   |       |-- categories/[id]/route.ts
|   |   |       |-- contact/route.ts
|   |   |       |-- careers/route.ts
|   |   |       |-- newsletter/route.ts
|   |   |       |-- dashboard/route.ts        # Dashboard stats
|   |   |       |-- settings/route.ts
|   |   |
|   |   |-- layout.tsx               # Root layout (providers ONLY, no navbar/footer)
|   |   |-- not-found.tsx            # Custom 404 page
|   |   |-- globals.css              # Theme variables, base styles, utilities
|   |   |-- robots.ts                # SEO robots.txt generation
|   |   |-- sitemap.ts               # SEO sitemap generation
|   |
|   |-- modules/                     # Feature Modules (self-contained)
|   |   |-- home/
|   |   |   |-- actions.ts           # Server actions (CRUD for home sections)
|   |   |   |-- validations.ts       # Zod schemas for home data
|   |   |   |-- types.ts             # TypeScript types
|   |   |   |-- components/          # Home-specific UI components
|   |   |   |-- data/                # Seed/default data
|   |   |-- navbar/
|   |   |   |-- actions.ts
|   |   |   |-- validations.ts
|   |   |   |-- types.ts
|   |   |   |-- components/
|   |   |-- seo/
|   |   |   |-- actions.ts
|   |   |   |-- validations.ts
|   |   |   |-- types.ts
|   |   |   |-- components/
|   |   |-- site-settings/
|   |   |   |-- actions.ts
|   |   |   |-- validations.ts
|   |   |   |-- types.ts
|   |   |   |-- components/
|   |   |-- products/
|   |   |   |-- actions.ts
|   |   |   |-- validations.ts
|   |   |   |-- types.ts
|   |   |   |-- components/
|   |   |-- orders/
|   |   |   |-- actions.ts
|   |   |   |-- validations.ts
|   |   |   |-- types.ts
|   |   |   |-- components/
|   |   |-- blog/
|   |   |   |-- actions.ts
|   |   |   |-- validations.ts
|   |   |   |-- types.ts
|   |   |   |-- components/
|   |
|   |-- components/
|   |   |-- ui/                      # Shadcn/ui primitives (Button, Input, Dialog, Card, etc.)
|   |   |-- common/                  # Shared components
|   |   |   |-- Navbar.tsx           # Dynamic navbar (reads NavLink from DB)
|   |   |   |-- Footer.tsx           # Dynamic footer (reads SiteSetting from DB)
|   |   |   |-- LayoutWrapper.tsx    # Wraps pages with Navbar + PageTransition + Footer
|   |   |   |-- Breadcrumbs.tsx      # Breadcrumb navigation
|   |   |-- admin/                   # Admin-specific components
|   |   |   |-- AdminSidebar.tsx     # Dashboard sidebar navigation
|   |   |   |-- AdminTopbar.tsx      # Dashboard topbar (theme toggle, logout)
|   |   |   |-- AdminLogoutButton.tsx
|   |   |   |-- StatsCard.tsx        # Dashboard stat card
|   |   |   |-- DataTable.tsx        # Reusable admin data table
|   |   |   |-- RichTextEditor.tsx   # TipTap editor wrapper
|   |   |   |-- ImageUploader.tsx    # UploadThing file picker wrapper
|   |   |-- providers/               # Context providers
|   |   |   |-- AuthSessionProvider.tsx   # NextAuth SessionProvider
|   |   |   |-- ThemeProvider.tsx         # next-themes provider
|   |   |   |-- ReduxProvider.tsx         # Redux store provider
|   |   |   |-- QueryProvider.tsx         # React Query provider
|   |   |-- features/                # Feature-specific UI components (by page)
|   |   |   |-- home/               # HeroSection, FeaturedProducts, Testimonials, etc.
|   |   |   |-- products/           # ProductCard, ProductGrid, ProductFilters, etc.
|   |   |   |-- cart/               # CartSidebar, CartItem, CartSummary
|   |   |   |-- checkout/           # CheckoutForm, AddressForm, OrderSummary
|   |   |   |-- about/              # AboutHero, AboutMission, AboutTeam
|   |   |   |-- blog/               # BlogCard, BlogGrid, BlogDetail
|   |   |   |-- contact/            # ContactForm
|   |   |-- layout/                  # Layout components
|   |   |   |-- PageTransition.tsx   # Framer Motion page transition wrapper
|   |   |-- motion/                  # Animation components
|   |       |-- ScrollReveal.tsx     # Scroll-triggered reveal animation
|   |       |-- StaggerContainer.tsx # Staggered children animation
|   |       |-- ParallaxImage.tsx    # Parallax scroll effect
|   |
|   |-- store/                       # Redux Toolkit store
|   |   |-- index.ts                 # Store configuration with typed hooks
|   |   |-- slices/
|   |       |-- uiSlice.ts           # Mobile nav, active modal, theme state
|   |       |-- cartUiSlice.ts       # Cart sidebar open/close
|   |
|   |-- hooks/                       # Custom React hooks
|   |   |-- use-action.ts            # Server action wrapper with loading state
|   |   |-- use-intersection.ts      # Intersection Observer for lazy loading
|   |   |-- use-media-query.ts       # Responsive breakpoint detection
|   |   |-- use-scroll.ts            # Scroll position tracking
|   |
|   |-- lib/                         # Utilities & business logic
|   |   |-- db.ts                    # Prisma client singleton (with native pg adapter)
|   |   |-- auth.ts                  # NextAuth configuration (providers, JWT, session)
|   |   |-- auth.config.ts           # Edge-safe auth config (for middleware)
|   |   |-- uploadthing.ts           # UploadThing configuration
|   |   |-- redis.ts                 # Upstash Redis client
|   |   |-- rate-limit.ts            # Rate limiting middleware
|   |   |-- sentry.ts                # Sentry initialization
|   |   |-- constants.ts             # Site constants (name, URL, thresholds, pagination)
|   |   |-- utils.ts                 # cn() utility (clsx + tailwind-merge)
|   |   |-- formatters.ts            # Price, date, currency formatters
|   |   |-- requireAdmin.ts          # Admin auth guard for API routes
|   |   |-- sanitize.ts              # DOMPurify HTML sanitization
|   |
|   |-- middleware.ts                # Route protection middleware (admin routes)
|   |-- types/
|       |-- next-auth.d.ts           # NextAuth type extensions (role, id)
|       |-- global.d.ts              # Global type declarations
|
|-- .env.example                     # Environment variable template
|-- .prettierrc                      # Prettier configuration
|-- eslint.config.mjs                # ESLint flat config
|-- components.json                  # Shadcn/ui configuration
|-- next.config.ts                   # Next.js configuration
|-- tsconfig.json                    # TypeScript configuration
|-- postcss.config.mjs               # PostCSS (Tailwind CSS 4)
|-- package.json                     # Dependencies & scripts
```

### Key Concept: Route Groups `(public)` and `(admin)`

Route groups (folders wrapped in parentheses) **do NOT affect the URL**:

- `src/app/(public)/about/page.tsx` serves `/about` (NOT `/public/about`)
- `src/app/(admin)/admin/dashboard/page.tsx` serves `/admin/dashboard`

**Why use route groups?**
- Each group gets its **own layout**. Public pages get Navbar+Footer. Admin pages get the sidebar dashboard layout.
- Clean separation of concerns. Public and admin code never mix.

### Key Concept: Feature Modules (`src/modules/`)

Unlike traditional "put everything in one folder" approaches, each feature is **self-contained**:

```
src/modules/products/
  |-- actions.ts        # Server actions: createProduct, updateProduct, deleteProduct
  |-- validations.ts    # Zod schemas: productSchema, categorySchema
  |-- types.ts          # TypeScript types: Product, ProductWithImages
  |-- components/       # ProductForm, CategorySelect, ImageManager
```

**Why?** When you need to add a new feature (e.g., "gift cards"), you create a new module folder with all its logic in one place. No hunting across scattered folders.

---

## 3. How the App Architecture Works

### Overall Architecture Diagram

```
                    +-----------------+
                    |   Root Layout   |  <-- Providers only (Theme, Auth, Redux, QueryClient)
                    |  (no UI chrome) |
                    +--------+--------+
                             |
              +--------------+--------------+
              |                             |
    +---------+----------+      +-----------+---------+
    |   (public) Layout  |      |    (admin) Layout   |
    | Fetches nav/footer |      | Session check guard |
    | Renders Navbar +   |      | No navbar/footer    |
    | Footer via         |      +-----------+---------+
    | LayoutWrapper      |                  |
    +---------+----------+      +-----------+---------+
              |                 |   Dashboard Layout  |
     Public Pages (SSR)         | Sidebar + Topbar    |
     Home, Products, Blog       | with navigation     |
     Contact, About, etc.       +-----------+---------+
                                            |
                                   Admin CMS Pages
                                   Products Manager
                                   Orders, Blogs, etc.
```

### Data Flow: Admin writes data --> Database --> Public pages read data

```
ADMIN:                                           PUBLIC:
Admin Dashboard Page                             Public Page (e.g., /products)
    |                                                |
    v                                                v
Client Form (React state)                     Server Component (page.tsx)
    |                                                |
    v                                                v
Server Action (modules/x/actions.ts)          prisma.product.findMany({ where: { isActive: true } })
    |                                                |
    v                                                v
Zod validation (modules/x/validations.ts)     Pass data as props to Client Component
    |                                                |
    v                                                v
prisma.product.create({ data: ... })          Client Component renders UI
    |                                         with animations, interactions,
    v                                         React Query for live updates
UploadThing (images)
    |
    v
PostgreSQL record saved
```

### Two State Systems Working Together

```
REDUX TOOLKIT (Client UI State)              REACT QUERY (Server Data State)
  |                                            |
  |-- uiSlice                                  |-- useQuery("products", fetchProducts)
  |   |-- mobileNavOpen: boolean               |   staleTime: 30s
  |   |-- activeModal: string | null           |   automatic background refetch
  |   |-- theme: "light" | "dark"              |
  |                                            |-- useQuery("orders", fetchOrders)
  |-- cartUiSlice                              |   server-managed pagination
      |-- cartSidebarOpen: boolean             |
                                               |-- useMutation for create/update/delete
                                                   automatic cache invalidation
```

---

## 4. Layout System (How Pages Get Navbar/Footer)

### Root Layout (`src/app/layout.tsx`)

Contains **ONLY providers** and no visual UI:

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthSessionProvider>          {/* NextAuth session */}
          <ThemeProvider>               {/* Dark/light mode */}
            <ReduxProvider>             {/* Redux store */}
              <QueryProvider>           {/* React Query client */}
                {children}
              </QueryProvider>
            </ReduxProvider>
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
```

### Public Layout (`src/app/(public)/layout.tsx`)

Server component that fetches nav/footer data and wraps with LayoutWrapper:

```tsx
export default async function PublicLayout({ children }) {
  const navLinks = await prisma.navLink.findMany({
    where: { isVisible: true },
    orderBy: { sortOrder: "asc" },
  });
  const footerSettings = await prisma.siteSetting.findMany({
    where: { key: { startsWith: "footer_" } },
  });

  return (
    <LayoutWrapper navLinks={navLinks} footerSettings={footerSettings}>
      {children}
    </LayoutWrapper>
  );
}
```

### LayoutWrapper (`src/components/common/LayoutWrapper.tsx`)

```tsx
"use client";
export default function LayoutWrapper({ children, navLinks, footerSettings }) {
  return (
    <>
      <Navbar links={navLinks} />
      <PageTransition>{children}</PageTransition>
      <Footer settings={footerSettings} />
    </>
  );
}
```

### Admin Layout (`src/app/(admin)/admin/layout.tsx`)

No navbar/footer. Just auth check:

```tsx
export default async function AdminLayout({ children }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    redirect("/admin/login");
  }
  return <div>{children}</div>;
}
```

### Dashboard Layout (`src/app/(admin)/admin/dashboard/layout.tsx`)

Client component with a **responsive sidebar**:
- Desktop: Fixed 256px sidebar on left, main content shifts right
- Mobile: Hamburger menu opens a slide-in sidebar with backdrop overlay
- Topbar with dark mode toggle and logout button
- Navigation links with active state highlighting using `usePathname()`
- Sections: Dashboard, Products, Orders, Blogs, Contact, Careers, Newsletter, Navbar, SEO, Settings, Uploads

---

## 5. Styling System

### Tailwind CSS 4 with OKLCH CSS Variables

The project uses Tailwind CSS 4's `@theme inline` syntax with OKLCH color space (perceptually uniform):

```css
/* globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  /* ... maps CSS variables to Tailwind tokens */
}

:root {
  --radius: 0.65rem;

  /* Light Theme - Jivo Wellness Brand */
  --background: oklch(0.995 0.002 75);
  --foreground: oklch(0.145 0.004 60);
  --primary: oklch(0.55 0.18 145);            /* Brand green (wellness/organic feel) */
  --primary-foreground: oklch(0.98 0.01 145);
  --secondary: oklch(0.965 0.004 65);
  --secondary-foreground: oklch(0.215 0.005 60);
  --destructive: oklch(0.577 0.245 27.325);
  --accent: oklch(0.965 0.004 65);
  --gold: oklch(0.68 0.15 75);                /* Premium/wellness accent */
  /* ... full semantic system */
}

.dark {
  --background: oklch(0.145 0.004 60);
  --foreground: oklch(0.985 0 0);
  /* ... dark overrides */
}
```

### Typography

Two Google Fonts loaded via `next/font`:
- **Heading font** (serif/elegant) - For page titles, brand identity
- **Body font** (clean sans-serif like Inter) - For body text, UI elements

### Shadcn/ui Setup

```json
// components.json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide"
}
```

Components installed: Button, Input, Label, Textarea, Dialog, Card, Badge, Table, Tabs, Select, Dropdown Menu, Sheet (for mobile sidebar), Sonner (toasts), and more.

### Custom Utility Classes

```css
.section-container    /* max-width: 1280px with auto margins and padding */
.section-padding      /* Vertical padding using CSS variable */
.shadow-luxury        /* Premium shadow effect */
.hover-lift           /* translateY(-4px) on hover */
.text-gradient-primary /* Gradient text using primary colors */
.scrollbar-hide        /* Hide scrollbar cross-browser */
```

---

## 6. Authentication System

### NextAuth v5 with JWT Strategy

Single auth system for both admin and users. Roles differentiate access.

**User roles (enum in Prisma):**
- `CUSTOMER` - Regular website users (can place orders)
- `ADMIN` - CMS access (can manage products, orders, content)
- `SUPER_ADMIN` - Full access (can manage admin users + everything else)

### Auth Configuration (`src/lib/auth.ts`)

```tsx
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        // 1. Try database user (bcrypt password verification)
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (user && await bcrypt.compare(credentials.password, user.password)) {
          return { id: user.id, name: user.name, email: user.email, role: user.role };
        }

        // 2. Fallback to env-based admin (for initial setup)
        if (credentials.email === process.env.ADMIN_EMAIL &&
            credentials.password === process.env.ADMIN_PASSWORD) {
          return { id: "admin-env", name: "Admin", email: credentials.email, role: "ADMIN" };
        }

        return null;
      },
    }),
    // Google OAuth can be added here
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 }, // 1 hour
  pages: { signIn: "/admin/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) { token.role = user.role; token.id = user.id; }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token.id;
      return session;
    },
  },
});
```

### Edge-Safe Config Split (`src/lib/auth.config.ts`)

```tsx
// No bcrypt, no DB queries — safe for Edge middleware
export default {
  pages: { signIn: "/admin/login" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      if (isOnAdmin && !auth?.user) return false;
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
```

### Middleware (`src/middleware.ts`)

```tsx
const { auth } = NextAuth(authConfig);

export default auth(function middleware(request) {
  const session = request.auth;
  const pathname = request.nextUrl.pathname;

  // Protect all admin pages (except login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Protect user-only pages (orders, checkout, etc.)
  if (["/orders", "/checkout"].some(p => pathname.startsWith(p))) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
});
```

### Three Protection Layers

```
Layer 1: MIDDLEWARE (Edge) — redirects unauthenticated users
Layer 2: SERVER LAYOUT — double-checks session, verifies role
Layer 3: API ROUTE / SERVER ACTION GUARD — requireAdmin() in every mutation
```

---

## 7. Database Layer (PostgreSQL + Prisma)

### Why PostgreSQL + Prisma (Not MongoDB)?

- **Relational data**: Products have images, orders have items, users have addresses — relational DB is ideal
- **Prisma**: Type-safe queries generated from schema, migrations, visual studio
- **Native `pg` adapter**: Direct PostgreSQL connection (better pooling than Prisma's default engine)

### Prisma Client Singleton (`src/lib/db.ts`)

```tsx
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### Database Schema (`prisma/schema.prisma`)

#### User & Authentication Models

```prisma
enum UserRole {
  CUSTOMER
  ADMIN
  SUPER_ADMIN
}

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String    // bcrypt hashed
  phone         String?
  role          UserRole  @default(CUSTOMER)
  emailVerified DateTime?
  image         String?
  addresses     Address[]
  orders        Order[]
  cartItems     CartItem[]
  accounts      Account[]  // OAuth
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  // OAuth provider accounts (Google, etc.)
}

model VerificationToken {
  // Email verification tokens
}
```

#### E-Commerce Models

```prisma
model Product {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  description     String   @db.Text
  benefits        String?  @db.Text
  certifications  String?
  sku             String?  @unique
  price           Decimal  @db.Decimal(10,2)
  salePrice       Decimal? @db.Decimal(10,2)
  stock           Int      @default(0)
  weight          String?
  metaTitle       String?
  metaDescription String?
  isActive        Boolean  @default(true)
  isFeatured      Boolean  @default(false)
  categoryId      String?
  category        Category? @relation(fields: [categoryId], references: [id])
  images          ProductImage[]
  orderItems      OrderItem[]
  cartItems       CartItem[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model ProductImage {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  alt       String?
  sortOrder Int     @default(0)
}

model Category {
  id       String    @id @default(cuid())
  name     String    @unique
  slug     String    @unique
  image    String?
  isActive Boolean   @default(true)
  products Product[]
}

model CartItem {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int     @default(1)
  @@unique([userId, productId])  // One cart item per product per user
}
```

#### Order Models

```prisma
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

model Order {
  id                String        @id @default(cuid())
  orderNumber       String        @unique    // e.g., "JW-20260414-001"
  userId            String
  user              User          @relation(fields: [userId], references: [id])
  items             OrderItem[]
  subtotal          Decimal       @db.Decimal(10,2)
  shippingCost      Decimal       @db.Decimal(10,2) @default(0)
  discount          Decimal       @db.Decimal(10,2) @default(0)
  total             Decimal       @db.Decimal(10,2)
  status            OrderStatus   @default(PENDING)
  paymentStatus     PaymentStatus @default(PENDING)
  paymentMethod     String?       // "COD", "ONLINE"
  shippingAddress   Json          // Stored as JSON snapshot
  estimatedDelivery DateTime?
  notes             String?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}

model OrderItem {
  id          String         @id @default(cuid())
  orderId     String
  order       Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId   String
  product     Product        @relation(fields: [productId], references: [id])
  name        String         // Snapshot at time of order
  price       Decimal        @db.Decimal(10,2)
  quantity    Int
}

```

#### CMS & Content Models

```prisma
model BlogPost {
  id              String   @id @default(cuid())
  title           String
  slug            String   @unique
  excerpt         String?  @db.Text
  content         String   @db.Text     // Rich HTML from TipTap
  coverImage      String?
  author          String   @default("Jivo Wellness")
  tags            String[] // PostgreSQL native string array
  isPublished     Boolean  @default(false)
  metaTitle       String?
  metaDescription String?
  publishedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model PageContent {
  id        String   @id @default(cuid())
  page      String   // "home", "about", etc.
  section   String   // "hero", "features", "cta"
  title     String?
  content   Json     // Flexible JSON for any section structure
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@unique([page, section])
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
  key   String @unique    // e.g., "footer_phone", "brand_name", "free_shipping_threshold"
  value String @db.Text
}

model SeoMeta {
  id              String  @id @default(cuid())
  page            String  @unique  // e.g., "/", "/products", "/about"
  title           String
  description     String? @db.Text
  ogImage         String?
  structuredData  Json?   // JSON-LD structured data
}

model Address {
  id       String  @id @default(cuid())
  userId   String
  user     User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  label    String? // "Home", "Office"
  line1    String
  line2    String?
  city     String
  state    String
  pincode  String
  phone    String?
  isDefault Boolean @default(false)
}

model ContactInquiry {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String?
  subject   String?
  message   String   @db.Text
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}

model JobApplication {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String
  position  String
  resume    String?  // UploadThing URL
  message   String?  @db.Text
  createdAt DateTime @default(now())
}

model NewsletterSubscriber {
  id        String   @id @default(cuid())
  email     String   @unique
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}
```

### Database Commands

```bash
npm run db:generate    # Generate Prisma client types from schema
npm run db:push        # Push schema changes to database (dev)
npm run db:seed        # Seed database with initial data
npm run db:studio      # Open Prisma Studio (visual DB browser at localhost:5555)
```

---

## 8. API Architecture & Server Actions

### Dual Pattern: API Routes + Server Actions

This project uses **both** patterns for different purposes:

| Pattern | Use Case | Example |
|---------|----------|---------|
| **API Routes** (`/api/...`) | Public data fetching, webhooks, external integrations | `GET /api/products`, `POST /api/payment/verify` |
| **Server Actions** (`modules/x/actions.ts`) | Admin mutations (CRUD), form submissions | `createProduct()`, `updateOrder()`, `deleteBlob()` |

### Server Actions Pattern (Preferred for Mutations)

```tsx
// src/modules/products/actions.ts
"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { productSchema } from "./validations";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  // 1. Auth check
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  // 2. Validate input with Zod
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    // ...
  });

  if (!parsed.success) {
    return { error: "Validation failed", issues: parsed.error.issues };
  }

  // 3. Create in database
  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      slug: generateSlug(parsed.data.name),
    },
  });

  // 4. Revalidate cached pages
  revalidatePath("/products");
  revalidatePath("/admin/dashboard/products");

  return { success: true, data: product };
}
```

### API Routes Pattern (For Public Data + Webhooks)

```tsx
// src/app/api/products/route.ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const page = parseInt(searchParams.get("page") || "1");

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category && { category: { slug: category } }),
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
    },
    skip: (page - 1) * 12,
    take: 12,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: products });
}
```

### Admin Auth Guard (`src/lib/requireAdmin.ts`)

```tsx
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}
```

---

## 9. Image Upload System (UploadThing + Sharp)

### UploadThing Configuration (`src/lib/uploadthing.ts`)

```tsx
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  productImage: f({ image: { maxFileSize: "4MB", maxFileCount: 5 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),

  blogCover: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      if (!session) throw new Error("Unauthorized");
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;
```

### Sharp for Image Processing

Before uploading or when serving, Sharp processes images server-side:

```tsx
import sharp from "sharp";

export async function processImage(buffer: Buffer) {
  return sharp(buffer)
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}
```

### Image Sources in `next.config.ts`

```typescript
images: {
  formats: ["image/avif", "image/webp"],
  remotePatterns: [
    { protocol: "https", hostname: "utfs.io" },              // UploadThing CDN
    { protocol: "https", hostname: "uploadthing.com" },       // UploadThing
    { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google OAuth
  ],
}
```

---

## 10. Admin Dashboard - Complete CMS

### Dashboard Home (`/admin/dashboard`)

Stats cards showing: Total revenue, Orders today, Active products, Total customers. Quick links to every section.

### Products Manager (`/admin/dashboard/products`)

- **List view**: DataTable with search, category filter, active/featured toggle
- **Create** (`/admin/dashboard/products/new`): Multi-step form
  - Basic Info: name, slug (auto-generated), description, category, SKU
  - Pricing: price, sale price, stock, weight
  - Images: Upload multiple images with drag-to-reorder (UploadThing)
  - Content: Benefits, certifications (TipTap rich text)
  - SEO: Meta title, meta description
- **Edit** (`/admin/dashboard/products/[id]`): Same form pre-populated
- **Toggle active/featured** from list view

### Orders Manager (`/admin/dashboard/orders`)

- Table with: Order #, Customer, Items, Amount, Payment status, Order status, Date
- Filters: status, payment status, date range
- Order detail page (`/admin/dashboard/orders/[id]`):
  - Customer info, shipping address
  - Items with quantities and prices
  - Status update buttons (PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED)
- Excel export

### Blogs Manager (`/admin/dashboard/blogs`)

- List with published/draft status
- **TipTap rich text editor** for content (bold, italic, headings, lists, images, links)
- Cover image upload
- Tags (PostgreSQL native array)
- SEO fields (meta title, meta description)
- Publish/unpublish toggle

### Contact Leads (`/admin/dashboard/contact`)

View contact form submissions with read/unread status.

### Job Applications (`/admin/dashboard/careers`)

View career applications with resume downloads.

### Newsletter Subscribers (`/admin/dashboard/newsletter`)

View/export email subscribers.

### Navbar Manager (`/admin/dashboard/navbar`)

- Add/remove/reorder navigation links
- Toggle visibility
- Drag-to-reorder with `sortOrder` field

### SEO Manager (`/admin/dashboard/seo`)

- Per-page SEO metadata (title, description, OG image)
- JSON-LD structured data editor
- Pages: `/`, `/products`, `/about`, `/blog`, `/contact`, etc.

### Site Settings (`/admin/dashboard/settings`)

Key-value store for global config:
- `brand_name`, `brand_tagline`
- `footer_phone`, `footer_email`, `footer_address`
- `footer_facebook`, `footer_instagram`, `footer_twitter`
- `free_shipping_threshold`
- `cod_enabled`

### Media Library (`/admin/dashboard/uploads`)

Browse, delete uploaded images from UploadThing.

---

## 11. Public Pages - SSR + Client Hydration Pattern

Every public page follows this two-step pattern:

### Step 1: Server Component (page.tsx) - Fetches data

```tsx
// src/app/(public)/products/page.tsx
export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { images: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.category.findMany({ where: { isActive: true } });

  return (
    <main className="container mx-auto px-4 py-16">
      <ScrollReveal>
        <h1>Our Products</h1>
      </ScrollReveal>
      <ProductsPageClient
        initialProducts={JSON.parse(JSON.stringify(products))}
        categories={JSON.parse(JSON.stringify(categories))}
      />
    </main>
  );
}
```

### Step 2: Client Component - Handles interactivity

```tsx
"use client";
export default function ProductsPageClient({ initialProducts, categories }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  // ... filtering, sorting, add-to-cart, etc.
}
```

### Why `JSON.parse(JSON.stringify(...))`?

Prisma returns objects with `Decimal`, `Date`, and other non-serializable types. The round-trip through JSON converts everything to plain JSON-safe types that can be passed as React props.

---

## 12. State Management (Redux Toolkit + React Query)

### Redux Toolkit (Client UI State Only)

```tsx
// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./slices/uiSlice";
import cartUiReducer from "./slices/cartUiSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    cartUi: cartUiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

```tsx
// src/store/slices/uiSlice.ts
const uiSlice = createSlice({
  name: "ui",
  initialState: {
    mobileNavOpen: false,
    activeModal: null as string | null,
  },
  reducers: {
    toggleMobileNav: (state) => { state.mobileNavOpen = !state.mobileNavOpen; },
    setActiveModal: (state, action) => { state.activeModal = action.payload; },
    closeModal: (state) => { state.activeModal = null; },
  },
});
```

```tsx
// src/store/slices/cartUiSlice.ts
const cartUiSlice = createSlice({
  name: "cartUi",
  initialState: { sidebarOpen: false },
  reducers: {
    openCartSidebar: (state) => { state.sidebarOpen = true; },
    closeCartSidebar: (state) => { state.sidebarOpen = false; },
    toggleCartSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
  },
});
```

### React Query (Server Data State)

```tsx
// src/components/providers/QueryProvider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,         // Data fresh for 30 seconds
      refetchOnWindowFocus: false,    // Don't refetch on tab switch
    },
  },
});
```

Usage in components:

```tsx
// Fetching products with caching + background refetch
const { data: products, isLoading } = useQuery({
  queryKey: ["products", category],
  queryFn: () => fetch(`/api/products?category=${category}`).then(r => r.json()),
});

// Mutations with automatic cache invalidation
const { mutate: deleteProduct } = useMutation({
  mutationFn: (id: string) => fetch(`/api/admin/products/${id}`, { method: "DELETE" }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    toast.success("Product deleted");
  },
});
```

### When to Use Which?

| Redux Toolkit | React Query |
|---|---|
| Cart sidebar open/close | Product list data |
| Mobile nav toggle | Order data |
| Active modal state | Blog posts |
| Theme preference | Any data from database |

---

## 13. Animation System

### Framer Motion Components (`src/components/motion/`)

**ScrollReveal** - Scroll-triggered fade-up animation:
```tsx
<ScrollReveal delay={0.2} y={24}>
  <h2>This fades up when scrolled into view</h2>
</ScrollReveal>
```

**StaggerContainer** - Stagger children entrance:
```tsx
<StaggerContainer>
  {products.map(p => <ProductCard key={p.id} product={p} />)}
</StaggerContainer>
```

**ParallaxImage** - Parallax scrolling effect on hero images

### Swiper Carousels

Used for product image galleries, testimonial sliders, featured product carousels.

### Page Transitions

Framer Motion `AnimatePresence` wraps page content for smooth transitions.

---

## 14. E-commerce & Cart System

### Cart System

**Server-persisted cart** (for logged-in users) using `CartItem` model in PostgreSQL. Cart data syncs across devices.

For guest users: localStorage fallback with merge on login.

### Order Flow

```
1. User adds items to cart
2. Cart sidebar opens (Redux: cartUi.sidebarOpen = true)
3. User clicks "Checkout"
4. /checkout page:
   a. Select/add shipping address
   b. Choose payment method (COD / Online)
5. Order created in database with status: PENDING
6. Redirect to /order-success/[orderId]
7. Admin sees order in dashboard, updates status as it progresses
```

### Order Status Flow

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
                                            ↘ CANCELLED
                                            ↘ REFUNDED
```

---

## 15. SEO System

### Per-Page Metadata (from Database)

```tsx
// In any page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const seo = await prisma.seoMeta.findUnique({ where: { page: "/products" } });
  return {
    title: seo?.title || "Products | Jivo Wellness",
    description: seo?.description || "Premium cold press oils and wellness products",
    openGraph: { images: seo?.ogImage ? [{ url: seo.ogImage }] : [] },
  };
}
```

### Admin-Managed SEO

The SEO Manager in the admin dashboard lets non-developers edit:
- Page title
- Meta description
- OG image
- JSON-LD structured data (for rich search results)

### Structured Data (JSON-LD)

Root layout includes Organization, WebSite, and SiteNavigationElement schemas. Product pages include Product schema with pricing and availability.

---

## 17. Security Architecture

### HTTP Security Headers (`next.config.ts`)

```typescript
headers: [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
]
```

### Input Validation

- **Zod schemas** validate ALL server action inputs (never trust client data)
- **DOMPurify** sanitizes HTML content from TipTap editor (prevents XSS)

```tsx
// src/lib/sanitize.ts
import DOMPurify from "dompurify";

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "h1", "h2", "h3", "ul", "ol", "li", "a", "img"],
    ALLOWED_ATTR: ["href", "src", "alt", "class"],
  });
}
```

---

## 17. Rate Limiting (Upstash Redis)

### Configuration (`src/lib/redis.ts`)

```tsx
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

### Rate Limit Middleware (`src/lib/rate-limit.ts`)

```tsx
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

export const rateLimiters = {
  auth:    new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1m") }),
  contact: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, "1m") }),
  general: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, "1m") }),
  admin:   new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(120, "1m") }),
};
```

| Endpoint | Requests | Window |
|----------|----------|--------|
| Auth (login/register) | 5 | 1 minute |
| Contact form | 3 | 1 minute |
| General API | 60 | 1 minute |
| Admin API | 120 | 1 minute |

---

## 18. Error Monitoring (Sentry)

`@sentry/nextjs` captures runtime errors and performance data:

```tsx
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,  // 10% of transactions
  replaysSessionSampleRate: 0.1,
});
```

Automatically captures: unhandled exceptions, API route errors, React component errors, performance traces.

---

## 19. Rich Text Editor (TipTap)

### Admin Blog/Content Editor

```tsx
// src/components/admin/RichTextEditor.tsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

export default function RichTextEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return (
    <div className="border rounded-lg">
      {/* Toolbar: Bold, Italic, Headings, Lists, Image */}
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="prose p-4" />
    </div>
  );
}
```

Features: Bold, italic, headings (H1-H3), bullet lists, ordered lists, links, image embedding.

---

## 20. Forms & Validation

### React Hook Form + Zod

```tsx
// Module validation schema
const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().min(10, "Description too short"),
  categoryId: z.string().optional(),
  price: z.number().positive("Price is required"),
  salePrice: z.number().positive().optional(),
  stock: z.number().int().min(0),
  sku: z.string().optional(),
  weight: z.string().optional(),
});

// In component
const form = useForm({
  resolver: zodResolver(productSchema),
  defaultValues: { name: "", description: "", price: 0, stock: 0 },
});
```

---

## 21. Site Constants & Configuration

```tsx
// src/lib/constants.ts
export const SITE_NAME = "Jivo Wellness";
export const SITE_URL = "https://jivo.in";
export const FREE_SHIPPING_THRESHOLD = 499; // INR

export const ITEMS_PER_PAGE = {
  products: 12,
  blog: 9,
  admin: 20,
  orders: 10,
};

export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB
```

---

## 22. Development Environment (ESLint, Prettier, Bundle Analysis)

### ESLint (Flat Config)

```javascript
// eslint.config.mjs
import next from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

export default [...next, ...typescript];
```

### Prettier

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

The `prettier-plugin-tailwindcss` auto-sorts Tailwind classes in a consistent order.

### Bundle Analysis

```bash
npm run analyze   # ANALYZE=true next build → interactive treemap
```

---

## 23. Deployment

### Production Build

```bash
npm run build    # Generates optimized production build
npm run start    # Starts production server
```

### Production Checklist

1. Set all environment variables on the server
2. Run `npm run db:push` to sync schema
3. Run `npm run db:seed` for initial data (first time only)
4. Run `npm run build && npm run start`
5. Use PM2 or Docker for process management

---

## 24. Environment Variables

```env
NODE_ENV="development"

# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/jivo_db"

# Auth
AUTH_SECRET="your-secret-key-min-32-characters-long"
AUTH_URL="http://localhost:3000"

# Admin Credentials (fallback for initial setup)
ADMIN_EMAIL="admin@jivo.in"
ADMIN_PASSWORD="admin123"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# File Upload (UploadThing)
UPLOADTHING_TOKEN="your-uploadthing-token"

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Error Monitoring (Sentry) - Optional
NEXT_PUBLIC_SENTRY_DSN="https://xxx@sentry.io/xxx"
```

> `NEXT_PUBLIC_` variables are exposed to the browser. All others are server-only.

---

## 25. How to Recreate This Architecture (Step-by-Step)

### Phase 1: Project Setup (Day 1)

```bash
npx create-next-app@latest jivo-wellness --typescript --tailwind --app --src-dir
cd jivo-wellness
```

**Install all dependencies:**

```bash
# Core
npm install @prisma/client pg @prisma/adapter-pg next-auth@beta bcryptjs

# State Management
npm install @reduxjs/toolkit react-redux @tanstack/react-query

# File Upload
npm install uploadthing @uploadthing/react sharp

# Rate Limiting
npm install @upstash/redis @upstash/ratelimit

# Error Monitoring
npm install @sentry/nextjs

# Rich Text Editor
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod dompurify

# UI & Animation
npm install motion next-themes sonner lucide-react swiper
npm install class-variance-authority clsx tailwind-merge

# Dev Dependencies
npm install -D prisma @types/bcryptjs @types/dompurify @types/pg
npm install -D prettier prettier-plugin-tailwindcss
npm install -D @next/bundle-analyzer tw-animate-css
```

**Initialize Shadcn/ui:**
```bash
npx shadcn@latest init
# Choose: New York style, Neutral base color, CSS variables
npx shadcn@latest add button input label textarea dialog card badge table tabs select dropdown-menu sheet sonner
```

**Initialize Prisma:**
```bash
npx prisma init --datasource-provider postgresql
```

### Phase 2: Core Architecture (Day 1-2)

1. **Set up folder structure** with route groups: `(public)/`, `(admin)/`
2. **Write Prisma schema** (`prisma/schema.prisma`) with all models
3. **Run `npm run db:push`** to create database tables
4. **Create root layout** with all 4 providers (Auth, Theme, Redux, QueryClient)
5. **Create public layout** that fetches nav/footer
6. **Create admin layout** with session check
7. **Create dashboard layout** with sidebar navigation

### Phase 3: Authentication (Day 2)

1. **Set up NextAuth** (`src/lib/auth.ts`) with CredentialsProvider
2. **Split auth config** for Edge middleware
3. **Create middleware** for route protection
4. **Create admin login page** at `/admin/login`
5. **Create user login/signup pages**

### Phase 4: Feature Modules (Day 3-5)

For each feature, create the module:

```bash
# For each: products, orders, blog, home, navbar, seo, site-settings
mkdir -p src/modules/{feature}/{components}
# Create: actions.ts, validations.ts, types.ts
```

1. **Products module**: CRUD + categories + images
2. **Orders module**: Create order, update status
3. **Blog module**: CRUD with TipTap editor
4. **Home module**: CMS sections (hero, features, testimonials)
5. **Navbar module**: Link management
6. **SEO module**: Per-page metadata
7. **Site Settings module**: Key-value store

### Phase 5: Admin Dashboard (Day 5-7)

Create admin pages for each module with:
- DataTable component for list views
- Form pages for create/edit
- Server actions for mutations
- React Query for data fetching

### Phase 6: Public Pages (Day 7-9)

For each page:
1. Server component fetches from Prisma
2. Client component for interactivity
3. Metadata export for SEO
4. Animation wrappers

### Phase 7: Polish (Day 9-11)

1. Rate limiting on all endpoints
2. Sentry error monitoring
3. Image optimization (Sharp)
4. Bundle analysis and optimization
5. Security headers
6. Loading states and error boundaries
7. Responsive design testing
8. Dark mode testing

---

## NPM Scripts Reference

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `next dev --turbopack` | Development server with Turbopack |
| `build` | `next build` | Production build |
| `start` | `next start` | Production server |
| `lint` | `eslint` | Run ESLint checks |
| `format` | `prettier --write .` | Auto-format all files |
| `analyze` | `ANALYZE=true next build` | Bundle size analysis |
| `db:generate` | `prisma generate` | Generate Prisma client |
| `db:push` | `prisma db push` | Sync schema to database |
| `db:seed` | `npx tsx prisma/seed.ts` | Seed database |
| `db:studio` | `prisma studio` | Visual database browser |

---

## Key Architecture Decisions & Why

| Decision | Why |
|----------|-----|
| **PostgreSQL + Prisma (not MongoDB)** | Products have images, orders have items, users have addresses — relational data needs a relational DB. Prisma gives type-safe queries. |
| **Native `pg` adapter** | Better connection pooling control and performance than Prisma's default query engine. |
| **JWT sessions (not DB sessions)** | Stateless auth, no DB read on every request. Ideal for scaling. |
| **Redux + React Query split** | Redux for ephemeral UI state (sidebar, modals). React Query for server data with caching/revalidation. Clear separation. |
| **Server Actions for mutations** | Type-safe, colocated with Zod schemas, automatic form handling. Better DX than API routes for CRUD. |
| **Feature Modules architecture** | Self-contained features. Add "gift cards" = new folder, not scattered changes. |
| **UploadThing + Sharp** | Managed uploads (no S3 config) + server-side image processing (resize/WebP before storage). |
| **Upstash Redis for rate limiting** | Serverless-compatible, no persistent connections, works everywhere. |
| **TipTap for rich text** | Extensible, headless (you control the UI), supports image embedding. Better than textarea for blog content. |
| **Tailwind v4 with oklch** | Modern perceptual color space = more consistent theming across light/dark modes. |

---

## Summary

This is a **production-grade, fully dynamic e-commerce + CMS platform** where:

- **Every piece of content** (text, images, products, prices, SEO) is managed from the admin dashboard
- **No developer needed** for content updates — the admin does everything from the browser
- **Server-rendered** for SEO and performance
- **Client-hydrated** for interactivity (React Query for live updates, Redux for UI state)
- **Type-safe end-to-end** with TypeScript + Prisma + Zod
- **Secure** with three-layer auth protection, rate limiting, XSS prevention, HSTS
- **Responsive** with mobile-first design and dark mode
- **Animated** with Framer Motion scroll reveals and Swiper carousels
- **Monitored** with Sentry error tracking
- **Optimized** with Sharp image processing, Turbopack dev server, and bundle analysis
