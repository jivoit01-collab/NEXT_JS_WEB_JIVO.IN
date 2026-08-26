import { WaterHeroSkeleton } from '@/modules/our-products/water/components/hero-section';
import { RangeSectionSkeleton } from '@/modules/our-products/water/components/range-section';
import { BetterBottleSectionSkeleton } from '@/modules/our-products/water/components/better-bottle-section';
import { MissionSectionSkeleton } from '@/modules/our-products/water/components/mission-section';

export default function WaterLoading() {
  return (
    <main>
      <WaterHeroSkeleton />
      <RangeSectionSkeleton />
      <BetterBottleSectionSkeleton />
      <MissionSectionSkeleton />
    </main>
  );
}
