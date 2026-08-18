import { CanolaOilsHeroSkeleton } from '@/modules/our-products/canola-oils/components/hero-section';
import { RangeSectionSkeleton } from '@/modules/our-products/canola-oils/components/range-section';
import { WhatIsCanolaSectionSkeleton } from '@/modules/our-products/canola-oils/components/what-is-canola-section';
import { ScienceSectionSkeleton } from '@/modules/our-products/canola-oils/components/science-section';
import { ColdPressedSectionSkeleton } from '@/modules/our-products/canola-oils/components/cold-pressed-section';

export default function CanolaOilsLoading() {
  return (
    <main>
      <CanolaOilsHeroSkeleton />
      <RangeSectionSkeleton />
      <WhatIsCanolaSectionSkeleton />
      <ScienceSectionSkeleton />
      <ColdPressedSectionSkeleton />
    </main>
  );
}
