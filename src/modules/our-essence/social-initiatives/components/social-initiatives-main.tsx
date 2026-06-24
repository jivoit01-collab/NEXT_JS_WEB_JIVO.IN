import dynamic from 'next/dynamic';
import { LazyOnView } from '@/components/shared/public';
import { SocialInitiativesHero } from './hero-section';
import { SplitStorySectionSkeleton } from './split-story-section';
import { EducateEmpowerSectionSkeleton } from './educate-empower-section';
import { defaultResponsibilitiesContent } from '../data/defaults';
import type {
  SocialInitiativesEducateContent,
  SocialInitiativesHeroContent,
  SocialInitiativesSplitContent,
} from '../types';

const SplitStorySection = dynamic(
  () => import('./split-story-section').then((mod) => mod.SplitStorySection),
  { loading: () => <SplitStorySectionSkeleton /> },
);

const EducateEmpowerSection = dynamic(
  () => import('./educate-empower-section').then((mod) => mod.EducateEmpowerSection),
  { loading: () => <EducateEmpowerSectionSkeleton /> },
);

interface SocialInitiativesMainProps {
  sections: Map<string, unknown>;
}

export function SocialInitiativesMain({ sections }: SocialInitiativesMainProps) {
  return (
    <main>
      <SocialInitiativesHero
        data={sections.get('hero') as SocialInitiativesHeroContent | undefined}
      />
      <LazyOnView rootMargin="700px" fallback={<SplitStorySectionSkeleton />} minHeight="0px">
        <SplitStorySection
          data={sections.get('responsibilities') as SocialInitiativesSplitContent | undefined}
          fallbackData={defaultResponsibilitiesContent}
          tone="ocean"
        />
      </LazyOnView>
      <LazyOnView rootMargin="700px" fallback={<EducateEmpowerSectionSkeleton />} minHeight="0px">
        <EducateEmpowerSection
          data={sections.get('educate') as SocialInitiativesEducateContent | undefined}
        />
      </LazyOnView>
    </main>
  );
}
