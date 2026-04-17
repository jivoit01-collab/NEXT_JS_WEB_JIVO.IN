# Our Essence — The Story

## 1. Page Overview

| Field | Value |
|-------|-------|
| Page | The Story (Our Essence) |
| Route | `/our-essence/the-story` |
| Admin | `/admin/our-essence-the-story` |
| SEO Key | `our-essence-the-story` |
| Prisma Model | `OurEssenceTheStory` |

### Sections

- `hero` — Full-bleed background image + "JIVO JOURNEY" heading + paragraph
- `founder` — Dark teal section: "FOR HUMANITY, WITH PURPOSE" + founder bio + portrait
- `vision` — Green section: "WHERE PURPOSE BECOMES WELLNESS" + two-column text

---

## 2. UI Structure

### Hero Section
- Full viewport height (~85vh)
- Background image: mustard field with Jivo canola oil bottle
- Dark gradient overlay (bottom to top) for text readability
- Large uppercase heading: "JIVO JOURNEY" (font-jost-bold, tracking-wide)
- Paragraph text describing Baba Iqbal Singh ji's vision
- `priority` on image for fast LCP

### Founder Section
- Dark teal background (`#1a6b5a`)
- Centered section heading: "FOR HUMANITY, WITH PURPOSE"
- Two-column grid (stacks on mobile):
  - Left: "WELLNESS ROOTED IN SEVA" subheading + long paragraph
  - Right: Portrait photo of Baba Iqbal Singh ji (rounded corners)

### Vision Section
- Lighter green background (`#6aaa5e`)
- Centered heading: "WHERE PURPOSE BECOMES WELLNESS"
- Centered subheading: "VISION OF SEVA & GROWTH"
- Two-column text grid (stacks on mobile):
  - Left: Kirat karmai principle paragraph
  - Right: Jivo's purpose paragraph

---

## 3. API Documentation

### Public API

```
GET /api/our-essence/the-story
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hero": {
      "heading": "JIVO JOURNEY",
      "paragraph": "Inspired by Baba Iqbal Singh ji's vision...",
      "backgroundImage": "1713456789-hero.png"
    },
    "founder": {
      "sectionHeading": "FOR HUMANITY, WITH PURPOSE",
      "title": "WELLNESS ROOTED IN SEVA",
      "paragraph": "Our founding father...",
      "founderImage": "1713456789-founder.png"
    },
    "vision": {
      "sectionHeading": "WHERE PURPOSE BECOMES WELLNESS",
      "title": "VISION OF SEVA & GROWTH",
      "leftColumn": "He envisioned that...",
      "rightColumn": "Jivo was started to..."
    }
  }
}
```

### Admin API

```
GET /api/admin/our-essence/the-story
```

Returns all sections (including inactive). Requires admin session cookie.

```
POST /api/admin/our-essence/the-story
```

**Request body:**
```json
{
  "section": "hero",
  "content": {
    "heading": "JIVO JOURNEY",
    "paragraph": "Updated paragraph text...",
    "backgroundImage": "1713456789-new-hero.png"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxyz...",
    "section": "hero",
    "title": null,
    "content": { ... },
    "sortOrder": 0,
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### SEO API

```
GET /api/admin/seo/our-essence-the-story
PUT /api/admin/seo/our-essence-the-story
```

Uses the shared SEO module endpoints.

---

## 4. Workflow

```
Admin opens /admin/our-essence-the-story
  → Tabs: Hero | Founder | Vision | SEO
  → Edits text/images in any tab
  → Clicks "Save Changes"
  → Server action upsertTheStorySectionAction() called
  → Validates content with Zod schema
  → Upserts row in OurEssenceTheStory table
  → revalidatePath('/our-essence/the-story')
  → User sees updated content on public page
```

---

## 5. Data Structure

### hero
| Field | Type | Description |
|-------|------|-------------|
| heading | string | "JIVO JOURNEY" |
| paragraph | string | Vision description text |
| backgroundImage | string | Filename (served via /api/uploads/) |

### founder
| Field | Type | Description |
|-------|------|-------------|
| sectionHeading | string | "FOR HUMANITY, WITH PURPOSE" |
| title | string | "WELLNESS ROOTED IN SEVA" |
| paragraph | string | Founder biography text |
| founderImage | string | Filename (served via /api/uploads/) |

### vision
| Field | Type | Description |
|-------|------|-------------|
| sectionHeading | string | "WHERE PURPOSE BECOMES WELLNESS" |
| title | string | "VISION OF SEVA & GROWTH" |
| leftColumn | string | Kirat karmai principle text |
| rightColumn | string | Jivo's purpose text |

---

## 6. Image Handling

- All images stored in `/uploads/images/`
- Served via `/api/uploads/[filename]`
- Filenames use `${Date.now()}-${originalName}` format
- DB stores filename only (not full path)
- `SafeImage` component handles fallback to placeholder
- Hero image uses `priority` for LCP optimization

---

## 7. SEO Documentation

| Field | Value |
|-------|-------|
| metaTitle | The Story of Jivo Wellness \| Inspired by Seva & Baba Iqbal Singh Ji |
| metaDescription | Discover the journey of Jivo Wellness — rooted in the vision of Baba Iqbal Singh Ji... |
| keywords | jivo wellness story, baba iqbal singh ji, jivo journey, seva wellness, kirat karmai |
| canonicalUrl | https://jivo.in/our-essence/the-story |
| robots | index,follow |
| structuredData | @type: AboutPage |

- Stored in `SeoMeta` table (page = "our-essence-the-story")
- Resolved via `resolveSeo('our-essence-the-story', defaultSeo)` in `generateMetadata()`
- Fallback chain: DB → module default → site default
- Admin edits SEO from the "SEO" tab in the admin page editor

---

## 8. Postman Testing

### 1. Get page data (public)
```
GET http://localhost:3000/api/our-essence/the-story
```

### 2. Login as admin (get session cookie)
```
POST http://localhost:3000/api/auth/callback/credentials
Body: { "email": "admin@jivo.in", "password": "admin123" }
```

### 3. Update hero section
```
POST http://localhost:3000/api/admin/our-essence/the-story
Headers: Cookie: next-auth.session-token=...
Body: {
  "section": "hero",
  "content": {
    "heading": "JIVO JOURNEY",
    "paragraph": "Updated text...",
    "backgroundImage": "new-hero.png"
  }
}
```

### 4. Update founder section
```
POST http://localhost:3000/api/admin/our-essence/the-story
Body: {
  "section": "founder",
  "content": {
    "sectionHeading": "FOR HUMANITY, WITH PURPOSE",
    "title": "WELLNESS ROOTED IN SEVA",
    "paragraph": "Updated bio...",
    "founderImage": "founder.png"
  }
}
```

### 5. Update vision section
```
POST http://localhost:3000/api/admin/our-essence/the-story
Body: {
  "section": "vision",
  "content": {
    "sectionHeading": "WHERE PURPOSE BECOMES WELLNESS",
    "title": "VISION OF SEVA & GROWTH",
    "leftColumn": "Updated left text...",
    "rightColumn": "Updated right text..."
  }
}
```

---

## 9. Update Log

```
[2026-04-17]
- Initial page creation
- Sections: hero, founder, vision
- Admin CMS with 4 tabs (Hero, Founder, Vision, SEO)
- Public + admin API routes
- SEO seeded with strong defaults
- Shared public layout created (Navbar + Footer)
```
