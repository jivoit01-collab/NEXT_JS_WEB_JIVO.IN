// `/` re-exports from the home module folder so home stays symmetric with
// every other page (own folder, own loading.tsx, own SEO defaults).
// See docs/prompt1.md §25 (Per-Page Folder Structure).
//
// Route segment config (dynamic / revalidate) MUST be redeclared here —
// Next.js statically analyzes these from the route file itself.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export { default, generateMetadata } from './home/page-content';
