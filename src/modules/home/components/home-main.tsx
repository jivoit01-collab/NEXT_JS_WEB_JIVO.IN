import dynamic from 'next/dynamic';
import { HeroSection } from './hero-section';
import { ProductCategoriesSkeleton } from './product-categories';
import { VisionMissionSkeleton } from './vision-mission';
import { ProductsFoundationSkeleton } from './products-foundation';
import { WhyJivoSkeleton } from './why-jivo';
import type {
  HeroContent,
  HeroSlideData,
  CategoriesContent,
  VisionMissionContent,
  ProductsFoundationContent,
  WhyJivoContent,
} from '../types';

// Hero is above-the-fold — eager (server-rendered) for instant LCP.
//
// Below-the-fold sections use `next/dynamic` for JS code splitting.
// Loading fallbacks mirror the real section layout so there is zero
// layout shift when the JS chunk arrives.
const ProductCategories = dynamic(
  () => import('./product-categories').then((m) => m.ProductCategories),
  { loading: () => <ProductCategoriesSkeleton /> },
);
const VisionMission = dynamic(
  () => import('./vision-mission').then((m) => m.VisionMission),
  { loading: () => <VisionMissionSkeleton /> },
);
const ProductsFoundation = dynamic(
  () => import('./products-foundation').then((m) => m.ProductsFoundation),
  { loading: () => <ProductsFoundationSkeleton /> },
);
const WhyJivo = dynamic(
  () => import('./why-jivo').then((m) => m.WhyJivo),
  { loading: () => <WhyJivoSkeleton /> },
);

interface HomeMainProps {
  sections: Map<string, unknown>;
  heroSlides?: HeroSlideData[];
  isLoading?: boolean;
}

export function HomeMain({ sections, heroSlides, isLoading }: HomeMainProps) {
  return (
    <main>
      <HeroSection
        data={sections.get('hero') as HeroContent | undefined}
        slides={heroSlides}
        isLoading={isLoading}
      />
      <ProductCategories
        data={sections.get('categories') as CategoriesContent | undefined}
        isLoading={isLoading}
      />
      <VisionMission
        data={sections.get('vision_mission') as VisionMissionContent | undefined}
        isLoading={isLoading}
      />
      <ProductsFoundation
        data={sections.get('products_foundation') as ProductsFoundationContent | undefined}
        isLoading={isLoading}
      />
      <WhyJivo
        data={sections.get('why_jivo') as WhyJivoContent | undefined}
        isLoading={isLoading}
      />
    </main>
  );
}
