import dynamic from 'next/dynamic';
import { HeroSection } from './hero-section';
import { SectionSkeleton } from '@/components/shared';
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
// Below-the-fold sections use `next/dynamic` for **JS code splitting** —
// each section's JS ships as its own chunk and only downloads when needed.
// They still SSR (so crawlers see full content for SEO).
//
// We deliberately do NOT wrap these in `<LazyOnView>` because deferring
// the render until visible would (a) defeat SSR for SEO and (b) cause
// hydration mismatches between server (rendered) and client (placeholder).
// `<LazyOnView>` stays in the toolkit for client-only widgets.
const ProductCategories = dynamic(
  () => import('./product-categories').then((m) => m.ProductCategories),
  { loading: () => <SectionSkeleton height="md" /> },
);
const VisionMission = dynamic(
  () => import('./vision-mission').then((m) => m.VisionMission),
  { loading: () => <SectionSkeleton height="lg" /> },
);
const ProductsFoundation = dynamic(
  () => import('./products-foundation').then((m) => m.ProductsFoundation),
  { loading: () => <SectionSkeleton height="lg" /> },
);
const WhyJivo = dynamic(
  () => import('./why-jivo').then((m) => m.WhyJivo),
  { loading: () => <SectionSkeleton height="lg" /> },
);

interface HomeMainProps {
  sections: Map<string, unknown>;
  heroSlides?: HeroSlideData[];
}

export function HomeMain({ sections, heroSlides }: HomeMainProps) {
  return (
    <main>
      <HeroSection data={sections.get('hero') as HeroContent | undefined} slides={heroSlides} />
      <ProductCategories data={sections.get('categories') as CategoriesContent | undefined} />
      <VisionMission data={sections.get('vision_mission') as VisionMissionContent | undefined} />
      <ProductsFoundation
        data={sections.get('products_foundation') as ProductsFoundationContent | undefined}
      />
      <WhyJivo data={sections.get('why_jivo') as WhyJivoContent | undefined} />
    </main>
  );
}
