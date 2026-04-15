# Implementation Plan — Why Jivo: Icons → Images + Admin UI Overhaul

> **Status:** Plan only. Do not start building until explicitly asked.
> **Trigger:** User screenshots of `localhost:3000` (Why Jivo pillars) and `localhost:3000/admin/home` dialog showing Pillar #1, #2, #3… stacked in a long vertical scroll with an `Icon` `<select>` dropdown.

---

## Goal (what the user asked for)

1. **Replace the lucide icon picker with an image upload** in the "Why Jivo" section's **Value Pillars** (and anywhere else icons are currently admin-selectable from a fixed list), so the admin can upload any custom image/logo per pillar.
2. **Stop the long vertical scroll** of pillar cards in the admin edit dialog. Instead, put each pillar (its image, title, description) inside a **tab** — admin clicks `Pillar 1 / Pillar 2 / …` and edits one at a time. Easier to scan, no scroll hell.
3. **Generally tighten the admin dashboard UI** for this editor so it's user-friendly: clear section grouping, visible "add pillar" / "remove pillar" affordances, sensible empty state, tab labels that update as the admin types the pillar title.

---

## Where icons currently live (audit)

Searched the `home` module and `admin/(dashboard)/home` page. Only **one** place uses a fixed icon list from lucide that the admin can pick from:

