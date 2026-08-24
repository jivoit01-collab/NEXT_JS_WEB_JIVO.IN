# SEO.md

## Purpose

This file defines the mandatory SEO, Lighthouse, Core Web Vitals, rendering, indexing, and performance optimization standards for all public pages.

Use this file whenever:

- Optimizing an existing page
- Improving Lighthouse scores
- Improving Core Web Vitals
- Improving SEO
- Improving bundle size
- Improving rendering strategy

Do NOT use this file for creating page architecture, CRUD systems, admin pages, Prisma models, or API routes.

Those rules belong to PROMPT.md.

---

## Optimization Workflow

Whenever asked to optimize a page:

Example:

```txt
Read SEO.md and optimize /the-story page
```

Perform the following audit before making changes.

---

## Lighthouse Targets

Public pages should target:

- Performance >= 90
- SEO >= 95
- Accessibility >= 90
- Best Practices >= 95

These are goals, not guaranteed measurements.

Do not claim actual Lighthouse scores unless Lighthouse was executed.

---

## Core Web Vitals Targets

## Largest Contentful Paint (LCP)

Target:

```txt
< 2.5s
```

Optimization Rules:

- Hero content loads immediately
- Hero image uses priority
- Avoid heavy JS above the fold
- Avoid hero animations that block rendering

---

## Cumulative Layout Shift (CLS)

Target:

```txt
< 0.1
```

Rules:

- Every image must have dimensions
- Use next/image
- Reserve layout space
- Avoid layout jumps

---

## Interaction to Next Paint (INP)

Target:

```txt
< 200ms
```

Rules:

- Reduce client-side JS
- Avoid unnecessary re-renders
- Lazy load heavy components

---

## Rendering Strategy

Preferred order:

1. SSG
2. ISR
3. SSR
4. CSR

Use:

## SSG

For:

- Home
- About
- Story pages
- Brand pages
- Static marketing pages

Example:

```tsx
export const revalidate = 3600;
```

---

## ISR

For:

- Product pages
- Blog pages
- Frequently updated content

Example:

```tsx
export const revalidate = 300;
```

---

## SSR

Only when:

- Request-specific data is required
- Authentication affects content

---

## CSR

Only when necessary.

Avoid full-page:

```tsx
"use client";
```

on public pages.

---

## Component Optimization

Hero section:

- Direct import
- No lazy loading

SEO content sections:

Use:

```tsx
dynamic(...);
```

Keep SSR enabled.

Example:

```tsx
const StorySection = dynamic(() => import("./story-section"));
```

---

## Client-Only Widgets

Use:

```tsx
dynamic(() => import("./carousel"), { ssr: false });
```

Examples:

- Sliders
- Testimonials carousel
- Maps
- Videos
- Interactive widgets

---

## Lazy Loading Rules

Do NOT lazy load:

- Hero
- Main heading
- First viewport content

Lazy load:

- Testimonials
- Gallery
- Related content
- Sliders
- Media sections
- Footer widgets

---

## Image Optimization

Mandatory:

```tsx
import Image from "next/image";
```

Rules:

- Use next/image
- Hero image uses priority
- Use responsive sizes
- Use WebP when possible
- Avoid oversized images

Example:

```tsx
<Image src={image} alt={alt} priority sizes="100vw" />
```

---

## Font Optimization

Use:

```tsx
next/font/google
```

Do NOT use:

```html
<link href="google-font-url" />
```

---

## SEO Rules

Every public page must have:

- generateMetadata()
- resolveSeo()
- canonical URL
- OpenGraph
- structuredData
- robots
- sitemap inclusion

---

## Heading Structure

Rules:

- One H1 per page
- H2 for sections
- H3 for subsections

Avoid multiple H1 tags.

---

## Structured Data

Use:

## Home

- WebSite
- Organization

## About

- AboutPage

## Story

- AboutPage

## Product

- Product

## Blog

- Article

---

## Sitemap Verification

Verify:

- Page exists in sitemap
- Dynamic routes included
- Private routes excluded

---

## Robots Verification

Public pages:

```txt
index,follow
```

Private pages:

```txt
noindex,nofollow
```

Exclude:

