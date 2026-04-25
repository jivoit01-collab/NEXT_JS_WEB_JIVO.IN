import { CoreValuesHeroSkeleton } from '@/modules/our-essence/core-values/components/hero-section';
import { FoundationSectionSkeleton } from '@/modules/our-essence/core-values/components/foundation-section';
import { PrinciplesSectionSkeleton } from '@/modules/our-essence/core-values/components/principles-section';

export default function CoreValuesLoading() {
  return (
    <main>
      <CoreValuesHeroSkeleton />
      <FoundationSectionSkeleton />
      <PrinciplesSectionSkeleton />
    </main>
  );
}