| File | What it does now |
|---|---|
| [src/modules/home/types/index.ts](src/modules/home/types/index.ts#L8-L12) | `ValuePillar { icon: string; title: string; description: string }` — `icon` is the lucide component name string |
| [src/modules/home/validations.ts:51-55](src/modules/home/validations.ts#L51-L55) | `z.object({ icon: z.string().min(1).max(50), ... })` |
| [src/modules/home/data/home-content.ts:95-131](src/modules/home/data/home-content.ts#L95-L131) | Defaults: `icon: 'Users' | 'Scale' | 'Heart' | 'HandHeart' | 'Lightbulb' | 'ShieldCheck'` |
| [src/modules/home/components/why-jivo.tsx:4-18](src/modules/home/components/why-jivo.tsx#L4-L18) | `iconMap` maps string → lucide component; renders `<Icon className="h-8 w-8" />` |
| [src/app/admin/(dashboard)/home/page.tsx:118](src/app/admin/(dashboard)/home/page.tsx#L118) | `getDefaultContent('why_jivo')` seeds `icon: 'Heart'` on new pillar |
| [src/app/admin/(dashboard)/home/page.tsx:950](src/app/admin/(dashboard)/home/page.tsx#L950) | `ICON_OPTIONS = ['Users', …]` + `<select>` dropdown inside `WhyJivoEditor` |

**No other section** in the home module uses admin-configurable lucide icons. `hero`, `categories`, `vision_mission`, `products_foundation` already use image URLs via `ImageUpload`. So the change is localized to the Why Jivo pillar.

---

## Data-model change

### `ValuePillar` — rename `icon` → `image`

```ts
// src/modules/home/types/index.ts
export interface ValuePillar {
  image: string;        // was: icon
  title: string;
  description: string;
}
```

### Zod schema — swap `icon` for `image`

```ts
// src/modules/home/validations.ts — whyJivoContentSchema
valuePillars: z.array(
  z.object({
    image: z.string().min(1, 'Pillar image is required'),  // was: icon
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
  }),
),
```

### Default seed data — replace lucide string with placeholder image path

```ts
// src/modules/home/data/home-content.ts
export const valuePillars: ValuePillar[] = [
  { image: '/images/placeholder.png', title: 'People',               description: '…' },
  { image: '/images/placeholder.png', title: 'Truth',                description: '…' },
  { image: '/images/placeholder.png', title: 'Devotion',             description: '…' },
  { image: '/images/placeholder.png', title: 'Sewa',                 description: '…' },
  { image: '/images/placeholder.png', title: 'Intelligence',         description: '…' },
  { image: '/images/placeholder.png', title: 'Integrity & Dedication', description: '…' },
];
```

Descriptions stay the same as they are today.

### Backward-compat with existing DB rows

Existing DB rows likely have `{ icon: 'Users', title, description }`. Decide one:

- **Option A (preferred, clean):** Migrate in a one-shot script OR lean on the fact that admin can re-upload once. Public component falls back to placeholder if `image` is missing.
- **Option B:** Keep `icon?: string` as optional legacy + new required `image`; render image if present, else fallback to the old lucide icon.

**Recommendation: Option A.** The site is pre-launch (from `prompt1.md`, this is a rebuild). Add a one-liner in `why-jivo.tsx`: `const src = pillar.image || '/images/placeholder.png'`. No migration needed.

---

## Public component change — `why-jivo.tsx`

Strip the `iconMap` + lucide imports. Render a plain `<img>` (or `next/image`) sized the same as the current 32×32 icon slot:

```tsx
// src/modules/home/components/why-jivo.tsx — inner loop only
<div className="mb-5 flex h-12 w-12 items-center justify-center">
  <img
    src={pillar.image || '/images/placeholder.png'}
    alt={pillar.title}
    className="h-10 w-10 object-contain"
    style={{ filter: 'brightness(0) saturate(100%) invert(72%) sepia(18%) saturate(500%) hue-rotate(10deg)' /* optional, to tint to #b8a472 */ }}
  />
</div>
```

- Remove lines 4 (`import { Users, Scale, ... } from 'lucide-react'`) and 11-18 (`iconMap`).
- Keep Framer Motion wrapper as-is.
- Decision: **don't** force a CSS filter tint by default — admin uploads their own colored art. If we ever want tinting, expose it as an optional flag on the pillar.
- Container bumped slightly (`h-12 w-12`) so small logo images don't look lost in a 40×40 box. Final value — verify visually against the screenshot's current sizing.

---

## Admin UI change — tabs instead of scroll, image upload instead of select

### File: [src/app/admin/(dashboard)/home/page.tsx](src/app/admin/(dashboard)/home/page.tsx)

### 1. `getDefaultContent('why_jivo')` — swap seed

```ts
case 'why_jivo':
  return {
    heading: '',
    subheading: '',
    leftText: '',
    rightParagraphs: [''],
    valuePillars: [{ image: '', title: '', description: '' }], // was: icon: 'Heart'
  };
```

### 2. `WhyJivoEditor` rewrite — the main UI change

Replace the current vertical `valuePillars.map(...)` stack (lines ~1020-1102) with a tabbed editor:

```
┌────────────────────────────────────────────────────────┐
│  Value Pillars  (6 recommended)          [+ Add pillar]│
├────────────────────────────────────────────────────────┤
│ [People] [Truth] [Devotion] [Sewa] [Intelligence] [Integrity] [+] │   ← tabs row (horizontal, overflow-x-auto)
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────┐   Title                              │
│  │   [Upload    │   [People___________________]        │
│  │    image]    │                                      │
│  │              │   Description                        │
│  │   (preview)  │   [The organization is built…     ]  │
│  └──────────────┘                                      │
│                                                        │
│                                    [🗑 Delete pillar]  │
└────────────────────────────────────────────────────────┘
```

Uses the existing `Tabs / TabsList / TabsTrigger / TabsContent` primitives (already imported — see line 23-27).

Internal state: add `const [activePillarIdx, setActivePillarIdx] = useState(0);` inside `WhyJivoEditor`.

Tab triggers:
- Label: `pillar.title || \`Pillar ${index + 1}\`` — **labels live-update** as admin types the title in the form below. This is why we keep `activePillarIdx` rather than using the tab's own value-as-key.
- Show a small colored dot on tabs where `!pillar.image` or `!pillar.title` (incomplete indicator).
- Trailing `[+]` button inside the `TabsList` to append a new pillar and auto-activate it.

Tab panel body (for the active pillar):
```tsx
<div className="grid gap-6 md:grid-cols-[auto,1fr]">
  <div className="space-y-2">
    <Label className="text-xs">Pillar image / logo</Label>
    <div className="w-40">
      <ImageUpload
        value={pillar.image}
        onChange={(url) => updatePillar(activePillarIdx, 'image', url)}
        onRemove={() => updatePillar(activePillarIdx, 'image', '')}
      />
    </div>
    <p className="text-[11px] text-muted-foreground">
      Square SVG/PNG works best (≥ 128×128).
    </p>
  </div>
  <div className="space-y-4">
    <div className="space-y-2">
      <Label className="text-xs">Title</Label>
      <Input value={pillar.title} onChange={...} placeholder="People" />
    </div>
    <div className="space-y-2">
      <Label className="text-xs">Description</Label>
      <Textarea value={pillar.description} onChange={...} rows={4} />
    </div>
    <div className="flex justify-end">
      <Button variant="ghost" size="sm" onClick={() => removePillar(activePillarIdx)}
        className="text-destructive hover:bg-destructive/10 gap-1.5">
        <Trash2 className="h-3.5 w-3.5" /> Remove pillar
      </Button>
    </div>
  </div>
</div>
```

### 3. Helper functions inside `WhyJivoEditor`

```ts
const updatePillar = (idx: number, key: 'image' | 'title' | 'description', value: string) =>
  set('valuePillars', valuePillars.map((p, i) => (i === idx ? { ...p, [key]: value } : p)));

const addPillar = () => {
  set('valuePillars', [...valuePillars, { image: '', title: '', description: '' }]);
  setActivePillarIdx(valuePillars.length); // jump to the new one
};

const removePillar = (idx: number) => {
  const next = valuePillars.filter((_, i) => i !== idx);
  set('valuePillars', next);
  setActivePillarIdx(Math.max(0, Math.min(idx, next.length - 1)));
};
```

### 4. Delete the old `ICON_OPTIONS` constant + the `<select>` block. Delete the old `.map()` that rendered stacked pillar cards.

### 5. Empty state

If `valuePillars.length === 0`, show:
```
No pillars yet. Add your first one to get started.  [+ Add pillar]
```

### 6. Other polish in the same dialog (small wins while we're here)

- Keep the existing top meta row (Sort order + Visibility) untouched.
- Add a small `<p className="text-xs text-muted-foreground">` hint under the "Value Pillars" heading: *"Click a tab to edit that pillar. Upload any PNG / SVG — not limited to preset icons anymore."*
- Right-column paragraphs section **stays vertical** (they're paragraphs, not parallel items — tabs would be overkill).

---

## File-by-file change checklist

| # | File | Change |
|---|---|---|
| 1 | [src/modules/home/types/index.ts](src/modules/home/types/index.ts) | `ValuePillar.icon` → `ValuePillar.image` |
| 2 | [src/modules/home/validations.ts](src/modules/home/validations.ts) | Pillar zod schema: `icon` → `image` |
| 3 | [src/modules/home/data/home-content.ts](src/modules/home/data/home-content.ts) | Seed `valuePillars[*].icon` → `image: '/images/placeholder.png'` |
| 4 | [src/modules/home/components/why-jivo.tsx](src/modules/home/components/why-jivo.tsx) | Remove lucide iconMap, render `<img src={pillar.image}/>` |
| 5 | [src/app/admin/(dashboard)/home/page.tsx](src/app/admin/(dashboard)/home/page.tsx) | `getDefaultContent('why_jivo')` seed; rewrite `WhyJivoEditor` (tabs + ImageUpload) |

No DB schema change (`content` is `Json` in `PageContent`). No API route change. No new dependencies.

---

## Verification steps (after build)

1. `npm run build` — TS must compile; the type rename will surface any stragglers.
2. Manual test on `/admin/home`:
   - Open the existing Why Jivo section → confirm tabs render, images upload, title live-updates tab label.
   - Add a 7th pillar, reorder by deleting the 3rd, save.
   - Reload `/` and confirm images render in the green Why Jivo band.
3. Seed/placeholder behaviour: delete the `why_jivo` DB row → public page falls back to defaults (placeholder image, text intact).
4. Existing DB rows (if any) with the old `icon` field: public page shows placeholder instead of a broken icon. Admin re-uploads once.

---

## Out of scope (explicit)

- No changes to hero / categories / vision_mission / products_foundation editors — they already use `ImageUpload`.
- No admin-side icon library / media picker — just the existing `ImageUpload` (UploadThing) component.
- No migration script for old DB content; fall back handles it.
- No redesign of the overall dashboard layout / sidebar. Only the Why Jivo editor dialog.
