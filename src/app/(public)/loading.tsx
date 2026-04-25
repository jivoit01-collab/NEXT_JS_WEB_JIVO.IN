/**
 * This file fires for the home page route `/` (src/app/(public)/page.tsx).
 *
 * The real Navbar is rendered by (public)/layout.tsx above the Suspense
 * boundary, so it is already visible and we must NOT render a fake one here.
 * The hero skeleton sits flush at the top — the fixed navbar overlays it
 * exactly as it does in the live page.
 */

import { HeroSkeleton } from '@/modules/home/components/hero-section';
import { ProductCategoriesSkeleton } from '@/modules/home/components/product-categories';
import { VisionMissionSkeleton } from '@/modules/home/components/vision-mission';
import { ProductsFoundationSkeleton } from '@/modules/home/components/products-foundation';
import { WhyJivoSkeleton } from '@/modules/home/components/why-jivo';

export default function HomePageLoading() {
  return (
    <main>
      <HeroSkeleton />
      <ProductCategoriesSkeleton />
      <VisionMissionSkeleton />
      <ProductsFoundationSkeleton />
      <WhyJivoSkeleton />
    </main>
  );
}
