import { unstable_noStore as noStore } from 'next/cache';
import { JsonLd } from '@/components/shared';
import { HomeMain, getHomePageSections, getActiveHeroSlides, defaultSeo } from '@/modules/home';
import { resolveSeo, getStructuredData } from '@/modules/seo/utils';

// NOTE: Route segment config (`dynamic`, `revalidate`) lives in
// `src/app/(public)/page.tsx` (the actual route file). Next.js only reads
// segment exports from route files, not from imported modules.

// Navbar + Footer are rendered once in `src/app/(public)/layout.tsx`.
// No page needs to import them individually.

export async function generateMetadata() {
  return resolveSeo('home', defaultSeo);
}

export default async function HomePage() {
  // Opt out of every Next.js cache layer so CMS edits are visible on every refresh.
  noStore();

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
