# responsive.md — jivo-web Build & Animation Rules (STRICT)

> **How to use this file:** Before creating or editing ANY page or component, read this file in full and follow every rule. These are hard constraints, not suggestions. MUST / NEVER / ALWAYS are non-negotiable. When fixing an existing page, follow the **Per-Page Workflow** (Section 13). Finish only after the **Definition of Done** (Section 14) fully passes.

---

## 0. Locked project context (do NOT re-derive)

- **Framework:** Next.js 16 (App Router, `src/app/`), TypeScript, Turbopack dev.
- **Styling:** Tailwind CSS **v4** — NO `tailwind.config.*`. All config lives in `src/app/globals.css` via `@theme inline` + `@plugin`.
- **Breakpoints:** Tailwind defaults (sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536). Custom ones go in `@theme`, never a config file.
- **Font:** single family **Jost**, loaded via `next/font/local` (`--font-jost`). Use the existing `font-jost-light … font-jost-extrabold` utilities for weight, NOT `font-bold` etc.
- **Animation engine:** **Motion (framer-motion v12) is PRIMARY.** The single source of truth is `src/lib/animation-variants.ts`. GSAP is NOT installed and is only an escape hatch (Section 11).
- **Existing good foundations to build ON (do not replace):** `clamp()` fluid sizing, `animation-variants.ts`, the heading base layer in `globals.css`, the `.section-container` utility.

---

## 1. Golden rules (read first)

- [ ] **Mobile-first ALWAYS.** Base styles target the smallest screen; add `sm: md: lg: xl: 2xl:` upward. NEVER desktop-first.
- [ ] **One fluid type scale** (Section 3). NEVER mix `text-3xl sm:text-4xl lg:text-[clamp(...)]` on the same element.
- [ ] **NEVER use raw `vh` for height.** Use `dvh` (or `svh` for full-bleed heroes). See Section 4.
- [ ] **NEVER combine `whitespace-nowrap` with a clamped/fluid headline.** See Section 5.
- [ ] **NEVER use absolute positioning to place primary content.** Use grid stacking (Section 6). Absolute is for decoration/overlays only.
- [ ] **ALWAYS check for horizontal overflow** — scrollbars are globally hidden, so overflow is invisible (Section 7).
- [ ] **Use the existing Motion variants** from `animation-variants.ts`. NEVER hand-roll new inline variants when one exists.
- [ ] **NEVER animate the hero / LCP element.** This rule already exists — keep it.
- [ ] **ALWAYS honor `prefers-reduced-motion`** (Section 10.4).
- [ ] **Verify all six widths** before done (Section 12).

---

## 2. Target widths (must work on all)

Test and make intentional at: **360, 640, 768, 1024, 1280, 1536px**.
Pay extra attention to the **lg boundary (~1024px)** — the audit found most overflow/alignment breaks there.

---

## 3. Fluid typography — the ONE scale (fixes inconsistency)

The audit found two competing strategies (`clamp()` in some files, `text-3xl sm:text-4xl lg:clamp()` in others). Standardize on tokens.

- [ ] Define reusable fluid text tokens ONCE in `globals.css` `@theme` (Tailwind v4 auto-generates `text-*` utilities):
  ```css
  @theme {
    --text-display: clamp(2.5rem, 1.5rem + 4vw, 4.5rem);
    --text-display--line-height: 1.05;
    --text-h1: clamp(2rem, 1.25rem + 3.25vw, 3.5rem);
    --text-h1--line-height: 1.1;
    --text-h2: clamp(1.6rem, 1.2rem + 2vw, 2.5rem);
    --text-h2--line-height: 1.15;
    --text-h3: clamp(1.25rem, 1rem + 1.25vw, 1.75rem);
    --text-body: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  }
  ```
  Then use `className="text-display"`, `text-h1`, `text-body`, etc.
