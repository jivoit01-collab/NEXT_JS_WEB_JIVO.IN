import dynamic from 'next/dynamic';
import { CertificationsHero } from './hero-section';
import { FeaturedBadgeSection } from './featured-badge-section';
import { BadgesGridSectionSkeleton } from './badges-grid-section';
import type {
  CertificationsHeroContent,
  CertificationsBadgesContent,
  CertificationsFeaturedContent,
} from '../types';

// Hero (background + heading) is above-the-fold — eager for instant LCP.
// The animated badge grid is a client island, split out via next/dynamic.
const BadgesGridSection = dynamic(
  () => import('./badges-grid-section').then((m) => m.BadgesGridSection),
  { loading: () => <BadgesGridSectionSkeleton /> },
);

interface CertificationsMainProps {
  sections: Map<string, unknown>;
}

export function CertificationsMain({ sections }: CertificationsMainProps) {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#3d413f] pb-16 sm:pb-20 lg:pb-24 2xl:pb-28">
      <CertificationsHero data={sections.get('hero') as CertificationsHeroContent | undefined} />
      <BadgesGridSection
        data={sections.get('badges') as CertificationsBadgesContent | undefined}
      />
      <FeaturedBadgeSection
        data={sections.get('featured') as CertificationsFeaturedContent | undefined}
      />
    </main>
  );
}
