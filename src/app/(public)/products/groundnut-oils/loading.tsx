import { GroundnutOilsHeroSkeleton } from '@/modules/our-products/groundnut-oils/components/hero-section';
import { RangeSectionSkeleton } from '@/modules/our-products/groundnut-oils/components/range-section';
import { GoodnessSectionSkeleton } from '@/modules/our-products/groundnut-oils/components/goodness-section';
import { AuthenticitySectionSkeleton } from '@/modules/our-products/groundnut-oils/components/authenticity-section';

export default function GroundnutOilsLoading() {
  return (
    <main>
      <GroundnutOilsHeroSkeleton />
      <RangeSectionSkeleton />
      <GoodnessSectionSkeleton />
      <AuthenticitySectionSkeleton />
    </main>
  );
}
