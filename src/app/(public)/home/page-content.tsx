import { unstable_noStore as noStore } from 'next/cache';
import { Footer, Navbar } from '@/components/layout';
import { JsonLd } from '@/components/shared';
import { HomeMain, getHomePageSections, getActiveHeroSlides, defaultSeo } from '@/modules/home';
import { getVisibleNavLinks, getNavbarSetting } from '@/modules/navbar';
import { resolveSeo, getStructuredData } from '@/modules/seo/utils';

// NOTE: Route segment config (`dynamic`, `revalidate`) lives in
// `src/app/(public)/page.tsx` (the actual route file). Next.js only reads
// segment exports from route files, not from imported modules.

export async function generateMetadata() {
  return resolveSeo('home', defaultSeo);
}

export default async function HomePage() {
  // Opt out of every Next.js cache layer so CMS edits are visible on every refresh.
  noStore();

  const [sections, heroSlides, navLinks, navSetting, structuredData] = await Promise.all([
    getHomePageSections(),
    getActiveHeroSlides(),
    getVisibleNavLinks(),
    getNavbarSetting(),
    getStructuredData('home', defaultSeo),
  ]);

  const sectionMap = new Map<string, unknown>();
  for (const s of sections) {
    sectionMap.set(s.section, s.content);
  }

  const links = navLinks.map((l: { id: string; title: string; href: string; subLinks?: { id: string; title: string; href: string }[] }) => ({
    id: l.id,
    title: l.title,
    href: l.href,
    subLinks: l.subLinks?.map((s) => ({
      id: s.id,
      title: s.title,
      href: s.href,
    })) ?? [],
  }));

  return (
    <div className="flex min-h-screen flex-col">
      {structuredData && <JsonLd data={structuredData} />}
      <Navbar
        links={links.length > 0 ? links : undefined}
        logoUrl={navSetting.logoUrl}
        logoAlt={navSetting.logoAlt}
      />
      <HomeMain sections={sectionMap} heroSlides={heroSlides} />
      <Footer />
    </div>
  );
}
