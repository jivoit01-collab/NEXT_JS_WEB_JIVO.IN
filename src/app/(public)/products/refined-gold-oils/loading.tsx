import { RefinedGoldOilsHeroSkeleton } from '@/modules/our-products/refined-gold-oils/components/hero-section';
import { RangeSectionSkeleton } from '@/modules/our-products/refined-gold-oils/components/range-section';
import { HighlightsSectionSkeleton } from '@/modules/our-products/refined-gold-oils/components/highlights-section';
import { WhatIsGoldSectionSkeleton } from '@/modules/our-products/refined-gold-oils/components/what-is-gold-section';

export default function RefinedGoldOilsLoading() {
  return (
    <main>
      <RefinedGoldOilsHeroSkeleton />
      <RangeSectionSkeleton />
      <HighlightsSectionSkeleton />
      <WhatIsGoldSectionSkeleton />
    </main>
  );
}