- [ ] Headings/heroes MUST use a single token (`text-display`/`text-h1`/…). NEVER stack per-breakpoint sizes AND a clamp on the same element.
- [ ] Body text MUST resolve to ≥ 16px on mobile. NEVER smaller.
- [ ] Cap measure on paragraphs: `max-w-prose` or `max-w-[65ch]`.
- [ ] Font weights via existing `font-jost-*` utilities; font sizes via `rem`/tokens, NEVER `px`.
- [ ] Migrate the inconsistent sections (`wheatgrass-sections.tsx`, etc.) onto these tokens when touched.

---

## 4. Viewport height — dvh / svh (fixes the vh jump)

The audit found raw `vh` and `h-screen` in heroes, loaders, error/placeholder pages, and dialogs → mobile URL-bar height jump. No `dvh` is used yet.

- [ ] Full-height content sections: use `min-h-dvh` / `h-dvh`. NEVER `min-h-screen` / `h-screen` / `min-h-[60vh]`.
- [ ] Full-bleed heroes that should fill the _initial_ viewport: `svh` (e.g. `min-h-[60svh]`) — keep the sections already doing this.
- [ ] Dialogs/modals: `max-h-[90dvh]` not `90vh`.
- [ ] `vh` inside a `clamp()` (e.g. `pt-[clamp(7rem,14vh,10rem)]`) → prefer `dvh` (`14dvh`) for the fluid term.
- [ ] Placeholder/loading/error pages (`min-h-[60vh]`, `min-h-[40vh]`) → convert to `dvh`.

---

## 5. Text & alignment (fixes lg overflow + wrapping)

- [ ] **BANNED:** `lg:whitespace-nowrap` (or any `whitespace-nowrap`) on clamped/fluid headlines. The audit flagged this in `our-fair-share/hero`, `women-empowerment`, `educate-empower`, `jivo-capital hero`. Remove it; allow wrapping.
- [ ] Headlines MUST use `text-balance` (`[text-wrap:balance]`) so multi-line wraps evenly.
- [ ] Paragraphs SHOULD use `text-pretty` to avoid orphans.
- [ ] Align with flex/grid utilities (`items-center`, `justify-*`, `text-center`). NEVER manual margins or absolute offsets for alignment.
- [ ] `ml-auto` / right-aligned text over an image MUST be re-checked at every width — it's a top alignment-risk pattern here.
- [ ] Clamp long dynamic text: `truncate` or `line-clamp-2/3`.
- [ ] Icon+text pairs: `inline-flex items-center gap-2`. NEVER hardcoded vertical offsets.

---

## 6. Layered / absolute-over-image content (fixes fragile heroes)

The audit flagged heavy absolute layouts: `CinematicVideoSection` (19), `wheatgrass-sections` (13), `our-fair-share/hero` (7), `humanity-section` (6).

- [ ] To stack text over an image/video, PREFER CSS grid stacking over absolute:
  ```jsx
  <div className="grid [grid-template-areas:'stack'] *:[grid-area:stack]">
    <Image ... className="object-cover" />
    <div className="relative z-10 flex items-end p-6 sm:p-10">{/* text */}</div>
  </div>
  ```
  This keeps content in normal flow so it reflows responsively. (Tailwind: `[grid-area:stack]` on children, or place both in one cell.)
- [ ] Absolute is allowed ONLY for true decoration (grain, gradients, glows) — mark intent with a comment.
- [ ] Absolutely-positioned content (if unavoidable) MUST be re-tested at all six widths and MUST NOT use fixed-px offsets that break on small screens.
- [ ] Layered text MUST keep a contrast scrim/gradient so it stays readable on any image.

---

## 7. Overflow audit (hidden-scrollbar hazard — MANDATORY)

Scrollbars are hidden globally (`globals.css`), so horizontal overflow scrolls silently with no visual cue. You MUST actively check.

- [ ] After building/editing a page, run this in the browser console at 360px and 1024px:
  ```js
  document.querySelectorAll('*').forEach((el) => {
    if (el.scrollWidth > document.documentElement.clientWidth) console.warn('OVERFLOW:', el);
  });
  // and: document.documentElement.scrollWidth > document.documentElement.clientWidth
  ```
