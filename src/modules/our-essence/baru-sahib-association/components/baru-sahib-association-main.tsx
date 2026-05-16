import dynamic from 'next/dynamic';
import { LazyOnView } from '@/components/shared';
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

interface BaruSahibAssociationMainProps {
  sections: Map<string, unknown>;
}

export function BaruSahibAssociationMain({ sections }: BaruSahibAssociationMainProps) {
  return (
    <main>
      <BaruSahibAssociationHero
        data={sections.get('hero') as BaruSahibAssociationHeroContent | undefined}
      />
      <LazyOnView rootMargin="300px" fallback={<CinematicVideoSectionSkeleton />} minHeight="100vh">
        <CinematicVideoSection
          data={sections.get('video') as BaruSahibAssociationVideoContent | undefined}
        />
      </LazyOnView>
      <HumanitySection
        data={sections.get('humanity') as BaruSahibAssociationHumanityContent | undefined}
      />
    </main>
  );
}
