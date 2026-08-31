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

// Each section key → a render function (SplitStorySection needs extra props),
// so order + visibility stay DB-driven while per-section props are preserved.
const SECTION_RENDERERS: Record<string, (content: unknown) => React.ReactNode> = {
  hero: (content) => (
    <SocialInitiativesHero data={content as SocialInitiativesHeroContent | undefined} />
  ),
  responsibilities: (content) => (
    <SplitStorySection
      data={content as SocialInitiativesSplitContent | undefined}
      fallbackData={defaultResponsibilitiesContent}
      tone="ocean"
    />
  ),
  educate: (content) => (
    <EducateEmpowerSection data={content as SocialInitiativesEducateContent | undefined} />
  ),
};

interface SocialInitiativesMainProps {
  /** ACTIVE sections in display order (already filtered + sorted by the query). */
  sections: { section: string; content: unknown }[];
}

/** Renders only ACTIVE sections in the admin-set DB order. */
export function SocialInitiativesMain({ sections }: SocialInitiativesMainProps) {
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
