# performance.md - jivo-web Performance & Lighthouse Rules (STRICT)

> **How to use this file:** Read in full before optimizing any page. These are hard constraints. Always **MEASURE FIRST** (Section 10), fix per these rules, then **RE-MEASURE and report** what changed and which Lighthouse audit each fix targeted. Never sacrifice the rules in `responsive.md` to gain a performance point. Both must pass.

---

## 0. Locked project context (do NOT re-derive)

- **Framework:** Next.js 16 (App Router, `src/app/`), TypeScript, Turbopack dev.
- **Styling:** Tailwind v4 via `globals.css` (`@theme inline`). No config file.
- **Font:** Jost via `next/font/local` (`--font-jost`, `display: swap`, 7 weight files).
- **Animation:** Motion (framer-motion v12) across ~27 client components; centralized `src/lib/animation-variants.ts`. Existing rule: **never animate the hero/LCP element** - keep it.
- **Images:** `next/image` via `safe-image` / `image-with-fallback` wrappers.

---

## 1. Golden rules (read first)

- [ ] **MEASURE ON A CLEAN RUN.** Lighthouse must be run in Incognito with browser extensions disabled, using mobile preset, on the HTTPS production domain.
- [ ] Never trust a score from a run where Lighthouse warns about extensions or an incomplete/timed-out load (for example the previous 29 score on `our-fair-share`).
- [ ] **MEASURE before and after.** Never claim a fix without a before/after number or a named Lighthouse audit (Section 10).
- [ ] **The LCP element is sacred.** Identify it, load it `priority`, never lazy-load it, never animate it, reserve its space.
- [ ] **Default to Server Components.** Add `"use client"` ONLY to components that need interactivity/animation. Keep client boundaries as small and as low in the tree as possible.
- [ ] **Reserve space for everything** (images, media, dynamic content) to keep CLS near 0.
- [ ] **Ship less JavaScript.** Lazy-load below-the-fold and heavy client components.
- [ ] **Fix every console error/warning** - they cap Best Practices.
- [ ] **Re-test Best Practices on the HTTPS production domain**, not the HTTP dev IP.
- [ ] Never break `responsive.md` rules to gain performance.

---

## 2. Baseline & targets

Measured pages (HTTP dev `103.89.45.75:3001`, extensions active):

| Route | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| `/our-essence/the-story` | 66 | 96 | 70 | 100 |
| `/our-essence/core-values` | 68 | 100 | 70 | 100 |
| `/our-essence/baru-sahib-association` | 70 | 98 | 70 | 100 |
| `/our-essence/social-initiatives` | 43 | 98 | 70 | 100 |
| `/our-essence/our-fair-share` | 29 *(UNRELIABLE: extensions + incomplete/timed-out load)* | 98 | 70 | 100 |

Note: these values are not clean baselines. Real scores must be taken from an **Incognito, extensions-disabled, mobile Lighthouse run on the HTTPS production domain**.

Targets:
- [ ] Performance >= 90
- [ ] Best Practices >= 95 (most of the gap is HTTP + console errors)
- [ ] Keep Accessibility >= 96 and SEO 100 (do NOT regress them)

Core Web Vitals targets (mobile): **LCP < 2.5s, CLS < 0.1, TBT < 200ms, FCP < 1.8s**.

---

## 3. Images & LCP (the biggest lever)

- [ ] Identify the LCP element first (DevTools > Performance/Lighthouse > "Largest Contentful Paint element"). On hero pages it's the hero image or the hero heading.
- [ ] The LCP image MUST set `priority` (preloads, disables lazy-load). Below-the-fold images MUST NOT use `priority` (default lazy-load is correct).
- [ ] Every `next/image` MUST have an accurate `sizes`, e.g. full-bleed hero: `sizes="100vw"`; half-width: `sizes="(max-width: 768px) 100vw, 50vw"`. Wrong `sizes` = oversized downloads = slow LCP.
- [ ] Provide intrinsic dimensions: explicit `width`/`height`, OR `fill` inside a container that has a reserved aspect ratio (`aspect-[16/9]` / fixed `min-h`). Prevents CLS.
- [ ] Tune `quality` (try `quality={70-80}`) - large hero JPEGs are often the heaviest byte cost.
- [ ] Enable modern formats in `next.config`: `images: { formats: ['image/avif', 'image/webp'] }`.
- [ ] Source images MUST NOT be larger than needed. If a hero source is multi-MB or >2500px wide, downscale it at the source.
- [ ] Background-image heroes set via CSS (not `next/image`) are NOT optimized; convert decorative-but-large backgrounds to `next/image` with `fill` where feasible.

