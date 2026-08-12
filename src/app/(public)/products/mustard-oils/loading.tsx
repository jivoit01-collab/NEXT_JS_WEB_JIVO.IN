import { MustardOilsHeroSkeleton } from '@/modules/our-products/mustard-oils/components/hero-section';
import { RangeSectionSkeleton } from '@/modules/our-products/mustard-oils/components/range-section';
import { ExtractionSectionSkeleton } from '@/modules/our-products/mustard-oils/components/extraction-section';
import { WarmthSectionSkeleton } from '@/modules/our-products/mustard-oils/components/warmth-section';

export default function MustardOilsLoading() {
  return (
    <main>
      <MustardOilsHeroSkeleton />
      <RangeSectionSkeleton />
      <ExtractionSectionSkeleton />
      <WarmthSectionSkeleton />
    </main>
  );
}
