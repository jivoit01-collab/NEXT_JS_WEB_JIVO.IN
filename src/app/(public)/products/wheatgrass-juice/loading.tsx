import { WheatgrassHeroSkeleton } from '@/modules/our-products/wheatgrass-juice/components/hero-section';
import { RangeSectionSkeleton } from '@/modules/our-products/wheatgrass-juice/components/range-section';
import { WellnessSectionSkeleton } from '@/modules/our-products/wheatgrass-juice/components/wellness-section';
import { DifferenceSectionSkeleton } from '@/modules/our-products/wheatgrass-juice/components/difference-section';
import { HighlightsSectionSkeleton } from '@/modules/our-products/wheatgrass-juice/components/highlights-section';

export default function WheatgrassJuiceLoading() {
  return (
    <main>
      <WheatgrassHeroSkeleton />
      <RangeSectionSkeleton />
      <WellnessSectionSkeleton />
      <DifferenceSectionSkeleton />
      <HighlightsSectionSkeleton />
    </main>
  );
}
