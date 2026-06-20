# Future Admin Page Instructions

## Live Preview Mapping

Whenever a new admin/editor page is created under `/jivo-dev`, also update the dynamic Live Preview mapping in `src/lib/preview-utils.ts`.

Rules:

- Do not add hardcoded preview buttons that point to `/`.
- Use `getPublicPreviewUrl(adminPathname)` for all admin Live Preview links.
- Remove the `/jivo-dev` prefix when resolving public URLs.
- Map flat admin editor paths to their real public routes.
- Example: `/jivo-dev/our-essence-the-jivo-capital` must preview `/our-essence/the-jivo-capital`.
- If a new CMS page has a custom public route, add an explicit mapping before any fallback logic.
- Keep the admin navbar preview and editor-page preview buttons context-aware.
