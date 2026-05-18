# SEO Manager Upgrade — Implementation Plan

**Branch:** `security/performance`  
**Date:** 2026-04-24  
**Scope:** 8 tasks, zero API/DB changes

---

## Codebase Snapshot

| File | Role |
|------|------|
| `src/app/admin/(dashboard)/seo/page.tsx` | Main admin SEO page (cards grid, edit drawer) |
| `src/modules/seo/components/SeoTabPanel.tsx` | Edit form (all field inputs) |
| `src/modules/seo/data/defaults.ts` | `siteDefaultSeo` + `definePageSeo` helper |
| `src/modules/seo/utils.ts` | `resolveSeo()`, `getStructuredData()` |
| `src/lib/constants.ts` | `SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://jivo.in'` |
| `src/modules/home/data/defaults.ts` | Example module-level SEO defaults |

**Installed:** `sonner` (toasts), `lucide-react` (icons), `react-hook-form`, `zod`  
**Missing:** `react-markdown` — must be installed for Task 1

---

## Task 1 — SEO Guide (Markdown, collapsible, below cards)

### Files to create
- `src/modules/seo/docs/seo-guide.md` — the full guide content
- `src/modules/seo/components/SeoGuide.tsx` — React component that renders it

### Files to modify
- `src/app/admin/(dashboard)/seo/page.tsx` — add `<SeoGuide />` after the cards grid + footer hint

### Installation required
```bash
npm install react-markdown
```

### SeoGuide.tsx design
- `'use client'` component
- State: `open` (boolean, default `false`)
- Toggle button: `"Show SEO Guide"` / `"Hide SEO Guide"` with ChevronDown icon
- Render: `<ReactMarkdown>` inside the panel with dark-theme prose styling via `className`
- No external CSS libraries needed — style via Tailwind `prose` classes or manual element overrides

### seo-guide.md content outline
1. **What is SEO?** — simple explanation, real Google example
2. **Field-by-field guide** — for every field in `SeoTabPanel`: what it does, real example, best practice
   - Meta Title, Meta Description, Keywords, Canonical URL, Robots, OG Title, OG Description, OG Image, Twitter Card, JSON-LD
3. **Robots directive guide** — when to use each value, real-page examples (home → index,follow; admin/cart → noindex)
4. **Common mistakes** — localhost in canonical, missing OG image, wrong robots, too-long text
5. **Checklist** — Title < 70 chars, Description < 180 chars, always OG image, use real domain

### Placement in page.tsx
```
[Stats row]
[Search + Add button]
[Pages heading]
[Cards grid]           ← existing
[Footer hint]          ← existing
──────────────────────
[SeoGuide component]   ← NEW: after the footer hint
```

---

## Task 2 — Copy Buttons (UX)

### File to modify
- `src/modules/seo/components/SeoTabPanel.tsx`

### Fields with copy buttons
| Field | Element | Copy value |
|-------|---------|------------|
| Meta Title | `Input` | `form.metaTitle` |
| Meta Description | `Textarea` | `form.metaDescription` |
| Keywords | `Input` | `keywordsInput` |
| Canonical URL | `Input` | `form.canonicalUrl` |
| OG Title | `Input` | `form.ogTitle` |
| OG Description | `Textarea` | `form.ogDescription` |
| JSON-LD | `Textarea` | `structuredInput` pretty-formatted |

### Implementation
- Create a tiny `CopyButton` inline component (inside the file, not a shared component):
  ```tsx
  function CopyButton({ value }: { value: string }) { ... }
  ```
- Uses `navigator.clipboard.writeText(value)`
- Shows `Copy` (Clipboard icon) → brief "Copied!" state for 1.5s, then resets
- Toast: `toast.success('Copied!')` via sonner
- Position: absolute/inline right side of the label row (flex row with `justify-between`)
- JSON-LD special: format via `JSON.stringify(JSON.parse(structuredInput), null, 2)` before copy; catch parse error silently

---

## Task 3 — Live Preview (Google + WhatsApp)

### Files to create
- `src/modules/seo/components/SeoPreview.tsx`

### File to modify
- `src/modules/seo/components/SeoTabPanel.tsx` — import and render `<SeoPreview>` below the structured-data section, above the action bar

