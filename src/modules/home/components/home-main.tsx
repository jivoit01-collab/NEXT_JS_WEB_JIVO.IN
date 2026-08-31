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
  /** ACTIVE sections in display order (already filtered + sorted by the query). */
  sections: { section: string; content: unknown }[];
  heroSlides?: HeroSlideData[];
  isLoading?: boolean;
}

/**
 * Renders only ACTIVE home sections, in the admin-set DB order. Each key maps to
 * a render function (Hero needs slides; all pass isLoading), so order + visibility
 * are DB-driven while per-section props are preserved. A deactivated section is
 * absent from `sections`, so it is not rendered.
 */
export function HomeMain({ sections, heroSlides, isLoading }: HomeMainProps) {
  const renderers: Record<string, (content: unknown) => React.ReactNode> = {
    hero: (content) => (
      <HeroSection data={content as HeroContent | undefined} slides={heroSlides} isLoading={isLoading} />
    ),
    categories: (content) => (
      <ProductCategories data={content as CategoriesContent | undefined} isLoading={isLoading} />
    ),
    vision_mission: (content) => (
      <VisionMission data={content as VisionMissionContent | undefined} isLoading={isLoading} />
    ),
    products_foundation: (content) => (
      <ProductsFoundation
        data={content as ProductsFoundationContent | undefined}
        isLoading={isLoading}
      />
    ),
    why_jivo: (content) => (
      <WhyJivo data={content as WhyJivoContent | undefined} isLoading={isLoading} />
    ),
  };

  return (
    <main>
      {sections.map(({ section, content }) => {
        const render = renderers[section];
        if (!render) return null;
        return <div key={section}>{render(content)}</div>;
      })}
    </main>
  );
}
