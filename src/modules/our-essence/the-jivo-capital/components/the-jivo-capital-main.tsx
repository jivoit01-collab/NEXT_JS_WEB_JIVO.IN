import dynamic from 'next/dynamic';
import { LazyOnView } from '@/components/shared/public';
import { TheJivoCapitalHero } from './hero-section';
import { PlantSectionSkeleton } from './plant-section';
import {
  FarmToBottleSectionSkeleton,
  FreshLockSectionSkeleton,
} from './wheatgrass-sections';
import type {
  TheJivoCapitalFarmToBottleContent,
  TheJivoCapitalFreshLockContent,
  TheJivoCapitalHeroContent,
  TheJivoCapitalPlantContent,
} from '../types';

const PlantSection = dynamic(() => import('./plant-section').then((mod) => mod.PlantSection), {
  loading: () => <PlantSectionSkeleton />,
});
const FarmToBottleSection = dynamic(
  () => import('./wheatgrass-sections').then((mod) => mod.FarmToBottleSection),
  {
    loading: () => <FarmToBottleSectionSkeleton />,
  },
);
const FreshLockSection = dynamic(
  () => import('./wheatgrass-sections').then((mod) => mod.FreshLockSection),
  {
    loading: () => <FreshLockSectionSkeleton />,
  },
);

// Render functions preserve each section's LazyOnView wrapper + specific props
// (the oil/water plants reuse PlantSection with different fallback/align).
const SECTION_RENDERERS: Record<string, (content: unknown) => React.ReactNode> = {
  hero: (content) => (
    <TheJivoCapitalHero data={content as TheJivoCapitalHeroContent | undefined} />
  ),
  oilPlant: (content) => (
    <LazyOnView rootMargin="300px" fallback={<PlantSectionSkeleton />} minHeight="560px">
      <PlantSection fallback="oil" data={content as TheJivoCapitalPlantContent | undefined} />
    </LazyOnView>
  ),
  waterPlant: (content) => (
    <LazyOnView
      rootMargin="300px"
      fallback={<PlantSectionSkeleton align="right" />}
      minHeight="560px"
    >
      <PlantSection fallback="water" data={content as TheJivoCapitalPlantContent | undefined} />
    </LazyOnView>
  ),
  farmToBottle: (content) => (
    <LazyOnView rootMargin="300px" fallback={<FarmToBottleSectionSkeleton />} minHeight="560px">
      <FarmToBottleSection data={content as TheJivoCapitalFarmToBottleContent | undefined} />
    </LazyOnView>
  ),
  freshLock: (content) => (
    <LazyOnView rootMargin="300px" fallback={<FreshLockSectionSkeleton />} minHeight="560px">
      <FreshLockSection data={content as TheJivoCapitalFreshLockContent | undefined} />
    </LazyOnView>
  ),
};

interface TheJivoCapitalMainProps {
  /** ACTIVE sections in display order (already filtered + sorted by the query). */
  sections: { section: string; content: unknown }[];
}

/** Renders only ACTIVE sections in the admin-set DB order. */
export function TheJivoCapitalMain({ sections }: TheJivoCapitalMainProps) {
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
