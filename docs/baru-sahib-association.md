# Baru Sahib Association Page

Public route:

`/our-essence/baru-sahib-association`

Admin route:

`/admin/our-essence-baru-sahib-association`

This page is an Our Essence CMS page backed by `PageContent` rows where:

```json
{
  "page": "baru-sahib-association",
  "sections": ["hero", "video", "humanity"]
}
```

The Navbar and Footer are inherited from the public layout. This module only owns page content sections.

## Workflow

1. Admin opens `/admin/our-essence-baru-sahib-association`.
2. Admin edits `Hero`, `Video Section`, `Humanity Section`, or `SEO`.
3. Images and videos are uploaded through the existing `/api/upload` CMS upload endpoint.
4. Content is saved to `PageContent`.
5. SEO is saved to `SeoMeta` through the existing SEO tab and `/api/admin/seo/[page]`.
6. Public page reads `PageContent`, falls back to module defaults, and uses the existing placeholder image when no upload exists.

## Database

Model:

```prisma
model PageContent {
  id        String   @id @default(cuid())
  page      String
  section   String
  title     String?
  content   Json
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([page, section])
  @@index([page, sortOrder])
}
```

Rows used by this page:

| page                     | section    | sortOrder |
| ------------------------ | ---------- | --------: |
| `baru-sahib-association` | `hero`     |         0 |
| `baru-sahib-association` | `video`    |         1 |
| `baru-sahib-association` | `humanity` |         2 |

## CMS JSON

Hero:

```json
{
  "title": "BARU SAHIB ASSOCIATION",
  "description": "Just as a tiny banyan seed grows into a huge tree, this place will develop into a great centre of spiritual and high quality scientific education.",
  "image": "uploaded-hero.webp"
}
```

Video Section:

```json
{
  "video": "uploaded-video.mp4"
}
```

Humanity Section:

```json
{
  "title": "BRINGING GRACE TO HUMAN RACE",
  "description": "Baru Sahib has been working tirelessly towards transforming the lives of rural children...",
  "image": "uploaded-humanity.webp"
}
```

## Image And Video Handling

Image fields store only the uploaded filename, for example:

`1777000000000-baru-sahib.webp`

Rendering uses the existing `SafeImage` fallback path:

```tsx
<SafeImage src={image || 'placeholder.png'} />
```

`SafeImage` resolves uploaded filenames to:

`/api/uploads/{filename}`

If no upload exists, it resolves `placeholder.png` to:

`/api/uploads/placeholder.png`

Videos are uploaded through the same admin-protected `/api/upload` endpoint. Video files are stored as filenames and served through:

`/api/uploads/{filename}`

Supported video types:

- `video/mp4`
- `video/webm`
- `video/ogg`

The public video component uses:

- `preload="metadata"`
- `muted`
- `playsInline`
- IntersectionObserver autoplay only when visible
- automatic pause outside the viewport

## Public API

GET:

`/api/baru-sahib-association`

Response:

```json
{
  "success": true,
  "data": {
    "hero": {
      "title": "BARU SAHIB ASSOCIATION",
      "description": "...",
      "image": ""
    },
    "video": {
      "video": ""
    },
    "humanity": {
      "title": "BRINGING GRACE TO HUMAN RACE",
      "description": "...",
      "image": ""
    }
  }
}
```

Postman:

1. Method: `GET`
2. URL: `http://localhost:3000/api/baru-sahib-association`
3. No auth required.

## Admin API

GET:

`/api/admin/baru-sahib-association`

Returns all CMS section data. Requires admin session.

POST:

`/api/admin/baru-sahib-association`

Body:

```json
{
  "section": "hero",
  "content": {
    "title": "BARU SAHIB ASSOCIATION",
    "description": "Updated copy",
    "image": "uploaded-hero.webp"
  }
}
```

Allowed `section` values:

- `hero`
- `video`
- `humanity`

Postman:

1. Log in as admin in the browser.
2. Copy the session cookies into Postman.
3. Method: `POST`
4. URL: `http://localhost:3000/api/admin/baru-sahib-association`
5. Header: `Content-Type: application/json`
6. Send one section at a time.

## SEO

SEO page key:

`our-essence-baru-sahib-association`

Default SEO:

```json
{
  "metaTitle": "Baru Sahib Association | Jivo Wellness",
  "metaDescription": "Explore the spiritual journey, humanitarian mission, and wellness philosophy behind Baru Sahib Association.",
  "canonicalUrl": "https://jivo.in/our-essence/baru-sahib-association",
  "robots": "index,follow"
}
```

Admin SEO editor:

`/admin/our-essence-baru-sahib-association?tab=seo`

Shared SEO API:

`/api/admin/seo/our-essence-baru-sahib-association`

The page route calls:

```ts
resolveSeo('our-essence-baru-sahib-association', defaultSeo);
```

## Files

Module:

`src/modules/our-essence/baru-sahib-association`

Public route:

`src/app/(public)/our-essence/baru-sahib-association`

Admin route:

`src/app/admin/(dashboard)/our-essence-baru-sahib-association`

APIs:

`src/app/api/baru-sahib-association/route.ts`

`src/app/api/admin/baru-sahib-association/route.ts`
