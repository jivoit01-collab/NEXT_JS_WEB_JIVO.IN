# Home Page Module

## Overview

Manages the content sections displayed on the Jivo Wellness home page. Each section is stored as a `PageContent` record with `pageSlug = "home"` and a unique `section` key. Content is stored as JSON, allowing flexible field structures per section type.

## Database Model

Uses the `PageContent` Prisma model:

| Field     | Type    | Description                          |
|-----------|---------|--------------------------------------|
| id        | String  | CUID primary key                     |
| pageSlug  | String  | Always `"home"` for this module      |
| section   | String  | Section key (hero, categories, etc.) |
| content   | Json    | Section-specific content data        |
| sortOrder | Int     | Display order on the page            |
| isActive  | Boolean | Whether section is visible           |
| updatedAt | DateTime| Last update timestamp                |

Unique constraint: `(pageSlug, section)` — one entry per section per page.

## Sections

| Section Key           | Description                                      |
|-----------------------|--------------------------------------------------|
| `hero`                | Hero banner with logo, background, headline, CTA |
| `categories`          | Product category cards with images               |
| `vision_mission`      | Vision & mission text with background image      |
| `products_foundation` | Product info split into two text sections         |
| `why_jivo`            | Why Jivo section with value pillars               |

## API Endpoints

| Method | Endpoint         | Description                  | Auth     |
|--------|-----------------|-------------------------------|----------|
| GET    | /api/home       | List active sections (public) | No       |
| GET    | /api/home?all=true | List all sections (admin)  | Admin    |
| POST   | /api/home       | Create section                | Admin    |
| GET    | /api/home/[id]  | Get single section            | No       |
| PUT    | /api/home/[id]  | Update section                | Admin    |
| DELETE | /api/home/[id]  | Delete section                | Admin    |

## Request/Response Examples

### Create Hero Section

```
POST /api/home
Content-Type: application/json

{
  "section": "hero",
  "content": {
    "logo": "https://utfs.io/f/xxx-logo.png",
    "backgroundImage": "https://utfs.io/f/xxx-hero-bg.jpg",
    "headline": "LET NATURE RECLAIM YOU",
    "subtitle": "Premium cold-pressed oils and superfoods for a healthier life",
    "ctaText": "Explore Products",
    "ctaHref": "/products"
  },
  "sortOrder": 0,
  "isActive": true
}

Response:
{
  "success": true,
  "data": {
    "id": "clxyz123...",
    "pageSlug": "home",
    "section": "hero",
    "content": { ... },
    "sortOrder": 0,
    "isActive": true,
    "updatedAt": "2026-04-14T..."
  }
}
```

### Create Categories Section

```
POST /api/home
Content-Type: application/json

{
  "section": "categories",
  "content": {
    "heading": "MADE FOR EVERYDAY LOVE",
    "items": [
      {
        "name": "Cooking Oil",
        "image": "https://utfs.io/f/xxx-cooking.jpg",
        "href": "/products?category=cooking-oil",
        "bgColor": "bg-jivo-green"
      },
      {
        "name": "Superfoods",
        "image": "https://utfs.io/f/xxx-super.jpg",
        "href": "/products?category=superfoods",
        "bgColor": "bg-jivo-gold"
      }
    ]
  },
  "sortOrder": 1,
  "isActive": true
}
```

### Update Section

```
PUT /api/home/clxyz123
Content-Type: application/json

{
  "content": {
    "headline": "PURE NATURE, PURE WELLNESS",
    "subtitle": "Updated subtitle text"
  },
  "isActive": true
}

Response:
{
  "success": true,
  "data": { ... updated section ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Section \"hero\" already exists"
}
```

## Data Flow

1. Admin creates/edits sections via `/admin/home-page` dashboard
2. Form data validated with Zod (`homeSectionSchema`)
3. API saves to PostgreSQL via Prisma (`PageContent` model)
4. Public home page fetches active sections via `getHomePageSections()` server action
5. `HomeMain` component renders each section by key
6. Each section component receives typed content props

## Admin Dashboard

- **Table view**: Lists all sections with sort order, status, and last updated
- **Create**: Select from available section types (only missing ones shown)
- **Edit**: Opens dialog with section-specific form fields
- **Delete**: Confirmation dialog before removal
- **Toggle**: Click status badge to toggle active/inactive

## User Page Components

- `HeroSection` — Full-screen hero with logo overlay and CTA button
- `ProductCategories` — Grid of category cards with images
- `VisionMission` — Split layout with background image
- `ProductsFoundation` — Two-column text content with product image
- `WhyJivo` — Value pillars with icon grid

## File Structure

```
src/modules/home/
├── actions.ts              # Server actions (CRUD)
├── validations.ts          # Zod schemas per section type
├── types/index.ts          # TypeScript interfaces
├── components/
│   ├── home-main.tsx       # Main orchestrator component
│   ├── hero-section.tsx    # Hero banner
│   ├── product-categories.tsx  # Category cards
│   ├── vision-mission.tsx  # Vision & Mission
│   ├── products-foundation.tsx # Product info sections
│   └── why-jivo.tsx        # Why Jivo + value pillars
├── data/
│   └── home-content.ts     # Static fallback content
├── index.ts                # Barrel export
└── README.md               # This file
```
