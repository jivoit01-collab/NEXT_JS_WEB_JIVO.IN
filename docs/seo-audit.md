# Production SEO, Performance, Architecture, and Maintainability Audit

Date: 2026-06-04

Scope: entire Next.js application. This document is an evidence-based audit report only. No source code was modified for this audit.

Measurement note: Lighthouse was not executed during this audit. Scores below are estimated from code structure, existing `.next` build artifacts, and the user-provided Lighthouse baseline from the previous performance request.

---

## 1. Executive Summary

| Area | Grade | Reason |
|---|---:|---|
| Overall Project | B- | Strong Next.js App Router architecture, SEO system, ISR, and image pipeline, but public client bundle/hydration is too large. |
| Architecture | B+ | Feature modules, per-page Prisma models, ISR, `resolveSeo`, sitemap, robots, and cached queries are good foundations. |
| Performance | C | Main score loss is JavaScript and hydration, not SEO or basic image delivery. |
| SEO | A | Public CMS pages use `generateMetadata`, `resolveSeo`, structured data, canonical metadata, sitemap, and robots controls. |
| Maintainability | B | Module pattern is good, but barrels, duplicated admin editors, client-heavy shared components, and unused dependencies need cleanup. |

Primary root cause: the public route client graph is broader than necessary. The public page client manifest includes admin upload widgets and Radix UI primitives, and the current build snapshot contains a very large public chunk.

Evidence:

