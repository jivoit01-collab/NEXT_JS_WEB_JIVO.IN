# Social Initiatives Page

## Overview

Public route:

`/our-essence/social-initiatives`

Admin route:

`/admin/our-essence-social-initiatives`

This page is a CMS-powered Our Essence module. It uses a page-named Prisma model:

`OurEssenceSocialInitiatives`

Schema file:

`prisma/schema/our-essence-social-initiatives.prisma`

## Workflow

1. Admin opens the Social Initiatives CMS page.
2. Admin edits section content and uploads images through the existing upload system.
3. Each section is saved into `OurEssenceSocialInitiatives.content` as JSON.
4. Public rendering reads active sections from the database.
5. Missing database content falls back to typed default section data.
6. SEO metadata resolves through the existing `SeoMeta` system.

## CMS Sections

Hero:

```json
{
  "title": "SOCIAL INITIATIVES",
  "subtitle": "Empowering communities through wellness, education, and human-centered service.",
  "image": "uploaded-hero.webp",
  "alignmentTitle": "ALIGNMENT & INCENTIVES",
  "alignmentDescription": "The primary incentive is the shared mission toward wellness, service, and human upliftment.",
  "goalTitle": "GOAL",
  "goalDescription": "To build sustainable community systems where every individual can grow through education, support, wellness, and empowerment."
}
```

Responsibilities:

```json
{
  "backgroundImage": "uploaded-responsibilities.webp",
  "leftTitle": "RESPONSIBILITIES",
  "leftDescription": "The organization remains committed to serving humanity through wellness initiatives, education support, and sustainable community development.",
  "rightTitle": "POLICY",
  "rightDescription": "Policies are designed to encourage action, responsibility, and long-term social growth while keeping the mission centered on humanity."
}
```

Educate Empower:

```json
{
  "heading": "EDUCATE. ENSHRINE. EMPOWER.",
  "paragraph": "We are committed to creating sustainable transformation through education, wellness support, and community-led initiatives.",
  "image": "uploaded-human.webp"
}
```

## Image Handling

Image fields store only the uploaded filename.

Frontend behavior:

```ts
image ? `/api/uploads/${image}` : '/placeholder.png';
```

The project uses `SafeImage`, which resolves bare filenames through `/api/uploads/{filename}` and falls back safely.

## API Docs

Public GET:

`GET /api/our-essence/social-initiatives`

Admin GET:

`GET /api/admin/our-essence/social-initiatives`

Admin POST:

`POST /api/admin/our-essence/social-initiatives`

Body:

```json
{
  "section": "hero",
  "content": {
    "title": "SOCIAL INITIATIVES",
    "subtitle": "Empowering communities through wellness, education, and human-centered service.",
    "image": "uploaded-hero.webp",
    "alignmentTitle": "ALIGNMENT & INCENTIVES",
    "alignmentDescription": "The primary incentive is the shared mission toward wellness, service, and human upliftment.",
    "goalTitle": "GOAL",
    "goalDescription": "To build sustainable community systems where every individual can grow through education, support, wellness, and empowerment."
  }
}
```

## SEO Flow

SEO key:

`our-essence-social-initiatives`

Default title:

`Social Initiatives | Jivo Wellness`

Resolution order:

1. `SeoMeta` database row
2. Social Initiatives module `defaultSeo`
3. Site default SEO

## Postman Examples

Public:

```http
GET {{baseUrl}}/api/our-essence/social-initiatives
```

Admin:

```http
GET {{baseUrl}}/api/admin/our-essence/social-initiatives
Cookie: next-auth.session-token={{session}}
```

Save section:

```http
POST {{baseUrl}}/api/admin/our-essence/social-initiatives
Content-Type: application/json
Cookie: next-auth.session-token={{session}}

{
  "section": "hero",
  "content": {
    "title": "SOCIAL INITIATIVES",
    "subtitle": "Empowering communities through wellness, education, and human-centered service.",
    "image": "",
    "alignmentTitle": "ALIGNMENT & INCENTIVES",
    "alignmentDescription": "The primary incentive is the shared mission toward wellness, service, and human upliftment.",
    "goalTitle": "GOAL",
    "goalDescription": "To build sustainable community systems where every individual can grow through education, support, wellness, and empowerment."
  }
}
```
