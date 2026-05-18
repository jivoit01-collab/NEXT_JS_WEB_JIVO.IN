import dynamic from 'next/dynamic';
import { LazyOnView } from '@/components/shared';
import { OurFairShareHeroSection } from './hero-section';
import { HealthcareSectionSkeleton } from './healthcare-section';
import { WomenEmpowermentSectionSkeleton } from './women-empowerment-section';
import type {
  OurFairShareHealthcareContent,
  OurFairShareHeroContent,
  OurFairShareWomenContent,
} from '../types';

const HealthcareSection = dynamic(
  () => import('./healthcare-section').then((mod) => mod.HealthcareSection),
  { loading: () => <HealthcareSectionSkeleton /> },
);

const WomenEmpowermentSection = dynamic(
  () => import('./women-empowerment-section').then((mod) => mod.WomenEmpowermentSection),
  { loading: () => <WomenEmpowermentSectionSkeleton /> },
);

interface OurFairShareMainProps {
  sections: Map<string, unknown>;
}

export function OurFairShareMain({ sections }: OurFairShareMainProps) {
  return (
    <main>
      <OurFairShareHeroSection data={sections.get('hero') as OurFairShareHeroContent | undefined} />
      <LazyOnView rootMargin="300px" fallback={<HealthcareSectionSkeleton />} minHeight="560px">
        <HealthcareSection
          data={sections.get('healthcare') as OurFairShareHealthcareContent | undefined}
        />
      </LazyOnView>
      <LazyOnView
        rootMargin="300px"
        fallback={<WomenEmpowermentSectionSkeleton />}
        minHeight="560px"
      >
        <WomenEmpowermentSection
          data={sections.get('women') as OurFairShareWomenContent | undefined}
        />
      </LazyOnView>
    </main>
  );
}
