import dynamic from 'next/dynamic';
import { LazyOnView } from '@/components/shared';
import { MotherEarthHeroSection } from './hero-section';
import { CleanTreeSectionSkeleton } from './clean-tree-section';
import { DisasterSectionSkeleton } from './disaster-section';
import type {
  ForMotherEarthCleanTreeContent,
  ForMotherEarthDisasterContent,
  ForMotherEarthHeroContent,
} from '../types';

const CleanTreeSection = dynamic(
  () => import('./clean-tree-section').then((mod) => mod.CleanTreeSection),
  { loading: () => <CleanTreeSectionSkeleton /> },
);

const DisasterSection = dynamic(
  () => import('./disaster-section').then((mod) => mod.DisasterSection),
  { loading: () => <DisasterSectionSkeleton /> },
);

interface ForMotherEarthMainProps {
  sections: Map<string, unknown>;
}

export function ForMotherEarthMain({ sections }: ForMotherEarthMainProps) {
  return (
    <main>
      <MotherEarthHeroSection
        data={sections.get('hero') as ForMotherEarthHeroContent | undefined}
      />
      <LazyOnView rootMargin="300px" fallback={<CleanTreeSectionSkeleton />} minHeight="560px">
        <CleanTreeSection
          data={sections.get('cleanTree') as ForMotherEarthCleanTreeContent | undefined}
        />
      </LazyOnView>
      <LazyOnView rootMargin="300px" fallback={<DisasterSectionSkeleton />} minHeight="560px">
        <DisasterSection
          data={sections.get('disaster') as ForMotherEarthDisasterContent | undefined}
        />
      </LazyOnView>
    </main>
  );
}
