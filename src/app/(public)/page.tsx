// `/` re-exports from the home module folder so home stays symmetric with
// every other page (own folder, own loading.tsx, own SEO defaults).
// See docs/prompt1.md §25 (Per-Page Folder Structure).
//
// Route segment config (dynamic / revalidate) MUST be redeclared here —
// Next.js statically analyzes these from the route file itself.
// See docs/prompt1.md §38 — ISR (5 min) for CMS content pages.
// Admin saves call `revalidatePath('/')` so edits appear instantly.
export const revalidate = 300;

export { default, generateMetadata } from './home/page-content';