### SeoPreview.tsx props
```tsx
interface SeoPreviewProps {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}
```

### Google SERP Preview
```
┌────────────────────────────────────────────┐
│ 🔍 Google Preview                          │
│                                            │
│ [Blue link] Meta Title (or OG Title)       │
│ [Green/gray] https://jivo.in/page-url      │
│ [Gray text] Meta Description snippet...    │
└────────────────────────────────────────────┘
```
- Title: blue, 600 weight, truncate at 60 chars shown
- URL: gray-green `text-[#006621]` style
- Description: gray, truncate at 160 chars shown
- Fallbacks: if canonical empty → show `https://jivo.in`

### WhatsApp / Social Preview
```
┌────────────────────────────────────────────┐
│ 📱 Social / WhatsApp Preview               │
│ ┌─────────────────────────────────────────┐│
│ │  [OG Image — 1200×630 aspect ratio]     ││
│ │  OG Title                               ││
│ │  OG Description                         ││
│ │  jivo.in                                ││
│ └─────────────────────────────────────────┘│
└────────────────────────────────────────────┘
```
- If OG Title empty → fallback to Meta Title
- If OG Description empty → fallback to Meta Description
- If OG Image empty → show gray placeholder with `ImageIcon` icon
- Domain extracted from `canonicalUrl` or default `jivo.in`

### How it receives live data
- `SeoTabPanel` passes current `form` state + `keywordsInput` directly as props to `<SeoPreview>`
- No additional state — previews update on every keystroke automatically

---

## Task 4 — Replace localhost with production

### Audit finding
`SITE_URL` in `src/lib/constants.ts` is already:
```ts
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://jivo.in';
```
**No hardcoded `http://localhost:3000` found** in SEO-related files. All canonical URLs and structured data use `SITE_URL`.

### Action needed
- Scan all SEO defaults files (`src/modules/*/data/defaults.ts`) for any literal `localhost` strings
- If found, replace with `SITE_URL` import
- No changes expected based on current code audit

---

## Task 5 — Improve Default SEO

### File to modify
- `src/modules/seo/data/defaults.ts`

### Current `siteDefaultSeo.structuredData` is thin:
```json
{ "@type": "Organization", "name": "Jivo Wellness", "url": "https://jivo.in" }
```

### Upgrade to dual WebSite + Organization schema:
```json
[
  {
    "@type": "WebSite",
    "name": "Jivo Wellness",
    "url": "https://jivo.in",
    "potentialAction": { ... SearchAction ... }
  },
  {
    "@type": "Organization",
    "name": "Jivo Wellness",
    "url": "https://jivo.in",
    "logo": "https://jivo.in/logo.png",
    "sameAs": [...]
  }
]
```

### For future pages — convention comment
Add a JSDoc comment to `definePageSeo` explaining the robots safety rules:
- Public pages (home, products, about) → `index,follow`
- Auth/utility (login, register) → `noindex,nofollow`
- Commerce (cart, checkout) → `noindex,follow`
- Admin routes → `noindex,nofollow` (enforced by Next.js robots.txt)

---

## Task 6 — JSON-LD @context Fix

### Problem
`getStructuredData()` returns raw objects without `"@context": "https://schema.org"`.  
All `structuredData` values in defaults are also missing `@context`.

### Fix location: `src/modules/seo/utils.ts`
Modify `getStructuredData()` to wrap the result:
```ts
const raw = dbSeo?.structuredData ?? moduleDefault?.structuredData ?? siteDefaultSeo.structuredData;
if (!raw) return null;
// Ensure @context is always present
if (Array.isArray(raw)) {
  return raw.map(item => ({ '@context': 'https://schema.org', ...item }));
}
return { '@context': 'https://schema.org', ...raw };
```

### Fix defaults too
Add `'@context': 'https://schema.org'` to:
- `siteDefaultSeo.structuredData` in `src/modules/seo/data/defaults.ts`
- `structuredData` in `src/modules/home/data/defaults.ts`
- Any other module defaults with structuredData

---

## Task 7 — Helper Text (UX Polish)

### File to modify
- `src/modules/seo/components/SeoTabPanel.tsx`

