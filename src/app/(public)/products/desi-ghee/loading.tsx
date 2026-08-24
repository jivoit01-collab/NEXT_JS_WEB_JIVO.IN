import { DesiGheeHeroSkeleton } from '@/modules/our-products/desi-ghee/components/hero-section';
import { RangeSectionSkeleton } from '@/modules/our-products/desi-ghee/components/range-section';
import { HighlightsSectionSkeleton } from '@/modules/our-products/desi-ghee/components/highlights-section';
import { BilonaSectionSkeleton } from '@/modules/our-products/desi-ghee/components/bilona-section';

export default function DesiGheeLoading() {
  return (
    <main>
      <DesiGheeHeroSkeleton />
      <RangeSectionSkeleton />
      <HighlightsSectionSkeleton />
      <BilonaSectionSkeleton />
    </main>
  );
}
