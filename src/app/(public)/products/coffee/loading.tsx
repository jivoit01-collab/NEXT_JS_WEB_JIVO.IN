import { CoffeeHeroSkeleton } from '@/modules/our-products/coffee/components/hero-section';
import { RangeSectionSkeleton } from '@/modules/our-products/coffee/components/range-section';
import { KeyHighlightsSectionSkeleton } from '@/modules/our-products/coffee/components/highlights-section';
import { BeyondBeansSectionSkeleton } from '@/modules/our-products/coffee/components/beyond-beans-section';

export default function CoffeeLoading() {
  return (
    <main>
      <CoffeeHeroSkeleton />
      <RangeSectionSkeleton />
      <KeyHighlightsSectionSkeleton />
      <BeyondBeansSectionSkeleton />
    </main>
  );
}