- `.next/static/chunks/13wossx44704w.js` is `965182` bytes uncompressed.
- `.next/server/app/(public)/page_client-reference-manifest.js` is `61967` bytes.
- Manifest contains `image-upload.tsx`, `video-upload.tsx`, `whatsapp-widget.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `select.tsx`, `sheet.tsx`, `table.tsx`, `safe-image.tsx`, and `hero-carousel.tsx`.

---

## 2. Lighthouse Analysis

Estimated current scores:

| Category | Estimated Current | Evidence |
|---|---:|---|
| Performance | Mobile ~52, Desktop ~64 | User-provided baseline plus large public JS chunks and hydration-heavy public components. |
| Accessibility | ~96 | User-provided baseline and semantic page structure. |
| Best Practices | ~92 | User-provided baseline; security headers exist, but client bundle leakage and placeholder routes remain. |
| SEO | ~100 | Public CMS pages use `resolveSeo`, structured data, sitemap, and robots. |

High impact findings:

| File | Evidence | Impact | Recommendation |
|---|---|---|---|
| `src/components/shared/index.ts` | Exports public components plus admin/client-heavy `ImageUpload`, `VideoUpload`, `WhatsAppWidget`, `OfflineIndicator`, `BlockedToast`. | Public imports from `@/components/shared` can expose unnecessary client references. | Split into `shared/public.ts`, `shared/admin.ts`, or use direct imports in public code. |
| `src/components/ui/index.ts` | Exports Dialog, DropdownMenu, Table, Select, Tabs, Sheet, Pagination, Label, Separator. | Public error/not-found pages importing `@/components/ui` can pull Radix primitives into public graph. | Use direct imports such as `@/components/ui/button`; avoid UI barrel in public files. |
| `.next/server/app/(public)/page_client-reference-manifest.js` | Contains `dialog.tsx`, `dropdown-menu.tsx`, `select.tsx`, `sheet.tsx`, `table.tsx`, upload widgets, SafeImage, hero carousel. | Strong evidence of public client-reference leakage. | Refactor barrels and public imports, then rebuild/analyze. |
| `src/modules/home/components/hero-carousel.tsx` | Imports `framer-motion`, `embla-carousel-react`, `embla-carousel-autoplay`; uses `useEffect`, `useState`, and `useCallback`. | Above-the-fold carousel JS increases TBT and can compete with LCP. | Render first slide statically, lazy/idle hydrate carousel after LCP or interaction. |
| `src/components/shared/safe-image.tsx` | `'use client'`; uses `useMemo`, `useState`, `useEffect`, retry timer, and fallback state. | Every SafeImage hydrates; this is expensive across image-heavy pages. | Split into server SafeImage plus small client fallback island only when needed. |

Medium impact findings:

| File | Evidence | Impact | Recommendation |
|---|---|---|---|
| `src/components/layout/navbar.tsx` | `'use client'`; uses `usePathname`, `useScroll`, 3 state values, click listener, timers. | Hydrates above the fold on every public route. | Render static nav on server; isolate mobile menu/dropdown behavior into smaller client components. |
| `src/hooks/use-scroll.ts` | Effect dependency is `[threshold, scrolled]`; listener uses `requestAnimationFrame`. | Scroll listener is re-created when `scrolled` changes. | Use refs to avoid effect churn and keep one passive listener. |
| `src/components/shared/split-words.tsx` | Imports Framer Motion and renders word-level `motion.span` children. | Many heading nodes hydrate and animate. | Keep only for key below-fold headings or add a non-motion/server fallback. |
| `src/modules/home/components/home-main.tsx` | Dynamic imports below-fold sections, but does not wrap them in `LazyOnView`. | Code splitting exists, but client sections still mount/hydrate early. | Add `LazyOnView` only around non-SEO widgets; split SEO content into server + client motion islands. |

Low impact findings:

| File | Evidence | Impact | Recommendation |
|---|---|---|---|
| `src/components/shared/public-runtime.tsx` | Dynamically imports `sonner` only for `blocked=1`; offline indicator waits for idle. | Good pattern; small residual idle JS. | Keep as-is. |
| `src/app/(public)/our-products/page.tsx` | Placeholder page with `robots: { index: false, follow: false }`. | Correct for unfinished placeholder, but not production content. | Replace with real SEO route when page is launched. |

---

## 3. Rendering Strategy Audit

| Route | Current | Recommended | Reason |
|---|---|---|---|
| `/` | ISR, `revalidate = 300` in `src/app/(public)/page.tsx` | Keep ISR | CMS-driven public page with admin revalidation. |
| `/our-essence/the-story` | ISR, `revalidate = 300` | Keep ISR | Uses `resolveSeo` and cached query. |
| `/our-essence/core-values` | ISR, `revalidate = 300` | Keep ISR | Uses `resolveSeo` and cached query. |
| `/our-essence/baru-sahib-association` | ISR, `revalidate = 300` | Keep ISR | CMS-driven and includes video section below fold. |
| `/our-essence/social-initiatives` | ISR, `revalidate = 300` | Keep ISR | CMS-driven and uses `LazyOnView` for below-fold sections. |
| `/our-essence/our-fair-share` | ISR, `revalidate = 300` | Keep ISR | CMS-driven and uses `LazyOnView`. |
| `/our-essence/for-mother-earth` | ISR, `revalidate = 300` | Keep ISR | CMS-driven and uses `LazyOnView`. |
| `/our-products` | Static placeholder, `noindex` | Keep `noindex` until real page; then ISR + SEO | Placeholder route should not be indexed. |
| `/community` | Static placeholder, `noindex` | Keep `noindex` until real page; then ISR + SEO | Placeholder route should not be indexed. |
| `/media` | Static placeholder, `noindex` | Keep `noindex` until real page; then ISR + SEO | Placeholder route should not be indexed. |
| `/admin/**` | CSR/private client pages | Keep CSR | Authenticated admin dashboard is correctly not indexed. |
| `/api/**` | Route handlers | Keep server/API only | Correct non-page architecture. |
| `/sitemap.xml` | `src/app/sitemap.ts` | Keep dynamic metadata route | Uses `SITE_URL`, excludes private routes. |
| `/robots.txt` | `src/app/robots.ts` | Add remaining private route patterns | Currently blocks `/admin/`, `/api/`, `/account/`; should also block `/login`, `/signup`, `/cart`, `/checkout`, `/orders` if those routes are added. |

Good evidence:

- `src/app/(public)/page.tsx`: `export const revalidate = 300`.
- Public CMS pages call `return resolveSeo(...)`.
- `src/modules/seo/data/queries.ts`: `getSeoByPage = cache(...)`.
- `src/modules/home/data/queries.ts`: render queries use React `cache()` and Prisma `select`.

---

## 4. Hydration Audit

Search counts:

| Pattern | Count |
|---|---:|
| `use client` | 88 |
| `useEffect` | 93 |
| `useLayoutEffect` | 0 |
| `useMemo` | 33 |
| `useCallback` | 63 |
| `framer-motion` | 23 |
| `dynamic(` | 18 |
| `LazyOnView` | 23 |
| `memo(` | 1 |
| `gsap` | 0 |
| `lenis` | 0 |
| `swiper` usage in `src` | 0 |
| `embla` | 11 |

High and medium hydration findings:

| File | Reason | Impact |
|---|---|---|
| `src/components/layout/navbar.tsx` | Top-level public layout child is client; uses scroll, pathname, state, timers, and click listener. | High. Hydrates on every public page before user interaction. |
| `src/components/shared/safe-image.tsx` | Every image uses client state/effects for retry/fallback. | High aggregate hydration cost on image-heavy pages. |
| `src/modules/home/components/hero-carousel.tsx` | Above-fold client carousel with Embla, Autoplay, Framer Motion, state/effects. | High when multiple hero slides exist. |
| `src/components/shared/split-words.tsx` | Client Framer Motion word splitting. | Medium. Many motion nodes for headings. |
| `src/modules/home/components/products-foundation.tsx` | Canvas, ResizeObserver, IntersectionObserver, requestAnimationFrame. | Medium. Should only mount when visible. |
| `src/modules/our-essence/the-story/components/hero-section.tsx` | Hero imports Framer Motion and animates above fold. | Medium to high route-specific LCP/TBT risk. |
| `src/modules/our-essence/for-mother-earth/components/hero-section.tsx` | Client hero imports Framer Motion and `useReducedMotion`. | Medium to high route-specific LCP/TBT risk. |
| `src/modules/our-essence/our-fair-share/components/hero-section.tsx` | Client hero imports Framer Motion and `useReducedMotion`. | Medium to high route-specific LCP/TBT risk. |
| `src/modules/our-essence/social-initiatives/components/hero-section.tsx` | Client hero imports Framer Motion and `useReducedMotion`. | Medium to high route-specific LCP/TBT risk. |
| `src/app/error.tsx` | Client root error boundary imports `Button` from UI barrel. | Medium. Can leak UI barrel into public graph. |

Recommendation:

1. Keep public layouts server-first.
2. Split nav into server static markup plus tiny client components.
3. Split SafeImage into server and client fallback layers.
4. Remove Framer Motion from hero sections.
5. Use `LazyOnView` only for non-SEO widgets; for SEO content prefer server HTML plus tiny client animation islands.

---

## 5. Bundle Size Audit

Build artifact evidence:

| Artifact | Evidence | Impact |
|---|---|---|
| `.next/static/chunks/13wossx44704w.js` | 965182 bytes uncompressed | High. Large shared/public chunk hurts TBT and parse/compile. |
| `.next/static/chunks/14c.6c8bngjr4.js` | 271315 bytes uncompressed | Medium/high. |
| `.next/static/chunks/0cpi2mmm91c3b.js` | 227425 bytes uncompressed | Medium/high. |
| `.next/static/chunks/0ot01pj~n_3zk.css` | 192052 bytes uncompressed | Medium CSS payload. |
| `.next/server/app/(public)/page_client-reference-manifest.js` | 61967 bytes and contains admin/upload/Radix modules | High architecture signal. |

Large dependency risks:

| Dependency | Evidence | Classification | Recommendation |
|---|---|---|---|
| `framer-motion` | Imported by 23 matches in public/shared modules. | High impact | Restrict above-fold usage; keep below fold or replace with CSS where possible. |
| `embla-carousel-react` + `embla-carousel-autoplay` | Used in `src/modules/home/components/hero-carousel.tsx`. | High impact on home hero | Defer carousel hydration. |
| `radix-ui` | UI primitives imported by `dialog`, `dropdown-menu`, `select`, `sheet`, `tabs`, `label`, `separator`; public manifest includes several. | High if leaked public | Avoid UI barrel from public routes. |
| `lucide-react` | Used broadly; optimized in `next.config.ts`. | Medium | Keep `optimizePackageImports`; prefer direct icon imports only where practical. |
| `sonner` | Admin and deferred public blocked toast. | Low public | Keep admin-only; public runtime is already deferred. |
| `react-markdown` + `react-syntax-highlighter` | Only found in SEO guide admin component. | Low public | Keep admin-only or dynamically load guide tab. |
| `swiper` | In `package.json`; `src` usage count is 0. | Remove/investigate | Remove if no planned use. |
| `razorpay` | In `package.json`; no `src` usage found by dependency scan. | Remove/investigate | Remove unless an upcoming payment module needs it. |
| `resend` | In `package.json`; no `src` usage found by dependency scan. | Remove/investigate | Remove unless email service is being reintroduced. |

---

## 6. Shared Barrel Audit

File: `src/components/shared/index.ts`

Evidence:

```ts
export { SearchInput } from './search-input';
export { WhatsAppWidget } from './whatsapp-widget';
export { ImageUpload, MultiImageUpload, toSrc, isPlaceholderOrEmpty } from './image-upload';
export { VideoUpload } from './video-upload';
export { SafeImage } from './safe-image';
export { LazyOnView } from './lazy-on-view';
export { SplitWords } from './split-words';
export { OfflineIndicator } from './offline-indicator';
export { BlockedToast } from './blocked-toast';
```

Finding:

Public components import from `@/components/shared`, while the barrel also exports admin upload widgets and client runtime widgets.

Evidence of public usage:

- `src/modules/home/components/hero-section.tsx`: `import { SafeImage } from '@/components/shared';`
- `src/modules/home/components/why-jivo.tsx`: `import { SafeImage, SplitWords } from '@/components/shared';`
- `src/app/(public)/home/page-content.tsx`: `import { JsonLd } from '@/components/shared';`

Evidence of public manifest leakage:

- `.next/server/app/(public)/page_client-reference-manifest.js` contains `image-upload.tsx`, `video-upload.tsx`, `whatsapp-widget.tsx`, `safe-image.tsx`, and `hero-carousel.tsx`.

Impact:

High. Barrel exports increase the chance that public route client references include admin-only or optional runtime code.

Recommendation:

- Replace public imports with direct imports, for example `@/components/shared/safe-image`.
- Create separate barrels:
  - `src/components/shared/public.ts`
  - `src/components/shared/admin.ts`
  - `src/components/shared/runtime.ts`
- Do not export `ImageUpload` or `VideoUpload` from the same public-facing barrel as `SafeImage`.

---

## 7. UI Barrel Audit

File: `src/components/ui/index.ts`

Evidence:

```ts
export { Dialog, DialogClose, DialogContent, ... } from './dialog';
export { DropdownMenu, DropdownMenuPortal, ... } from './dropdown-menu';
export { Table, TableHeader, ... } from './table';
export { Select, SelectContent, ... } from './select';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
export { Sheet, SheetTrigger, SheetClose, ... } from './sheet';
```

Public usage evidence:

- `src/app/error.tsx`: `import { Button } from '@/components/ui';`
- `src/app/not-found.tsx`: `import { Button } from '@/components/ui';`
- `src/app/(public)/our-essence/the-story/error.tsx`: `import { Button } from '@/components/ui';`
- `src/app/(public)/our-essence/core-values/not-found.tsx`: `import { Button } from '@/components/ui';`

Manifest evidence:

- `.next/server/app/(public)/page_client-reference-manifest.js` contains `dialog.tsx`, `dropdown-menu.tsx`, `select.tsx`, `sheet.tsx`, and `table.tsx`.

Impact:

High. The public graph should not reference Radix dialog/dropdown/select/sheet/table primitives unless a route renders those controls.

Recommendation:

- Replace public `@/components/ui` imports with direct imports:
  - `@/components/ui/button`
  - `@/components/ui/skeleton`
- Keep `src/components/ui/index.ts` for admin-only convenience or remove it entirely.

---

## 8. SafeImage Audit

File: `src/components/shared/safe-image.tsx`

Evidence:

```ts
'use client';
import Image, { type ImageProps } from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
```

```ts
const [phase, setPhase] = useState<Phase>('initial');
const [currentSrc, setCurrentSrc] = useState(initial);
useEffect(() => {
  const resetTimer = window.setTimeout(() => {
    setPhase(...);
    setCurrentSrc(...);
  }, 0);
}, [initial]);
```

Good:

- Uses `next/image` internally.
- Encodes bare filenames into `/api/uploads/<filename>`.
- Handles missing files and fallback.
- Logs warnings in development.

Risk:

Every SafeImage is a client component. Search found `<SafeImage` 29 times and `<Image` 44 times. Because SafeImage is used across public visual sections, the fallback state machine hydrates for every image, even when most images load successfully.

Impact:

High aggregate hydration cost.

Recommendation:

- Create a server `SafeImage` that resolves URLs and renders `next/image`.
- Create a tiny optional `ClientImageFallback` only for images that fail or for admin previews.
- Keep the public API the same, but move retry/fallback state out of the critical default path.

---

## 9. Hero Audit

| Hero | Risk | Impact | Recommendation |
|---|---|---|---|
| Home static hero, `src/modules/home/components/hero-section.tsx` | Low if only one slide. Uses `SafeImage` with `priority`, `quality={90}`, and `sizes`. | Good LCP image setup, but SafeImage still hydrates. | Keep static first slide server-first. |
| Home carousel, `src/modules/home/components/hero-carousel.tsx` | High. Imports Embla Autoplay and Framer Motion above fold. | Can increase TBT, INP, and delay LCP on mobile. | Render first slide statically; lazy/idle hydrate carousel after LCP. |
| The Story hero, `src/modules/our-essence/the-story/components/hero-section.tsx` | Medium/high. `'use client'`, imports Framer Motion, animates h1/p above fold. | Hydrates hero content and ships Framer on route start. | Convert hero text to server static HTML; remove Framer from hero. |
| Core Values hero, `src/modules/our-essence/core-values/components/hero-section.tsx` | Low. No `use client` found; SafeImage with `priority`. | Best current hero pattern. | Keep pattern; consider capped `sizes` instead of `100vw`. |
| For Mother Earth hero, `src/modules/our-essence/for-mother-earth/components/hero-section.tsx` | Medium/high. Client Framer hero. | Route-specific critical JS. | Server-render hero; keep motion below fold only. |
| Our Fair Share hero, `src/modules/our-essence/our-fair-share/components/hero-section.tsx` | Medium/high. Client Framer hero. | Route-specific critical JS. | Server-render hero; keep motion below fold only. |
| Social Initiatives hero, `src/modules/our-essence/social-initiatives/components/hero-section.tsx` | Medium/high. Client Framer hero. | Route-specific critical JS. | Server-render hero; keep motion below fold only. |
| Baru Sahib Association hero, `src/modules/our-essence/baru-sahib-association/components/hero-section.tsx` | Low. No Framer import found in hero evidence; uses SafeImage priority. | Mostly image/SafeImage hydration cost. | Keep pattern; improve SafeImage split. |

---

## 10. Framer Motion Audit

Search evidence: `framer-motion` appears 23 times.

| File | Classification | Evidence | Recommendation |
|---|---|---|---|
| `src/modules/home/components/hero-carousel.tsx` | Can be simplified | `import { AnimatePresence, motion } from 'framer-motion'` in above-fold carousel. | Remove from initial hero; use CSS transition or lazy hydrate. |
| `src/modules/our-essence/the-story/components/hero-section.tsx` | Can be removed | Hero imports `motion`. | Make hero static server HTML. |
| `src/modules/our-essence/for-mother-earth/components/hero-section.tsx` | Can be removed | Hero imports `motion, useReducedMotion`. | Make hero static server HTML. |
| `src/modules/our-essence/our-fair-share/components/hero-section.tsx` | Can be removed | Hero imports `motion, useReducedMotion`. | Make hero static server HTML. |
| `src/modules/our-essence/social-initiatives/components/hero-section.tsx` | Can be removed | Hero imports `motion, useReducedMotion`. | Make hero static server HTML. |
| `src/components/shared/split-words.tsx` | Can be simplified | Framer per word. | Use only on major below-fold headings or replace with CSS reveal. |
| Below-fold public sections | Required/acceptable | Motion is used for reveal-on-scroll content. | Keep if wrapped/lazy and not part of critical path. |
| `src/components/shared/offline-indicator.tsx` | Acceptable | Loaded by public runtime after idle. | Keep deferred. |

Expected impact from Phase 1 Framer cleanup: +5 to +12 mobile performance points depending on route and hero carousel state.

---

## 11. LazyOnView Audit

Good implementations:

| File | Evidence | Status |
|---|---|---|
| `src/modules/our-essence/social-initiatives/components/social-initiatives-main.tsx` | Wraps `SplitStorySection` and `EducateEmpowerSection` in `LazyOnView`. | Good for non-critical client sections. |
| `src/modules/our-essence/for-mother-earth/components/for-mother-earth-main.tsx` | Wraps `CleanTreeSection` and `DisasterSection` in `LazyOnView`. | Good. |
| `src/modules/our-essence/our-fair-share/components/our-fair-share-main.tsx` | Wraps below-fold sections in `LazyOnView`. | Good. |
| `src/modules/our-essence/baru-sahib-association/components/baru-sahib-association-main.tsx` | Wraps `CinematicVideoSection` in `LazyOnView`. | Good for heavy video. |

Missing/improvable:

| File | Evidence | Impact | Recommendation |
|---|---|---|---|
| `src/modules/home/components/home-main.tsx` | Dynamic imports below-fold sections but does not use `LazyOnView`. | Medium. Home page client sections may hydrate earlier than necessary. | Wrap non-SEO/expensive widgets such as `ProductsFoundation`; keep SEO text server-rendered. |
| `src/modules/our-essence/the-story/components/the-story-main.tsx` | Dynamic imports `FounderSection` and `VisionSection`, no `LazyOnView`. | Medium. Below-fold Framer sections hydrate immediately. | Add `LazyOnView` only if SEO visibility tradeoff is acceptable; otherwise split server content from client animation. |
| `src/modules/our-essence/core-values/components/core-values-main.tsx` | Dynamic imports below-fold sections, no `LazyOnView`. | Medium. | Same recommendation: server content plus small animation island, or LazyOnView for non-SEO portions. |
| `src/modules/our-essence/baru-sahib-association/components/baru-sahib-association-main.tsx` | `HumanitySection` is dynamic but not wrapped. | Low/medium. | Wrap if below fold and non-critical. |

---

## 12. Image Pipeline Audit

Overall image architecture: GOOD.

Search counts:

| Pattern | Count |
|---|---:|
| `<img` | 3 |
| `<SafeImage` | 29 |
| `<Image` | 44 |
| `priority` | 19 |
| `sizes=` | 25 |
| `backgroundImage` | 73 |
| `background-image` | 1 |
| `placeholder=` | 68 |
| `blurDataURL` | 3 |

Upload pipeline evidence:

File: `src/app/api/upload/route.ts`

```ts
import sharp from 'sharp';
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'images');
const MAX_IMAGE_DIMENSION = 3200;
const IMAGE_WEBP_QUALITY = 95;
```

```ts
const webpBuffer = await sharp(buffer)
  .rotate()
  .resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, { fit: 'inside', withoutEnlargement: true })
  .webp({ quality: IMAGE_WEBP_QUALITY })
  .toBuffer();
```

Storage evidence:

```ts
const filename = `${Date.now()}-${safeName}.webp`;
const filePath = path.join(UPLOAD_DIR, filename);
await writeFile(filePath, webpBuffer);
```

Serving evidence:

File: `src/app/api/uploads/[filename]/route.ts`

```ts
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'images');
const cacheControl =
  filePath === PLACEHOLDER_PATH
    ? 'public, max-age=86400, s-maxage=604800'
    : 'public, max-age=31536000, immutable';
```

Good:

- Sharp optimization exists.
- WebP conversion exists.
- Files are stored outside `/public` in `uploads/images`.
- Filenames use timestamp plus sanitized name.
- Uploads API has directory traversal guards.
- Uploaded images are cacheable.
- Large videos stream with byte range support.
- Most public images use `SafeImage`, which uses `next/image`.

Issues/opportunities:

| File | Evidence | Impact | Recommendation |
|---|---|---|---|
| `src/app/api/upload/route.ts` | `IMAGE_WEBP_QUALITY = 95`; max dimension 3200. | Medium. Quality 95 and 3200px can create larger files than needed. | Use context-specific quality, usually WebP 85 for hero and 75-85 below fold; cap full-bleed hero to 1920-2400 where possible. |
| `src/lib/constants.ts` | `MAX_UPLOAD_SIZE = 10 * 1024 * 1024`. | Low/medium. Allows large original upload before Sharp. | Keep if admin workflow needs it; add hero dimension warning and post-encode size warning. |
| `src/modules/seo/components/SeoPreview.tsx` | Plain `<img>` is intentionally used for local `/api/uploads/*` preview. | Low public impact; admin-only. | Acceptable because this is an admin preview. |
| Public hero files | Some use `sizes="100vw"`. | Low/medium. Full-bleed acceptable, but capped sizes can reduce over-download. | Prefer `(max-width: 768px) 100vw, 1920px` for full-bleed heroes. |

---

## 13. Folder Structure Audit

Good structure:

| Area | Evidence | Assessment |
|---|---|---|
| `src/app` | Thin route files, App Router groups `(public)` and `admin`. | Good. |
| `src/modules` | Feature modules for home, SEO, navbar, footer, our-essence pages. | Good. |
| `src/modules/*/data/queries.ts` | Render queries often use `cache()` and Prisma `select`. | Good. |
| `src/components/layout` | Navbar/Footer/Breadcrumbs isolated. | Good. |
| `src/components/ui` | shadcn/Radix primitives centralized. | Good for admin, risky as public barrel. |

Problematic structure:

| Area | Evidence | Risk | Recommendation |
|---|---|---|---|
| `src/components/shared/index.ts` | Mixes public display components with admin upload widgets and runtime widgets. | Public bundle leakage. | Split shared barrels by runtime/use case. |
| `src/components/ui/index.ts` | Exports all UI primitives. | Radix leakage when imported from public components. | Avoid barrel in public route files. |
| `src/app/admin/(dashboard)/*/page.tsx` | Many large client pages with repeated fetch/save form logic. | Maintainability risk. | Extract reusable admin editor patterns and dynamic tab bodies. |
| `src/modules/our-essence/*/components` | Many client Framer sections repeat reveal logic. | Duplicate animation/client patterns. | Centralize section animation wrappers or server/client split pattern. |

---

## 14. Duplicate Code Audit

| File A | File B | Evidence | Recommendation |
|---|---|---|---|
| `src/app/admin/(dashboard)/our-essence-the-story/page.tsx` | Other `our-essence-*` admin pages | Repeated `useEffect` fetch, `handleSave`, active tab, toast, loading patterns. | Create reusable `CmsSectionEditor` or shared admin hooks. |
| `src/app/(public)/**/error.tsx` | `src/app/admin/(dashboard)/**/error.tsx` | Repeated client error boundary with `useEffect` console logging and `Button`. | Create a shared error UI imported directly without UI barrel. |
| Public hero sections | Several `our-essence/*/components/hero-section.tsx` | Repeated SafeImage priority/full-bleed hero patterns. | Create a server `PublicHero` primitive with optional client overlay island. |
| Below-fold Framer sections | Home and our-essence section components | Repeated `motion.div`, `container`, `fadeUp`, `SplitWords`. | Keep centralized variants; consider a shared `AnimatedSectionContent` client island. |
| Upload widgets | `image-upload.tsx` and `video-upload.tsx` | Similar upload/drop/remove callbacks. | Consider a shared upload hook after performance cleanup. |

---

## 15. Dead Code Audit

| Item | Reason | Recommendation |
|---|---|---|
| `swiper` dependency | Search count for `swiper` in `src` is 0. | Remove if not planned. |
| `razorpay` dependency | Dependency scan found only `package.json`. | Remove unless payment module will be restored. |
| `resend` dependency | Dependency scan found only `package.json`. | Remove unless email service will be restored. |
| `@uploadthing/react` and `uploadthing` | `src/lib/uploadthing.ts` exists, but upload route uses local Sharp pipeline. | Investigate whether UploadThing is still used. Remove if local uploads replaced it. |
| `react-redux` / Redux store | Store files exist, but providers are not in public root. | Investigate actual admin/current usage before removing. |
| `dompurify` | Dependency scan found only package entries. | Investigate. Remove if unused. |
| `@tiptap/*` | Package entries exist, no current import found in scan. | Keep only if blog editor is imminent; otherwise defer install. |

---

## 16. Reusability Audit

Reusable components already working:

- `SafeImage`
- `LazyOnView`
- `SectionSkeleton`
- `JsonLd`
- `ImageUpload`
- `VideoUpload`
- SEO components
- shadcn UI primitives

Components/patterns that should become reusable:

| Pattern | Evidence | Recommendation |
|---|---|---|
| Public hero | Multiple hero-section files with SafeImage priority and similar layout. | Create `PublicHero` or per-family hero primitive. |
| CMS admin editor | Repeated client admin page save/fetch/toast patterns. | Create `CmsTabsEditor`, `useCmsSectionData`, and `SeoTabPanel` integration wrapper. |
| Error boundary UI | Repeated `error.tsx` files. | Create direct-import shared `PageErrorView`. |
| Below-fold animated section | Repeated Framer/SplitWords wrapper. | Create a small client animation island used inside server-rendered section content. |

---

## 17. Dependency Audit

| Dependency | Classification | Reason |
|---|---|---|
| `next`, `react`, `react-dom` | KEEP | Core framework. |
| `@prisma/client`, `@prisma/adapter-pg`, `pg`, `prisma` | KEEP | Database stack. |
| `next-auth`, `@auth/prisma-adapter`, `bcryptjs` | KEEP | Auth stack. |
| `sharp` | KEEP | Required by upload optimization. |
| `framer-motion` | KEEP but reduce public usage | Used by public animations. Move out of heroes and defer below-fold. |
| `embla-carousel-react`, `embla-carousel-autoplay` | KEEP but defer | Used by home hero carousel. Should not block LCP. |
| `radix-ui` | KEEP | UI primitives, mostly admin. Avoid public leakage. |
| `lucide-react` | KEEP | Icons; optimized by Next config. |
| `sonner` | KEEP | Admin toasts and deferred public blocked toast. |
| `react-markdown`, `react-syntax-highlighter`, `remark-gfm` | KEEP/INVESTIGATE | Used by admin SEO guide. Consider dynamic tab import. |
| `@reduxjs/toolkit`, `react-redux` | INVESTIGATE | Store exists, but confirm active usage. |
| `@tanstack/react-query` | INVESTIGATE | Provider exists; confirm active admin usage before keeping globally. |
| `@tiptap/*` | INVESTIGATE | No current import found in scan; keep only for planned blog editor. |
| `uploadthing`, `@uploadthing/react` | INVESTIGATE | Local `/api/upload` route is current image pipeline; confirm old UploadThing usage. |
| `dompurify` | INVESTIGATE | No current import found in scan. |
| `swiper` | REMOVE/INVESTIGATE | No current `src` usage found. |
| `razorpay` | REMOVE/INVESTIGATE | No current `src` usage found and project notes say no Razorpay. |
| `resend` | REMOVE/INVESTIGATE | No current `src` usage found and project notes say no email service. |

---

## 18. Architecture Improvement Roadmap

### Phase 1 - Highest Impact

1. Shared barrel cleanup.
   - Files: `src/components/shared/index.ts`, public imports under `src/modules/**`, `src/app/(public)/**`.
   - Expected impact: large public client-reference reduction.

2. UI barrel cleanup.
   - Files: `src/components/ui/index.ts`, `src/app/error.tsx`, `src/app/not-found.tsx`, public error/not-found pages.
   - Expected impact: remove Radix primitives from public graph.

3. Home hero carousel critical-path cleanup.
   - Files: `src/modules/home/components/hero-section.tsx`, `hero-carousel.tsx`.
   - Expected impact: lower LCP/TBT on home.

4. Remove Framer Motion from public heroes.
   - Files: public `our-essence/*/components/hero-section.tsx`.
   - Expected impact: route-specific critical JS reduction.

### Phase 2

1. SafeImage server/client split.
2. Navbar server/client split and `useScroll` effect cleanup.
3. Home below-fold `LazyOnView` or server-content/client-animation split.
4. Dynamic-load heavy admin SEO guide.

### Phase 3

1. Dependency cleanup.
2. Admin editor abstraction.
3. Duplicate error UI extraction.
4. Upload quality tuning and hero dimension warnings.

### Phase 4

1. Route-by-route bundle analyzer review after cleanup.
2. Lighthouse re-run on production build.
3. Add CI performance budget or bundle-size check.

---

## 19. Estimated Improvements

No Lighthouse run was executed during this audit.

| Stage | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| Current estimate | Mobile ~52, Desktop ~64 | ~96 | ~92 | ~100 |
| After Phase 1 | Mobile ~68-78, Desktop ~78-88 | ~96 | ~92-95 | ~100 |
| After full optimization | Mobile ~78-88, Desktop ~88-95 | ~96-98 | ~95-100 | ~100 |

Expected Lighthouse drivers:

- LCP: improves mostly from hero carousel and hero Framer cleanup.
- TBT: improves from barrel cleanup, Radix leakage removal, Framer reduction, SafeImage split.
- Speed Index: improves from lower critical JS and fewer above-fold hydration tasks.
- CLS: already appears structurally protected by skeletons, dimensions, and `next/image`; continue monitoring.

---

## 20. Action Checklist

- [ ] Shared barrel cleanup.
- [ ] UI barrel cleanup.
- [ ] Replace public `@/components/ui` barrel imports with direct imports.
- [ ] Replace public `@/components/shared` barrel imports with direct imports or public barrel.
- [ ] SafeImage server/client split.
- [ ] Home hero carousel static-first optimization.
- [ ] Remove Framer Motion from public hero sections.
- [ ] Navbar server/client split.
- [ ] `useScroll` listener cleanup.
- [ ] Home below-fold hydration timing audit.
- [ ] ProductsFoundation canvas mount only when visible.
- [ ] SplitWords usage reduction or non-motion fallback.
- [ ] Bundle analyzer after Phase 1.
- [ ] Remove or confirm unused dependencies: `swiper`, `razorpay`, `resend`, `dompurify`, `@tiptap/*`, UploadThing packages.
- [ ] Admin editor abstraction.
- [ ] Duplicate error UI extraction.
- [ ] Upload quality tuning and hero image warnings.
- [ ] Re-run production Lighthouse after each phase.

---

## Final Health Decision

Current project classification: GOOD FOUNDATION, NEEDS PERFORMANCE IMPROVEMENT.

Why not excellent yet:

- Public route manifest includes client modules that should not be public.
- Public UI and shared barrels create bundle leakage risk.
- Several public heroes are client Framer components.
- Home carousel can ship Embla and Framer above the fold.
- SafeImage hydrates every image.
- Unused or unconfirmed dependencies remain in `package.json`.

Why the foundation is strong:

- Public CMS pages use ISR.
- SEO system is robust.
- Sitemap and robots exist.
- Image upload pipeline uses Sharp and WebP.
- Data queries use `cache()` and Prisma `select`.
- Admin providers are isolated from the root public layout.