- [ ] If anything reports, fix the cause (usually `whitespace-nowrap`, a fixed-px width, negative margin, or an un-wrapped flex row). NEVER “solve” it by clipping with `overflow-hidden` unless that's the genuine intent.
- [ ] Flex children holding text MUST have `min-w-0` to prevent blowout.
- [ ] Rows of items MUST `flex-wrap` or use a responsive grid — NEVER overflow horizontally.

---

## 8. Layout, spacing, sizing & media

- [ ] Use `.section-container` (or `mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8`) for page width. Don't reinvent containers.
- [ ] Flexbox/Grid only for layout. NEVER floats.
- [ ] Multi-column → single column on base/sm: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
- [ ] Spacing between children via `gap-*`, not sibling margins.
- [ ] Scale padding up: `p-4 sm:p-6 lg:p-8`.
- [ ] Touch targets ≥ 44×44px (`min-h-11 min-w-11` or padding).
- [ ] Standardize stray `max-w-[NNNpx]` caps toward the token/container scale when touched (audit found 89 across 22 files; most benign — don't churn, but unify when editing).
- [ ] Images: keep using `next/image` via the existing `safe-image` / `image-with-fallback` wrappers. ALWAYS pass a correct `sizes`, e.g. `sizes="(max-width: 768px) 100vw, 50vw"`. NEVER plain `<img>` in user-facing pages.
- [ ] Video/iframe wrapped in `aspect-video w-full`. Reserve space to avoid layout shift.

---

## 9. Container queries (use for reusable components)

Tailwind v4 has container queries in core — no plugin needed.

- [ ] Reusable components rendered at varying widths (cards, list items, founder/quote blocks) SHOULD respond to their container, not the viewport:
  ```jsx
  <div className="@container">
    <article className="flex flex-col gap-4 @md:flex-row @md:items-center">…</article>
  </div>
  ```
- [ ] Prefer `@`-variants over viewport breakpoints inside shared/reusable components.

---

## 10. Animation — Motion (framer-motion) is PRIMARY

- [ ] **USE the existing variants** from `src/lib/animation-variants.ts` (`container`, `fadeUp`, `fadeIn`, `scaleIn`, `reducedMotion`, `defaultViewport`). NEVER duplicate them inline.
- [ ] Scroll reveals MUST use `whileInView` + `defaultViewport` (`{ once: true, amount: 0.25 }`). Keep `once: true`.
- [ ] If a new reusable motion pattern is needed, ADD it to `animation-variants.ts` — do not scatter one-off variants across components.
- [ ] **NEVER animate the hero / LCP element** (enter animations delay LCP). Keep the existing rule.
- [ ] Animate `transform` (`x`, `y`, `scale`) and `opacity` only. AVOID animating layout-affecting props (`width/height/top/left/margin`).
- [ ] Enter/exit transitions use `AnimatePresence` (as already done in navbar / offline-indicator). Keep exit logic with the component, not absolute hacks.
- [ ] Keep durations short (0.3–0.8s), eased (e.g. `ease: "easeOut"` / custom cubic-bezier). NEVER linear for UI reveals.
- [ ] Stagger via the `container` variant; cap total stagger time so long lists don't crawl.

### 10.4 Reduced motion (MANDATORY)

- [ ] Respect `prefers-reduced-motion`: use the existing `reducedMotion` variant / Motion's `useReducedMotion()` so reduced-motion users get opacity-only or no motion.
- [ ] CSS keyframe effects (`cinematicZoom*`, `socialHeroZoom`, `.cinematic-grain`) MUST keep their `prefers-reduced-motion` guard (already present for grain — extend to the others if missing).

---

## 11. GSAP — escape hatch ONLY (not installed by default)

Use GSAP ONLY for effects Motion handles poorly: complex scroll-timeline choreography, pinning, or character-level text effects (SplitText). Otherwise use Motion.

If genuinely needed:

- [ ] `npm i gsap @gsap/react`. File MUST start with `"use client";`.
- [ ] Register plugins once, outside the component; animate inside `useGSAP()` with a `scope` ref (auto-cleanup, Strict-Mode safe):

  ```jsx
  'use client';
  import { useRef } from 'react';
  import gsap from 'gsap';
  import { useGSAP } from '@gsap/react';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { SplitText } from 'gsap/SplitText';
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

  const scope = useRef(null);
  useGSAP(
    () => {
      const split = new SplitText('.headline', { type: 'words,chars' });
      gsap.from(split.chars, { opacity: 0, y: 20, stagger: 0.02, ease: 'power3.out' });
    },
    { scope },
  );
  ```

- [ ] **Wait for fonts before SplitText** (Jost loads async): `document.fonts.ready.then(() => { /* split */ })` — otherwise text reflows after split.
- [ ] Wrap GSAP motion in `gsap.matchMedia()` with a `(prefers-reduced-motion: reduce)` branch that sets final state instantly.
- [ ] After dynamic content/images settle, call `ScrollTrigger.refresh()`.
- [ ] Do NOT mix Motion and GSAP on the SAME element. Pick one per element.

---

## 12. Per-breakpoint verification (run before finishing)

At EACH of 360 / 640 / 768 / 1024 / 1280 / 1536px:

- [ ] No horizontal overflow (Section 7 console check passes).
- [ ] Headlines wrap cleanly; no `nowrap` overflow; alignment correct (esp. right-aligned-over-image).
- [ ] One consistent fluid type scale; no jarring size jumps at lg.
- [ ] Full-height sections use dvh/svh; no mobile URL-bar jump.
- [ ] Layered text readable and positioned correctly; reflows in normal flow.
- [ ] Columns collapse/expand as intended; images scale without distortion.
- [ ] Tap targets large enough on touch widths.
- [ ] Animations smooth, no layout shift, hero not animated, reduced-motion respected.

---

## 13. Per-Page Workflow (how we implement, one page at a time)

For each page we tackle:

1. **Read** this file. Open the target page + its section components.
2. **Inventory** violations against Sections 3–11 (list them before editing).
3. **Fix in this order:** (a) `vh→dvh/svh`, (b) remove `nowrap` on clamped headlines + add `text-balance`, (c) migrate to the one type scale, (d) convert absolute-over-image to grid stacking, (e) overflow check, (f) confirm animations use shared variants + hero untouched.
4. **Run** the Section 7 overflow check and Section 12 width pass.
5. **Report** what changed and confirm the Definition of Done.

**Suggested priority order across the site (from the audit, worst first):**

1. `our-essence/our-fair-share/hero-section.tsx` + `women-empowerment-section.tsx` (nowrap + right-align-over-image)
2. `baru-sahib-association/CinematicVideoSection.tsx` (19 absolute blocks)
3. `the-jivo-capital/wheatgrass-sections.tsx` (inconsistent type scale + 13 absolute blocks)
4. `social-initiatives/hero-section.tsx` (complex midrange grid)
5. `home/hero-section.tsx` + `hero-carousel.tsx` (vh/h-screen → svh/dvh)

---

## 14. Definition of Done (final gate)

Do not consider a page complete until ALL are true:

- [ ] Mobile-first; base styles work with no breakpoint prefixes.
- [ ] One fluid type scale via `@theme` tokens; body ≥ 16px on mobile.
- [ ] No raw `vh`/`h-screen`; uses `dvh`/`svh`.
- [ ] No `whitespace-nowrap` on fluid headlines; headings use `text-balance`.
- [ ] No absolute positioning for primary content; grid stacking used for layered text.
- [ ] Section 7 overflow check passes at 360px and 1024px.
- [ ] Container queries used in reusable components where width varies.
- [ ] Animations use `animation-variants.ts`; hero/LCP not animated; reduced-motion respected.
- [ ] `next/image` (via existing wrappers) with correct `sizes`; no plain `<img>`.
- [ ] Section 12 verified at all six widths.