- /admin/**
- /api/**
- /login
- /signup
- /cart
- /checkout
- /orders

---

## Bundle Optimization

Check:

- unnecessary imports
- large dependencies
- duplicate libraries
- unused client components

Prefer:

- Server Components
- Dynamic imports
- Route-level code splitting

---

## Animation Optimization

Avoid:

- Hero animations
- Heavy scroll animations above fold

Use:

```tsx
whileInView
```

for below-the-fold content.

Always respect:

```tsx
prefers-reduced-motion
```

---

## Audit Report Requirement

After optimization, provide:

```txt
Performance Audit:
PASS / FAIL

SEO Audit:
PASS / FAIL

Accessibility Audit:
PASS / FAIL

Best Practices Audit:
PASS / FAIL

Rendering Strategy:
SSG / ISR / SSR / CSR

Shared Barrel Audit:
PASS / FAIL

UI Barrel Audit:
PASS / FAIL

SafeImage Audit:
PASS / FAIL

Hero Audit:
PASS / FAIL

Framer Motion Audit:
PASS / FAIL

LazyOnView Audit:
PASS / FAIL

Route Verification:
PASS / FAIL

Build Verification:
PASS / FAIL
```

Optimization Summary:

- item 1
- item 2
- item 3

Estimated Lighthouse Impact:

```txt
Performance: XX -> YY
SEO: XX -> YY
```

Do not claim measured scores unless Lighthouse was executed.

---

## Build Verification

Before completion:

Run:

```bash
npm run build
```

Verify:

- No TypeScript errors
- No ESLint errors
- No build failures

Do not mark optimization complete if the build fails.

---

## Public vs Admin Rules

SEO.md applies to public, indexable pages only.

Public pages:

- Must prioritize Lighthouse performance
- Must prioritize SEO
- Must minimize client-side JavaScript
- Must prefer Server Components
- Must keep crawlable content server-rendered whenever possible
- Must be independently audited per route

Admin pages:

- Performance optimization is optional
- SEO is not required
- Client Components may be used freely
- Authenticated workflows may prioritize usability over Lighthouse scores
- Admin-only routes must not be optimized using public SEO rules from this file

Never optimize admin pages using SEO.md rules unless the user explicitly asks for an admin performance pass.

---

## Shared Barrel Rules

Avoid importing from large shared barrels on public pages.

Bad:

```tsx
import { SafeImage } from "@/components/shared";
```

Good:

```tsx
import { SafeImage } from "@/components/shared/safe-image";
```

Approved public barrels may be used only when they intentionally export public-safe, lightweight components.

Rules:

- Avoid public bundle leakage
- Keep admin components separated
- Keep runtime components separated
- Public pages must not import admin components
- Public pages must not indirectly reference admin upload tools, runtime widgets, or dashboard-only components
- Prefer direct leaf imports when bundle impact is unclear

Before completing a public page optimization, audit:

- Shared barrel leakage
- Admin component leakage
- Runtime component leakage
- Public client-reference manifests where applicable

Report:

```txt
Shared Barrel Audit:
PASS / FAIL
```

---

## UI Barrel Rules

Avoid importing from the full UI barrel.

Bad:

```tsx
import { Button } from "@/components/ui";
```

Good:

```tsx
import { Button } from "@/components/ui/button";
```

Rules:

- Import leaf UI modules directly
- Avoid large Radix bundle exposure
- Prevent accidental client-reference growth
- Do not expose admin-only UI surfaces to public routes
- Keep public route imports as narrow as possible

Verify:

- No unnecessary UI imports
- No public UI leakage
- No accidental imports from removed or deprecated barrels

Report:

```txt
UI Barrel Audit:
PASS / FAIL
```

---

## SafeImage Rules

Preferred architecture:

```txt
Server SafeImage
Client fallback only when required
```

Rules:

- Avoid image hydration
- Avoid `useEffect` for normal image rendering
- Avoid `useState` for normal image rendering
- Keep image rendering server-side by default
- Use client-side image fallback logic only when browser error detection or retry behavior is required
- Preserve `alt`, `priority`, `sizes`, `fill`, width, height, quality, and responsive behavior
- Public image components must be audited for hydration cost

Public image rendering should not create a hydration island merely to resolve a URL or render `next/image`.

Report:

```txt
SafeImage Audit:
PASS / FAIL
```

---

## Hero Optimization Rules

Hero sections are the highest-priority performance area because they usually control LCP.

Rules:

- Hero must render immediately
- Hero content must be visible without JavaScript
- Hero H1 must be server-rendered
- Hero image must use `priority`
- Hero image must use an accurate `sizes` value
- Hero should not block LCP
- Above-the-fold JavaScript must be minimized
- Do not lazy load the hero, H1, or first viewport content

Avoid:

- Heavy hero animations
- Framer Motion in the hero unless explicitly justified
- Carousel libraries initializing before LCP
- Unnecessary hero hydration
- Expensive effects above the fold
- Multiple priority images in a hero carousel

If a carousel exists:

- Render the first slide immediately on the server
- Use `priority` only for the first slide image
- Defer carousel runtime when possible
- Initialize autoplay after idle or interaction when visual behavior allows it
- Keep first-frame visual appearance unchanged

Report:

```txt
Hero Audit:
PASS / FAIL
```

---

## Framer Motion Rules

Audit all Framer Motion usage during public page optimization.

Preferred:

- Below-the-fold only
- `whileInView` for scroll reveal
- Shared animation variants
- Reduced-motion support
- One motion parent per section where possible

Avoid:

- Hero Framer Motion
- Heavy animation trees
- Unnecessary animated text splitting
- Motion wrappers around large static layouts
- Animation work that delays LCP

If Framer Motion is used above the fold, document why it is necessary and prove it does not hurt LCP.

For every page optimization, generate:

```txt
Framer Motion Audit:
PASS / FAIL
```

---

## LazyOnView Rules

Below-the-fold sections should be evaluated for:

- `LazyOnView`
- Dynamic import
- Hydration delay
- Client-only rendering
- Interaction-triggered loading

Do NOT lazy load:

- Hero
- H1
- Above-the-fold content
- SEO-critical content when it would disappear from server-rendered HTML

Good candidates:

- Testimonials
- Galleries
- Media sections
- Videos
- Carousels
- Maps
- Comments
- Interactive widgets
- Chat or floating runtime widgets

Use `next/dynamic` for code splitting. Use `LazyOnView` only when deferring render/hydration is safe for SEO and UX.

Report:

```txt
LazyOnView Audit:
PASS / FAIL
```

---

## Bundle Optimization Rules

Audit:

- Bundle size
- Client Components
- `useEffect` count
- `useLayoutEffect` count
- Dependency usage
- Dynamic imports
- Client-reference manifests
- Unused or duplicated libraries

Verify:

- No unnecessary Client Components
- No duplicate libraries
- No unused dependencies
- No heavy libraries imported above the fold
- No admin-only libraries leaking into public pages
- No large barrels expanding public bundles

Classify every bundle finding:

```txt
HIGH IMPACT
MEDIUM IMPACT
LOW IMPACT
```

Examples:

- HIGH IMPACT: carousel, animation, editor, chart, or media library loaded above the fold
- MEDIUM IMPACT: unnecessary client wrapper or large barrel import
- LOW IMPACT: small unused helper, redundant import, minor CSS duplication

---

## Page-Level Lighthouse Audit

Lighthouse is page-specific.

Every optimized page must be evaluated independently.

Example routes:

```txt
/
/products
/our-essence/the-story
```

These routes may all have different scores, bottlenecks, JS bundles, images, and hydration behavior.

Optimization reports must clearly specify:

```txt
Audited Page: <Route>
```

Do not assume homepage results apply to all pages.

Do not claim measured Lighthouse scores unless Lighthouse or PageSpeed Insights was executed for the specific audited route.

Allowed:

- Estimated Lighthouse scores
- Predicted performance impact
- Optimization summary

Not allowed:

- Claiming exact measured scores without a run
- Claiming exact Core Web Vital values without measurement
- Applying one route's measured score to another route

---

## Route Verification

After optimization, verify:

- Page renders correctly
- No error boundary
- No runtime errors
- No broken imports
- No hydration errors
- Public content still appears
- Responsive behavior is preserved

Optimization is not complete until route verification passes.

Minimum route verification:

```txt
Route Verification:
PASS / FAIL
```

If route verification cannot be fully automated, clearly state what was verified and what could not be verified.

---

## Optimization Priority Order

Always optimize in this order:

1. Broken functionality
2. SEO metadata
3. Rendering strategy
4. Images
5. Bundle size
6. Hydration
7. Hero optimization
8. Framer Motion
9. LazyOnView
10. Dependency cleanup

Never sacrifice functionality for Lighthouse score.

Never remove content, sections, accessibility semantics, or SEO metadata solely to improve performance.

---

## Completion Criteria

A page optimization task is NOT complete unless:

- Route works
- Build passes
- Lint passes
- SEO passes
- Accessibility passes
- No broken imports
- No runtime errors
- No hydration errors
- Public page content remains visible and crawlable
- Lighthouse score claims are labeled as measured only when Lighthouse or PageSpeed Insights was actually executed

Only then may the task be marked complete.
