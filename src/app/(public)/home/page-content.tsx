import { JsonLd } from '@/components/shared';
import { HomeMain, getHomePageSections, getActiveHeroSlides, defaultSeo } from '@/modules/home';
import { resolveSeo, getStructuredData } from '@/modules/seo/utils';

// NOTE: Route segment config (`revalidate`) lives in
// `src/app/(public)/page.tsx` (the actual route file). Next.js only reads
// segment exports from route files, not from imported modules.
//
// ISR: page is statically generated and refreshed every 5 minutes. Admin
// saves call `revalidatePath('/')` for instant invalidation on edit.
// See docs/prompt1.md §38.

// Navbar + Footer are rendered once in `src/app/(public)/layout.tsx`.
// No page needs to import them individually.

export async function generateMetadata() {
  return resolveSeo('home', defaultSeo);
}

export default async function HomePage() {
  const [sections, heroSlides, structuredData] = await Promise.all([
    getHomePageSections(),
    getActiveHeroSlides(),
    getStructuredData('home', defaultSeo),
  ]);

  const sectionMap = new Map<string, unknown>();
  for (const s of sections) {
    sectionMap.set(s.section, s.content);
  }

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <HomeMain sections={sectionMap} heroSlides={heroSlides} />
    </>
  );
}