---

## 4. Fonts (Jost / next/font)

- [ ] Keep `next/font/local` (self-hosted, no extra connection). Good as-is.
- [ ] Preload ONLY the weights used above the fold; set `preload: true` on those, `preload: false` on rarely-used weights to cut bytes.
- [ ] Keep `display: 'swap'`. Rely on next/font's automatic fallback metric adjustment to minimize CLS (don't disable it).
- [ ] Avoid loading all 7 weights on every route if a route uses only 2-3; subset where practical.
- [ ] Do NOT add external font CDNs.

---

## 5. JavaScript & TBT (Motion hydration cost)

- [ ] Make `LazyMotion` + `m` the default Motion pattern across this codebase (around 27 Motion client components). Avoid importing full `motion` unless there is a proven reason.
- [ ] Wrap Motion use with `LazyMotion` + `m`:
  ```jsx
  "use client";
  import { LazyMotion, domAnimation, m } from "framer-motion";
  <LazyMotion features={domAnimation}>
    <m.div initial="hidden" whileInView="show" variants={fadeUp} />
  </LazyMotion>
  ```
  (`m` + `domAnimation` ships far less JS than `motion`.)
- [ ] Below-the-fold heavy client sections MUST be `next/dynamic` imported so their JS is not in the initial bundle:
  ```jsx
  const CinematicVideoSection = dynamic(() => import("./CinematicVideoSection"));
  ```
  (Use `ssr: false` when SEO value is intentionally absent.)
- [ ] Keep `"use client"` boundaries small. A single client leaf should not force a full route subtree to become client-rendered.
- [ ] Split static content into Server Components.
- [ ] Don't run scroll/resize listeners without throttle; prefer the existing `use-scroll` hook / Intersection Observer (Motion's `whileInView` already uses observers).
- [ ] Remove unused imports/dead code flagged by Lighthouse as reduce unused JavaScript.

---

## 6. CLS - layout stability

- [ ] Every image/video/embed has reserved space (Section 3). No exceptions.
- [ ] Never insert content above existing content after load (banners, late hero text).
- [ ] Animations animate `transform`/`opacity` only - never layout props (already in responsive.md).
- [ ] Hero text/heading must occupy its final box from first paint (font fallback metrics handle the swap).

---

## 7. Render path - FCP / Speed Index

- [ ] No render-blocking third-party scripts. Defer/async anything non-critical; load analytics via `next/script` with `strategy="afterInteractive"` or `lazyOnload`.
- [ ] `preconnect`/`dns-prefetch` only for origins used early (for example image CDN). Don't over-preconnect.
- [ ] Keep critical CSS minimal - Tailwind v4 purges unused; avoid importing large unused CSS.
- [ ] Avoid large client-side data fetching that blocks first paint; fetch on the server (Server Components / route handlers) where possible.

---

## 8. Best Practices fixes (currently 70)

- [ ] **HTTPS:** re-run Lighthouse on the HTTPS production domain. The HTTP dev IP (`103.89.45.75:3001`) penalizes Best Practices.
- [ ] **Console errors/warnings:** open the Console, fix EVERY error and warning (the report shows active shared errors). Common culprits: failed image/resource loads, hydration mismatches, deprecated API usage, missing keys.
- [ ] **Image aspect ratio:** ensure rendered `width:height` matches source natural ratio (Lighthouse flags distortions). Use correct dimensions / `object-cover` with fixed box.
- [ ] **No deprecated APIs**; no `document.write`; no mixed content.
- [ ] Add baseline security headers in `next.config` where possible (for example `X-Content-Type-Options: nosniff`) and keep scripts secure.

---

## 9. next.config / network

- [ ] `images.formats: ['image/avif','image/webp']`.
- [ ] Confirm compression is on (default in Next) and static assets are cache-headed by the host.
- [ ] Verify `images.deviceSizes`/`imageSizes` are sane for the `sizes` in use (defaults are usually fine).

---

## 10. Measurement workflow (MANDATORY - do this every time)

