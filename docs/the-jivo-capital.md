# The Jivo Capital

## Page Overview

| Item | Value |
| --- | --- |
| Public route | `/our-essence/the-jivo-capital` |
| Admin route | `/admin/our-essence-the-jivo-capital` |
| SEO page key | `our-essence-the-jivo-capital` |
| Public API | `/api/our-essence/the-jivo-capital` |
| Admin API | `/api/admin/our-essence/the-jivo-capital` |
| Prisma model | `OurEssenceTheJivoCapital` |
| Module | `src/modules/our-essence/the-jivo-capital/` |

The page is a CMS-managed Our Essence page with five image-led sections based on the supplied screenshots:

- Hero: aerial factory/field story
- Oil plant: 100 BPM rotary net weight oil packaging line
- Water plant: 300 BPM natural mineral water combi plant
- Farm-to-Bottle: integrated grass production from farm to sealed bottle
- Fresh-Lock: patented wheatgrass stabilization technology over one full background image

## UI Structure

The public page renders five full-bleed sections:

- `TheJivoCapitalHero`: above-the-fold section with priority image, title, and mission paragraph.
- `PlantSection` for `oilPlant`: left/bottom text alignment matching the oil bottling screenshot.
- `PlantSection` for `waterPlant`: right/top text alignment matching the water plant screenshot.
- `FarmToBottleSection`: top-left editorial copy over a cinematic farm/facility background.
- `FreshLockSection`: left copy over one CMS-managed full background image.

Images are CMS-editable. If no image has been uploaded, the shared `SafeImage` placeholder is used.

## API Documentation

### Public API

`GET /api/our-essence/the-jivo-capital`

Returns merged defaults plus active CMS rows.

```json
{
  "success": true,
  "data": {
    "hero": {
      "title": "THE JIVO CAPITAL",
      "description": "Our products and services reflect our mission...",
      "image": ""
    },
    "oilPlant": {
      "title": "The 100 BPM Rotary Net Weight Oil Plant",
      "description": "This is a high-performance...",
      "image": "",
      "align": "left"
    },
    "waterPlant": {
      "title": "India's First 300 BPM Combi Plant for Natural Mineral Water",
      "description": "Engineered for purity and performance...",
      "image": "",
      "align": "right"
    },
    "farmToBottle": {
      "title": "World’s First: The \"Farm-to-Bottle\" Facility",
      "description": "We are the world's first and only facility...",
      "image": ""
    },
    "freshLock": {
      "title": "Our Patented \"Fresh-Lock\" Technology",
      "description": "The challenge with wheatgrass is that its most potent nutrients...",
      "backgroundImage": ""
    }
  }
}
```

### Admin API

`GET /api/admin/our-essence/the-jivo-capital`

Requires admin session. Returns merged data plus raw rows.

`POST /api/admin/our-essence/the-jivo-capital`

Requires admin session.

```json
{
  "section": "oilPlant",
  "content": {
    "title": "The 100 BPM Rotary Net Weight Oil Plant",
    "description": "Updated copy",
    "image": "uploaded-image.webp",
    "align": "left"
  }
}
```

Valid section values:

- `hero`
- `oilPlant`
- `waterPlant`
- `farmToBottle`
- `freshLock`

## Workflow

1. Admin opens `/admin/our-essence-the-jivo-capital`.
2. Admin edits one tab: Hero, Oil Plant, Water Plant, Farm-to-Bottle, Fresh-Lock, or SEO.
3. Section content is validated with Zod.
4. Server action upserts the row in `OurEssenceTheJivoCapital`.
5. The public page, admin page, SEO manager, and sitemap are revalidated.
6. Public visitors see updated content at `/our-essence/the-jivo-capital`.

## Data Structure

### Prisma

Defined in `prisma/schema/our-essence-the-jivo-capital.prisma`.

```prisma
model OurEssenceTheJivoCapital {
  id        String   @id @default(cuid())
  section   String   @unique
  title     String?
  content   Json
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([sortOrder])
}
```

## Image Handling

Images are stored as CMS upload values and rendered through `SafeImage`.

- Empty image fields fall back to `placeholder.png`.
- Bare filenames resolve through `/api/uploads/[filename]`.
- External HTTPS images are passed through if allowed by `next.config.ts`.
- Hero image uses `priority`, `quality={90}`, and a blur placeholder.
- Below-fold images use lazy loading through `next/image` defaults and route-level code splitting.

Recommended upload dimensions:

- Hero: at least `1920x1080`
- Plant sections: at least `1920x900`
- Farm-to-Bottle background: at least `1920x1080`
- Fresh-Lock background: at least `1920x1080`
- Use WebP or optimized JPEG where possible

## SEO Documentation

SEO defaults live in:

`src/modules/our-essence/the-jivo-capital/data/defaults.ts`

SEO key:

`our-essence-the-jivo-capital`

The public route uses:

```ts
resolveSeo(THE_JIVO_CAPITAL_SEO_PAGE, defaultSeo)
```

The admin SEO tab uses:

```tsx
<SeoTabPanel page={THE_JIVO_CAPITAL_SEO_PAGE} />
```

The page is indexed and included in `src/app/sitemap.ts`.

## Postman Testing

### Get public page data

```http
GET http://localhost:3000/api/our-essence/the-jivo-capital
```

### Get admin page data

```http
GET http://localhost:3000/api/admin/our-essence/the-jivo-capital
```

Requires an authenticated admin session cookie.

### Update a section

```http
POST http://localhost:3000/api/admin/our-essence/the-jivo-capital
Content-Type: application/json
```

```json
{
  "section": "freshLock",
  "content": {
    "title": "Our Patented \"Fresh-Lock\" Technology",
    "description": "Updated Fresh-Lock technology description.",
    "backgroundImage": "fresh-lock-bg.webp"
  }
}
```

### Update SEO

```http
POST http://localhost:3000/api/admin/seo/our-essence-the-jivo-capital
Content-Type: application/json
```

```json
{
  "metaTitle": "The Jivo Capital | Our Essence | Jivo Wellness",
  "metaDescription": "Explore Jivo Wellness manufacturing excellence.",
  "keywords": ["the jivo capital", "jivo manufacturing"],
  "ogTitle": "The Jivo Capital | Jivo Wellness",
  "ogDescription": "A cinematic look at Jivo's plant and production capabilities.",
  "ogImage": "og-default.png",
  "twitterCard": "summary_large_image",
  "canonicalUrl": "https://jivo.in/our-essence/the-jivo-capital",
  "robots": "index,follow"
}
```

## Update Log

- Added public page route `/our-essence/the-jivo-capital`.
- Added admin page route `/admin/our-essence-the-jivo-capital`.
- Added public and admin API routes.
- Added Prisma model `OurEssenceTheJivoCapital`.
- Added default SEO and sitemap entry.
- Added safe seed defaults.
- Added Farm-to-Bottle and Fresh-Lock CMS sections to the Jivo Capital page.
