import dynamic from 'next/dynamic';
import { LazyOnView } from '@/components/shared/public';
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

// Render functions preserve each section's LazyOnView wrapper while order +
// visibility stay DB-driven (sortOrder / isActive).
const SECTION_RENDERERS: Record<string, (content: unknown) => React.ReactNode> = {
  hero: (content) => (
    <MotherEarthHeroSection data={content as ForMotherEarthHeroContent | undefined} />
  ),
  cleanTree: (content) => (
    <LazyOnView rootMargin="700px" fallback={<CleanTreeSectionSkeleton />} minHeight="0px">
      <CleanTreeSection data={content as ForMotherEarthCleanTreeContent | undefined} />
    </LazyOnView>
  ),
  disaster: (content) => (
    <LazyOnView rootMargin="700px" fallback={<DisasterSectionSkeleton />} minHeight="0px">
      <DisasterSection data={content as ForMotherEarthDisasterContent | undefined} />
    </LazyOnView>
  ),
};

interface ForMotherEarthMainProps {
  /** ACTIVE sections in display order (already filtered + sorted by the query). */
  sections: { section: string; content: unknown }[];
}

/** Renders only ACTIVE sections in the admin-set DB order. */
export function ForMotherEarthMain({ sections }: ForMotherEarthMainProps) {
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
