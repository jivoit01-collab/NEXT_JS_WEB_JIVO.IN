# Our Fair Share Page

Public route:

```txt
/our-essence/our-fair-share
```

Admin route:

```txt
/admin/our-essence-our-fair-share
```

## Workflow

The page is CMS-first and server-rendered. Public rendering reads section rows from
`OurEssenceOurFairShare`; if a row or image is missing, typed fallback content and
`placeholder.png` are used so the UI never breaks.

Sections:

```txt
hero
healthcare
women
```

## Database

Prisma model:

```txt
OurEssenceOurFairShare
```

All section content is stored in the model `content` JSON field.

## Public API

GET:

```txt
/api/our-essence/our-fair-share
```

Response:

```json
{
  "success": true,
  "data": {
    "hero": {
      "title": "Value Based Education : Vidya",
      "subtitle": "BLEND OF MODERN EDUCATION WITH SPIRITUAL VALUES",
      "description": "...",
      "image": ""
    },
    "healthcare": {
      "title": "Restoring Health and Happiness through Divinity & Loving Medical Care",
      "paragraph1": "...",
      "paragraph2": "...",
      "image": ""
    },
    "women": {
      "title": "WOMEN EMPOWERMENT",
      "subtitle": "EMPOWERING WOMEN FOR BUILDING NATION",
      "description": "...",
      "image": ""
    }
  }
}
```

## Admin API

GET:

```txt
/api/admin/our-essence/our-fair-share
```

POST:

```txt
/api/admin/our-essence/our-fair-share
```

Body:

```json
{
  "section": "hero",
  "content": {
    "title": "Value Based Education : Vidya",
    "subtitle": "BLEND OF MODERN EDUCATION WITH SPIRITUAL VALUES",
    "description": "We have an obligation...",
    "image": "uploaded-image.webp"
  }
}
```

Valid `section` values:

```txt
hero
healthcare
women
```

## CMS Structure

Hero tab:

```txt
title
subtitle
description
image
```

Healthcare tab:

```txt
title
paragraph1
paragraph2
image
```

Women Empowerment tab:

```txt
title
subtitle
description
image
```

SEO tab uses the shared SEO Manager via:

```txt
our-essence-our-fair-share
```

## SEO Flow

Default SEO is defined in:

```txt
src/modules/our-essence/our-fair-share/data/defaults.ts
```

The public route calls:

```txt
resolveSeo(OUR_FAIR_SHARE_SEO_PAGE, defaultSeo)
getStructuredData(OUR_FAIR_SHARE_SEO_PAGE, defaultSeo)
```

The page is included in:

```txt
src/app/sitemap.ts
```

## Image Handling

Admin uploads store filenames. Public images resolve through `SafeImage`.

Expected fallback behavior:

```ts
image ? `/api/uploads/${image}` : 'placeholder.png';
```

`SafeImage` handles this resolution and falls back to the project placeholder.

## Postman Examples

Public read:

```txt
GET http://localhost:3000/api/our-essence/our-fair-share
```

Admin read:

```txt
GET http://localhost:3000/api/admin/our-essence/our-fair-share
```

Admin save hero:

```txt
POST http://localhost:3000/api/admin/our-essence/our-fair-share
Content-Type: application/json
```

```json
{
  "section": "hero",
  "content": {
    "title": "Value Based Education : Vidya",
    "subtitle": "BLEND OF MODERN EDUCATION WITH SPIRITUAL VALUES",
    "description": "We have an obligation to be empathic, principled and considerate, even in our pursuit of material gratification. A compassionate mind and sustainable lifestyle is nurtured through knowledge and action that works in synchronicity with good human values",
    "image": ""
  }
}
```
