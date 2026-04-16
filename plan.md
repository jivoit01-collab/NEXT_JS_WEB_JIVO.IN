# Plan: Fix Image Handling to Follow Strict Rules

## Problem

The current image handling violates almost every strict rule. Uploads go to `/public/images/`, are served directly from the public folder (bypassing API), full URL paths are stored instead of just filenames, and the fallback placeholder path is wrong.

---

## Current State (Violations)

| Rule | Expected | Current | Status |
|------|----------|---------|--------|
| 1. Never use `/public/images` for uploads | `/uploads/images/` | `/public/images/` | VIOLATED |
| 2. Store in `/uploads/images` | `uploads/images/` at project root | `public/images/` | VIOLATED |
| 3. Unique filenames with timestamp | `Date.now()-name.webp` | Already done | OK |
| 4. Store ONLY filename in DB | `1713265200000-image.webp` | `/images/1713265200000-image.webp` | VIOLATED |
| 5. Serve through `/api/uploads/[filename]` | API route serving | Direct public serving | VIOLATED |
| 6. Fallback image handling | `/uploads/placeholder.png` | `/images/placeholder.jpg` | VIOLATED |
| 7. Delete file from disk on record delete | Needs verification | Partially done | NEEDS CHECK |
| 8. Proper cache headers | On API route | On `/images/(.*)` in next.config | VIOLATED |
| 9. Never reuse filenames | Timestamp-based | Already done | OK |
| 10. Never bypass API serving | All via `/api/uploads/` | Direct from public | VIOLATED |

---

## Files to Modify

### Phase 1: Backend (Upload + Serve APIs)

#### 1. `src/app/api/upload/route.ts` — Rewrite upload & delete logic
- **POST**: Change `uploadDir` from `public/images` to `uploads/images` (project root)
- **POST**: Return only `filename` (not full `/images/filename` URL)
- **DELETE**: Accept `filename` instead of URL path, delete from `uploads/images/`
- Update path validation to match new directory

#### 2. NEW: `src/app/api/uploads/[filename]/route.ts` — Image serving API
- Read file from `uploads/images/{filename}` on disk
- Return with proper headers:
  - `Content-Type` based on file extension (`.webp`, `.png`, `.jpg`)
  - `Cache-Control: public, max-age=86400, s-maxage=604800`
  - `Content-Length`
- Return 404 if file not found
- Handle the placeholder fallback (`/uploads/placeholder.png`) from same directory
- Guard against directory traversal (`..` in filename)

### Phase 2: Frontend Components

#### 3. `src/components/shared/image-upload.tsx`
- `uploadFile()`: extract and return `result.data.filename` instead of `result.data.url`
- `onChange()` callbacks: pass filename only
- `deleteFile()`: send `{ filename }` instead of `{ url }`
- Image preview `src`: construct `/api/uploads/${filename}` from stored filename
- `MultiImageUpload`: same changes for array of filenames

#### 4. `src/components/shared/safe-image.tsx`
- Change `PLACEHOLDER` from `'/images/placeholder.jpg'` to `'/api/uploads/placeholder.png'`
- No other logic changes needed (retry + fallback logic stays)

#### 5. `src/components/shared/image-with-fallback.tsx`
- Change default `fallbackSrc` from `'/images/common/placeholder.webp'` to `'/api/uploads/placeholder.png'`

#### 6. `src/components/layout/footer.tsx`
- Change logo fallback from `'/images/Jivo Logo.png'` to `'/api/uploads/placeholder.png'`
- If `setting.logoUrl` stores a filename, render as `/api/uploads/${setting.logoUrl}`

#### 7. `src/modules/home/components/why-jivo.tsx`
- Change `PLACEHOLDER` from `'/images/placeholder.jpg'` to `'/api/uploads/placeholder.png'`

#### 8. `src/modules/home/data/home-content.ts`
- Change placeholder reference to `'/api/uploads/placeholder.png'`

### Phase 3: Config & SEO

#### 9. `next.config.ts`
- Change cache header `source` from `'/images/(.*)'` to `'/api/uploads/(.*)'`

#### 10. `src/modules/home/data/defaults.ts`
- Update `ogImage` from `'/images/common/og-default.png'` to appropriate path
- Note: OG images are static assets, not uploads — move to `/public/assets/` or keep in `/public/images/common/` (these are NOT dynamic uploads, so rule 1 doesn't apply)

#### 11. `src/modules/seo/data/defaults.ts`
- Same as above — update `ogImage` path if static assets are relocated

#### 12. `src/lib/seo.ts`
- Update `ogImage` default and `logo` JSON-LD path
- Static SEO assets can remain in `/public/` since they're committed to the repo, not uploads

### Phase 4: Database & Seed

#### 13. `prisma/seed.ts`
- Update all `PLACEHOLDER` references to just the filename: `'placeholder.png'`
- Update `logoUrl` to just filename: e.g., `'jivo-logo.png'`
- Update `ogImage` references (keep as full path if they're static `/public/` assets)

### Phase 5: Gitignore & Filesystem

#### 14. `.gitignore`
- Change `/public/uploads/images/` to `/uploads/images/`
- Keep `/uploads/` ignored since it holds dynamic uploads
- Make sure `/uploads/placeholder.png` is NOT ignored (it ships with the repo)

#### 15. Move placeholder file
- Ensure `/uploads/placeholder.png` exists at project root
- Remove old placeholders from `/public/images/`

---

## Key Design Decisions

1. **Static vs. dynamic assets**: OG images, logos baked into code, and other static assets stay in `/public/` — they're not "uploads." Only admin-uploaded content goes through `/uploads/images/` + API route.

2. **DB stores filename only**: Components that read from DB must prefix with `/api/uploads/` at render time. This keeps the DB portable.

3. **Existing uploaded images**: After migration, any images already in `/public/images/` that were uploaded via admin need to be manually moved to `/uploads/images/`. A one-time migration script may be needed.

4. **The placeholder**: Lives at `/uploads/placeholder.png` (per project rules) and is served via `/api/uploads/placeholder.png`. It should be committed to the repo (not gitignored).

---

## Execution Order

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
```

Backend first (so the new serving API exists), then frontend (so components point to the new API), then config/seed/gitignore cleanup.

---

## Risk Notes

- Existing images in `/public/images/` uploaded via admin will break after this change — needs manual file move or migration script
- Any cached URLs in the database pointing to `/images/...` will need a one-time data migration to strip the path prefix and keep only the filename
- UploadThing integration (`src/lib/uploadthing.ts`) is a separate third-party service — not affected by these rules