### Helper text per field
| Field | Helper text |
|-------|-------------|
| Meta Title | "Shown as the blue link in Google search results. Keep under 70 characters." |
| Meta Description | "The snippet shown below the link in Google results. Keep under 180 characters." |
| Keywords | "Comma-separated words that describe the page. Google uses these as hints, not ranking signals." |
| Canonical URL | "The official URL for this page. Prevents duplicate content issues." |
| Robots | "Controls whether Google indexes this page and follows its links." |
| OG Title | "Title shown when someone shares this page on WhatsApp, Facebook, or Twitter. Falls back to Meta Title." |
| OG Description | "Description shown in the social sharing card. Falls back to Meta Description." |
| OG Image | "Image shown when sharing on WhatsApp or social media. Use 1200×630 px for best results." |
| Twitter Card | "Controls the card size on Twitter/X. Large image is recommended." |
| JSON-LD | "Structured data that helps Google understand your page (FAQ, Product, Article, etc.). Must be valid JSON." |

### Implementation
- Add `<p className="text-xs text-muted-foreground">` below each field's `Input`/`Textarea`/`Select`
- Small gray helper text, consistent with existing design language

---

## Task 8 — Robots Safety Defaults

### Current state
All DB entries and module defaults use `index,follow` unless explicitly set otherwise.  
Admin pages have no robots directive enforced at the meta level.

### Fix: Middleware-level enforcement (recommended approach)
This is the cleanest approach — add robots to the `generateMetadata` or the layout for protected routes.

### Files to modify
- `src/app/admin/layout.tsx` (if it exists) — add `export const metadata = { robots: { index: false, follow: false } }`
- OR: check if there's an admin layout and add robots there

### Page-level safety defaults to enforce:
| Route | Robots |
|-------|--------|
| `/admin/*` | `noindex,nofollow` |
| `/login`, `/register` | `noindex,nofollow` |
| `/cart`, `/checkout` | `noindex,follow` |

### Implementation approach
- Find admin layout file: `src/app/admin/layout.tsx`
- Find auth layout: `src/app/(auth)/layout.tsx` or similar
- Add `export const metadata: Metadata = { robots: { index: false, follow: false } }` to admin layout
- For cart/checkout, add separately in their layout files

---

## Implementation Order

1. **Task 6** — JSON-LD @context fix in `utils.ts` and defaults (foundational, affects all pages)
2. **Task 5** — Improve `siteDefaultSeo` structuredData (better defaults for all fallbacks)
3. **Task 4** — Verify no localhost strings (quick audit, likely no changes)
4. **Task 8** — Robots safety defaults in admin/auth/cart layouts
5. **Task 7** — Helper text in `SeoTabPanel.tsx` (UX polish, straightforward)
6. **Task 2** — Copy buttons in `SeoTabPanel.tsx` (UX, self-contained)
7. **Task 3** — Live preview component `SeoPreview.tsx` + integration in `SeoTabPanel.tsx`
8. **Task 1** — SEO guide (requires `react-markdown` install, biggest deliverable last)

---

## Files Summary

### New files
| File | Task |
|------|------|
| `src/modules/seo/docs/seo-guide.md` | T1 |
| `src/modules/seo/components/SeoGuide.tsx` | T1 |
| `src/modules/seo/components/SeoPreview.tsx` | T3 |

### Modified files
| File | Tasks |
|------|-------|
| `src/modules/seo/utils.ts` | T6 |
| `src/modules/seo/data/defaults.ts` | T5, T6 |
| `src/modules/seo/components/SeoTabPanel.tsx` | T2, T3, T7 |
| `src/app/admin/(dashboard)/seo/page.tsx` | T1 |
| `src/modules/home/data/defaults.ts` | T5, T6 |
| `src/app/admin/layout.tsx` (or equivalent) | T8 |
| Auth/cart layout files | T8 |
| `src/modules/seo/components/index.ts` | T1, T3 (add exports) |

### Installation
```bash
npm install react-markdown
```

---

## Constraints
- No API changes, no DB schema changes
- No new DB models
- Reuse existing `sonner`, `lucide-react`, existing UI components
- Keep `resolveSeo()` signature unchanged
- `SeoTabPanel` stays self-contained; `SeoPreview` is a pure display component
