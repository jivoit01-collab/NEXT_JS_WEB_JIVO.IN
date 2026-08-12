import { OliveOilsHeroSkeleton } from '@/modules/our-products/olive-oils/components/hero-section';
import { VariantSectionSkeleton } from '@/modules/our-products/olive-oils/components/variant-section';
import { DifferenceSectionSkeleton } from '@/modules/our-products/olive-oils/components/difference-section';
import {
  OLIVE_VIRGIN,
  OLIVE_LIGHT,
  OLIVE_POMACE,
} from '@/modules/our-products/olive-oils/constants';

export default function OliveOilsLoading() {
  return (
    <main>
      <OliveOilsHeroSkeleton />
      <VariantSectionSkeleton background={OLIVE_VIRGIN} />
      <VariantSectionSkeleton background={OLIVE_LIGHT} />
      <VariantSectionSkeleton background={OLIVE_POMACE} />
      <DifferenceSectionSkeleton />
    </main>
  );
}
