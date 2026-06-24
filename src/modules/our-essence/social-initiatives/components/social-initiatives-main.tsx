import dynamic from 'next/dynamic';
import { SocialInitiativesHero } from './hero-section';
import { SplitStorySectionSkeleton } from './split-story-section';
import { EducateEmpowerSectionSkeleton } from './educate-empower-section';
import { defaultResponsibilitiesContent } from '../data/defaults';
import type {
  SocialInitiativesEducateContent,
  SocialInitiativesHeroContent,
  SocialInitiativesSplitContent,
} from '../types';

// Hero is above-the-fold — eager (server-rendered) for instant LCP.
// Below-the-fold sections use next/dynamic for JS code splitting while still
// shipping their markup in the ISR HTML (no LazyOnView viewport gating — see
// docs/performance.md §9.2). Skeletons only show during client-nav chunk load.
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
      <SplitStorySection
        data={sections.get('responsibilities') as SocialInitiativesSplitContent | undefined}
        fallbackData={defaultResponsibilitiesContent}
        tone="ocean"
      />
      <EducateEmpowerSection
        data={sections.get('educate') as SocialInitiativesEducateContent | undefined}
      />
    </main>
  );
}