1. **Before:** run Lighthouse (mobile, incognito, HTTPS production) on the target route. Record Performance, Best Practices, and four vitals (LCP, CLS, TBT, FCP) + the LCP element + top opportunities/diagnostics.
2. Note the **specific failing audits** (for example "Properly size images", "Reduce unused JavaScript", "Largest Contentful Paint element", "Avoid large layout shifts").
3. Apply fixes mapped to those exact audits and the relevant canonical sections below.
4. **After:** re-run Lighthouse the same way and record new numbers.
5. **Report**: audit => what changed => before/after metric. No fix is complete without this table.

> If Lighthouse cannot run here, reason from the audit list and report expected impact, then ask for a clean re-run.

---

## 11. Per-page workflow

1. Read this file and `responsive.md`.
2. Run a clean baseline (Section 1, Section 10).
3. Run Network tab > sort by size and identify the heaviest resource first (Section 16).
4. Fix in this order:
   - Shared recurring console errors (Section 13).
   - Apply `standard hero/section image pattern` (Section 14) where relevant.
   - Apply `video performance` rules if cinematic media is present (Section 15).
   - Apply canonical JS/TBT reductions (Section 5).
5. Re-check `responsive.md` at all six widths (no regressions).
6. Re-measure with the same clean run.
7. Submit the before->after table (Section 10).

---

## 12. Definition of done (final gate)

- [ ] Clean baseline + re-measure are recorded on HTTPS production.
- [ ] LCP element identified, priority set, space-reserved, not animated.
- [ ] All `next/image` have correct `sizes` + intrinsic dimensions/space reservation.
- [ ] AVIF/WebP enabled and oversized sources downscaled.
- [ ] Shared recurring console errors fixed once (Section 13).
- [ ] Motion uses `LazyMotion`/`m` as default; heavy below-the-fold sections are dynamic imports.
- [ ] CLS < 0.1 (everything reserved); TBT < 200ms; LCP < 2.5s.
- [ ] Report table delivered (audit => change => before/after).
- [ ] Accessibility and SEO not regressed.
- [ ] `responsive.md` rules pass at all six widths.

---

## 13. Recurring site-wide issues (fix once, helps every page)

- [ ] Best Practices is pinned near 70 on all measured essence pages. Treat this as a shared issue: recurring shared-code console error(s) + HTTP dev context.
- [ ] Fix the recurring console error in shared runtime/layout paths once (layout, providers, navbar, footer, offline-indicator).
- [ ] If any route has low Performance for the same reasons, treat it as pattern debt first: image payloads + above-the-fold Motion hydration.

## 14. Standard hero/section image pattern (reuse everywhere)

- [ ] next/image with `fill`, priority ONLY on LCP hero, `sizes="100vw"` for full-bleed sections.
- [ ] Reserve a stable container size (`min-h-*` or aspect ratio) so CLS stays near zero.
- [ ] Use `quality={70-80}` for large section/hero assets.
- [ ] Enable AVIF/WebP output via `next.config`.
- [ ] Add a contrast scrim for text over images.
- [ ] Large decorative CSS backgrounds MUST be converted to this pattern.

```tsx
<section className="relative min-h-[60svh]">
  <SafeImage
    src={heroImage}
    alt="..."
    fill
    priority
    sizes="100vw"
    quality={80}
    className="object-cover"
  />
  <div className="absolute inset-0 bg-linear-to-r from-black/30 via-black/10 to-black/20" />
  <div className="relative z-10">...</div>
</section>
```

## 15. Video performance (cinematic sections)

- [ ] Never eager-load heavy video files.
- [ ] Use `poster` + `preload="metadata"`.
- [ ] Load and play only when visible (Intersection Observer or `next/dynamic` with `ssr: false`).
- [ ] Compress source media.
- [ ] Use this pattern for cinematic sections, especially `CinematicVideoSection`.

```tsx
<video
  poster="/path/poster.webp"
  preload="metadata"
  controls
  playsInline
  muted
>
  <source src="/videos/scene-compressed.mp4" type="video/mp4" />
</video>
```

## 16. Triage by score

- [ ] If a page scores < 50, start with Network tab "Sort by size" and fix the single largest resource first.
- [ ] One oversized/heaviest asset usually dominates the score and should be fixed before smaller cleanup items.


