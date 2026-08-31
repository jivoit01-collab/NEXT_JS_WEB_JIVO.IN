import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import { CertificationsHero } from './hero-section';
import { FeaturedBadgeSection } from './featured-badge-section';
import { BadgesGridSectionSkeleton } from './badges-grid-section';

// Hero (background + heading) is above-the-fold — eager for instant LCP.
// The animated badge grid is a client island, split out via next/dynamic.
const BadgesGridSection = dynamic(
  () => import('./badges-grid-section').then((m) => m.BadgesGridSection),
  { loading: () => <BadgesGridSectionSkeleton /> },
);

const SECTION_COMPONENTS: Record<string, ComponentType<{ data?: unknown }>> = {
  hero: CertificationsHero as ComponentType<{ data?: unknown }>,
  badges: BadgesGridSection as unknown as ComponentType<{ data?: unknown }>,
  featured: FeaturedBadgeSection as ComponentType<{ data?: unknown }>,
};

interface CertificationsMainProps {
  /** ACTIVE sections in display order (already filtered + sorted by the query). */
  sections: { section: string; content: unknown }[];
}

/** Renders only ACTIVE sections in the admin-set DB order. */
export function CertificationsMain({ sections }: CertificationsMainProps) {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#3d413f] pb-16 sm:pb-20 lg:pb-24 2xl:pb-28">
      {sections.map(({ section, content }) => {
        const Component = SECTION_COMPONENTS[section];
        if (!Component) return null;
        return <Component key={section} data={content} />;
      })}
    </main>
  );
}
