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
