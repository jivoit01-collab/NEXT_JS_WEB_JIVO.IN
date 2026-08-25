import { SunflowerOilsHeroSkeleton } from '@/modules/our-products/sunflower-oils/components/hero-section';
import { RangeSectionSkeleton } from '@/modules/our-products/sunflower-oils/components/range-section';
import { BenefitsSectionSkeleton } from '@/modules/our-products/sunflower-oils/components/benefits-section';
import { WhyItMattersSectionSkeleton } from '@/modules/our-products/sunflower-oils/components/why-it-matters-section';

export default function SunflowerOilsLoading() {
  return (
    <main>
      <SunflowerOilsHeroSkeleton />
      <RangeSectionSkeleton />
      <BenefitsSectionSkeleton />
      <WhyItMattersSectionSkeleton />
    </main>
  );
}
