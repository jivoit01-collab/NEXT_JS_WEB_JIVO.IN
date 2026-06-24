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

interface TheJivoCapitalMainProps {
  sections: Map<string, unknown>;
}

export function TheJivoCapitalMain({ sections }: TheJivoCapitalMainProps) {
  return (
    <main>
      <TheJivoCapitalHero
        data={sections.get('hero') as TheJivoCapitalHeroContent | undefined}
      />
      <LazyOnView rootMargin="300px" fallback={<PlantSectionSkeleton />} minHeight="560px">
        <PlantSection
          fallback="oil"
          data={sections.get('oilPlant') as TheJivoCapitalPlantContent | undefined}
        />
      </LazyOnView>
      <LazyOnView
        rootMargin="300px"
        fallback={<PlantSectionSkeleton align="right" />}
        minHeight="560px"
      >
        <PlantSection
          fallback="water"
          data={sections.get('waterPlant') as TheJivoCapitalPlantContent | undefined}
        />
      </LazyOnView>
      <LazyOnView
        rootMargin="300px"
        fallback={<FarmToBottleSectionSkeleton />}
        minHeight="560px"
      >
        <FarmToBottleSection
          data={sections.get('farmToBottle') as TheJivoCapitalFarmToBottleContent | undefined}
        />
      </LazyOnView>
      <LazyOnView rootMargin="300px" fallback={<FreshLockSectionSkeleton />} minHeight="560px">
        <FreshLockSection
          data={sections.get('freshLock') as TheJivoCapitalFreshLockContent | undefined}
        />
      </LazyOnView>
    </main>
  );
}
