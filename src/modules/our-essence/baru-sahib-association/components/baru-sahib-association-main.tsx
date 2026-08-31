import dynamic from 'next/dynamic';
import { LazyOnView } from '@/components/shared/public';
import { BaruSahibAssociationHero } from './hero-section';
import { CinematicVideoSectionSkeleton } from './CinematicVideoSection';
import { HumanitySectionSkeleton } from './humanity-section';
import type {
  BaruSahibAssociationHeroContent,
  BaruSahibAssociationHumanityContent,
  BaruSahibAssociationVideoContent,
} from '../types';

const CinematicVideoSection = dynamic(
  () => import('./CinematicVideoSection').then((mod) => mod.CinematicVideoSection),
  { loading: () => <CinematicVideoSectionSkeleton /> },
);

const HumanitySection = dynamic(
  () => import('./humanity-section').then((mod) => mod.HumanitySection),
  { loading: () => <HumanitySectionSkeleton /> },
);

// Render functions preserve each section's LazyOnView wrapper while order +
// visibility stay DB-driven (sortOrder / isActive).
const SECTION_RENDERERS: Record<string, (content: unknown) => React.ReactNode> = {
  hero: (content) => (
    <BaruSahibAssociationHero data={content as BaruSahibAssociationHeroContent | undefined} />
  ),
  video: (content) => (
    <LazyOnView rootMargin="300px" fallback={<CinematicVideoSectionSkeleton />} minHeight="0px">
      <CinematicVideoSection data={content as BaruSahibAssociationVideoContent | undefined} />
    </LazyOnView>
  ),
  humanity: (content) => (
    <LazyOnView rootMargin="220px" fallback={<HumanitySectionSkeleton />} minHeight="0px">
      <HumanitySection data={content as BaruSahibAssociationHumanityContent | undefined} />
    </LazyOnView>
  ),
};

interface BaruSahibAssociationMainProps {
  /** ACTIVE sections in display order (already filtered + sorted by the query). */
  sections: { section: string; content: unknown }[];
}

/** Renders only ACTIVE sections in the admin-set DB order. */
export function BaruSahibAssociationMain({ sections }: BaruSahibAssociationMainProps) {
  return (
    <main>
      {sections.map(({ section, content }) => {
        const render = SECTION_RENDERERS[section];
        if (!render) return null;
        return <div key={section}>{render(content)}</div>;
      })}
    </main>
  );
}
