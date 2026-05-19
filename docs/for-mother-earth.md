# For Mother Earth Page

Public route:

```txt
/our-essence/for-mother-earth
```

Admin route:

```txt
/admin/our-essence-for-mother-earth
```

## Workflow

The page is CMS-first and server-rendered. Public rendering reads section rows from
`OurEssenceForMotherEarth`; if CMS rows or images are missing, typed fallback content
and `placeholder.png` keep the cinematic layout intact.

Sections:

```txt
hero
cleanTree
disaster
```

## Database

Prisma model:

```txt
OurEssenceForMotherEarth
```

Each section is one row. Section content is stored in the `content` JSON field.

## Public API

GET:

```txt
/api/our-essence/for-mother-earth
```

Response:

```json
{
  "success": true,
  "data": {
    "hero": {
      "title": "THINGS WE DO FOR THE PLANET - FOR MOTHER EARTH",
      "quote": "“Air is the Guru, Water is the Father, and Earth is the Great Mother of all.”",
      "quoteAuthor": "Guru Nanak Dev Ji",
      "description": "...",
      "image": ""
    },
    "cleanTree": {
      "image": "",
      "cleanTitle": "Most Cleanest Village of Himachal Pradesh",
      "cleanDescription": "...",
      "treeTitle": "Tree Plantation in Rural Villages",
      "treeDescription": "..."
    },
    "disaster": {
      "title": "When Disaster Strikes",
      "description": "...",
      "image": ""
    }
  }
}
```

## Admin API

GET:

```txt
/api/admin/our-essence/for-mother-earth
```

POST:

```txt
/api/admin/our-essence/for-mother-earth
```

Body:

```json
{
  "section": "hero",
  "content": {
    "title": "THINGS WE DO FOR THE PLANET - FOR MOTHER EARTH",
    "quote": "“Air is the Guru, Water is the Father, and Earth is the Great Mother of all.”",
    "quoteAuthor": "Guru Nanak Dev Ji",
    "description": "The Kalgidhar Society has always taken the initiative...",
    "image": "uploaded-image.webp"
  }
}
```

Valid `section` values:

```txt
hero
cleanTree
disaster
```

## CMS Structure

Hero tab:

```txt
title
quote
quoteAuthor
description
image
```

Clean Village + Tree tab:

```txt
image
cleanTitle
cleanDescription
treeTitle
treeDescription
```

Disaster Support tab:

```txt
title
description
image
```

SEO tab uses the shared SEO Manager via:

```txt
our-essence-for-mother-earth
```

## SEO Flow

Default SEO lives in:

```txt
src/modules/our-essence/for-mother-earth/data/defaults.ts
```

The public route calls:

```txt
resolveSeo(FOR_MOTHER_EARTH_SEO_PAGE, defaultSeo)
getStructuredData(FOR_MOTHER_EARTH_SEO_PAGE, defaultSeo)
```

The route is included in:

```txt
src/app/sitemap.ts
```

## Image Handling

Admin uploads store filenames. Public sections use `SafeImage`.

Expected fallback behavior:

```ts
image ? `/api/uploads/${image}` : 'placeholder.png';
```

`SafeImage` resolves stored filenames through `/api/uploads/` and falls back to the
project placeholder if the upload is missing.

## Postman Examples

Public read:

```txt
GET http://localhost:3000/api/our-essence/for-mother-earth
```

Admin read:

```txt
GET http://localhost:3000/api/admin/our-essence/for-mother-earth
```

Admin save hero:

```txt
POST http://localhost:3000/api/admin/our-essence/for-mother-earth
Content-Type: application/json
```

```json
{
  "section": "hero",
  "content": {
    "title": "THINGS WE DO FOR THE PLANET - FOR MOTHER EARTH",
    "quote": "“Air is the Guru, Water is the Father, and Earth is the Great Mother of all.”",
    "quoteAuthor": "Guru Nanak Dev Ji",
    "description": "The Kalgidhar Society has always taken the initiative to keep the environment clean and green and the large solar energy plants are proof of this. Multiple initiatives taken by the Society, such as Solar energy plants, waste management and plantation drives speak volumes about the commitment of the organization towards the environment and saving Mother Earth.",
    "image": ""
  }
}
```
